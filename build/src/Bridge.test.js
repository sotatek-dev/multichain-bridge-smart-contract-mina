import { AccountUpdate, Encoding, Experimental, Field, Mina, PrivateKey, UInt64 } from 'o1js';
import { Bridge } from './Bridge';
import Token from './token';
import Hook from "./Hooks";
const proofsEnabled = false;
describe('token bridge test', () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    const userPrivkey = Local.testAccounts[0].privateKey;
    const userPubkey = Local.testAccounts[0].publicKey;
    const configuratorPrivkey = Local.testAccounts[1].privateKey;
    const configuratorPubkey = Local.testAccounts[1].publicKey;
    const normalUserPrivkey = Local.testAccounts[2].privateKey;
    const normalUserPubkey = Local.testAccounts[2].publicKey;
    const hookpk = PrivateKey.random();
    const hookPub = hookpk.toPublicKey();
    const hookZkapp = new Hook(hookPub);
    const tokenPrivkey = PrivateKey.random();
    const tokenPubkey = tokenPrivkey.toPublicKey();
    const tokenZkapp = new Token(tokenPubkey);
    const bridgePrivkey = PrivateKey.random();
    const bridgePubkey = bridgePrivkey.toPublicKey();
    const bridgeZkapp = new Bridge(bridgePubkey, tokenZkapp.token.id);
    const SYMBOL = Encoding.stringToFields('BTC')[0];
    const DECIMALS = UInt64.from(9);
    const SUPPLY_MAX = UInt64.from(21000000000000000n);
    const AMOUNT_MINT = UInt64.from(20000000000000000n);
    const AMOUNT_DEPOSIT = UInt64.from(5000000000000000n);
    const AMOUNT_SEND = UInt64.from(1000000000n);
    const AMOUNT_WITHDRAW = UInt64.from(3000000000000000n);
    const totalSupply = UInt64.from(5000000000000000n);
    beforeAll(async () => {
        if (proofsEnabled) {
            await Hook.compile();
            await Token.compile();
            await Bridge.compile();
        }
        let tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            hookZkapp.deploy();
        });
        await tx.prove();
        tx.sign([userPrivkey, hookpk]);
        await tx.send();
        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(userPubkey)
            hookZkapp.initialize(userPubkey);
        });
        await tx.prove();
        tx.sign([userPrivkey, hookpk]);
        await tx.send();
        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.deploy();
            tokenZkapp.initialize(hookPub, totalSupply);
        });
        await tx.prove();
        tx.sign([userPrivkey, tokenPrivkey]);
        await tx.send();
        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.mint(normalUserPubkey, AMOUNT_DEPOSIT);
        });
        await tx.prove();
        tx.sign([userPrivkey, tokenPrivkey]);
        await tx.send();
        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.mint(userPubkey, AMOUNT_DEPOSIT);
        });
        await tx.prove();
        tx.sign([userPrivkey, tokenPrivkey]);
        await tx.send();
        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            AccountUpdate.fundNewAccount(userPubkey, 1);
            bridgeZkapp.deploy();
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        });
        await tx.prove();
        tx.sign([userPrivkey, bridgePrivkey]);
        await tx.send();
        // tx = await Mina.transaction(userPubkey, () => {
        //     // AccountUpdate.fundNewAccount(normalUserPubkey);
        //     bridgeZkapp.firstInitialize(userPubkey);
        //     tokenZkapp.approveUpdate(bridgeZkapp.self);
        // })
        // await tx.prove()
        // tx.sign([userPrivkey, bridgePrivkey])
        // await tx.send()
    });
    it('set configurator success', async () => {
        console.log(userPubkey.toBase58());
        const minterr = await bridgeZkapp.minter.get();
        console.log(minterr.toBase58());
        let tx = await Mina.transaction(userPubkey, async () => {
            bridgeZkapp.setConfigurator(configuratorPubkey);
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        });
        await tx.prove();
        tx.sign([userPrivkey, bridgePrivkey]);
        await tx.send();
    });
    it('set minAmount', async () => {
        const maxAMount = bridgeZkapp.maxAmount.get();
        console.log(maxAMount.toString());
        let tx = await Mina.transaction(configuratorPubkey, async () => {
            bridgeZkapp.setMinAmount(UInt64.from(1000));
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        });
        await tx.prove();
        tx.sign([configuratorPrivkey, bridgePrivkey]);
        await tx.send();
        const min = await bridgeZkapp.minAmount.get();
        console.log(min.toString());
    });
    it('set maxAmount', async () => {
        let tx = await Mina.transaction(configuratorPubkey, async () => {
            bridgeZkapp.setMaxAmount(UInt64.from(100000000000));
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        });
        await tx.prove();
        tx.sign([configuratorPrivkey, bridgePrivkey]);
        await tx.send();
        const max = await bridgeZkapp.maxAmount.get();
        console.log(max.toString());
    });
    it('set minAmount failed', async () => {
        const maxAMount = bridgeZkapp.maxAmount.get();
        console.log(maxAMount.toString());
        let tx = await Mina.transaction(configuratorPubkey, () => {
            bridgeZkapp.setMinAmount(UInt64.from(1000000000001));
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        });
        await tx.prove();
        tx.sign([configuratorPrivkey, bridgePrivkey]);
        await tx.send();
        const min = await bridgeZkapp.minAmount.get();
        console.log(min.toString());
    });
    it('lock from normal user ', async () => {
        const lockAmount = UInt64.from(100);
        const tx = await Mina.transaction(normalUserPubkey, () => {
            const callback = Experimental.Callback.create(bridgeZkapp, "checkMinMax", [lockAmount]);
            tokenZkapp.lock(Field.from(100), bridgePubkey, callback);
        });
        await tx.prove();
        tx.sign([normalUserPrivkey]);
        await tx.send();
    });
    // it('unlock from owner ', async () => {
    //     const unlockAmount = UInt64.from(1000001);
    //     const tx = await Mina.transaction(userPubkey, () => {
    //         // AccountUpdate.fundNewAccount(userPubkey, 1);
    //         const callback = Experimental.Callback.create(bridgeZkapp, "unlock", [tokenPubkey, unlockAmount, userPubkey, unlockAmount])
    //         tokenZkapp.mintToken(userPubkey, unlockAmount, callback)
    //     })
    //     await tx.prove()
    //     tx.sign([userPrivkey])
    //     await tx.send()
    //
    // })
    //
    // it('unlock from normal user ', async () => {
    //     const unlockAmount = UInt64.from(1000001);
    //     const tx = await Mina.transaction(normalUserPubkey, () => {
    //         // AccountUpdate.fundNewAccount(userPubkey, 1);
    //         const callback = Experimental.Callback.create(bridgeZkapp, "unlock", [tokenPubkey, unlockAmount, userPubkey, unlockAmount])
    //         tokenZkapp.mintToken(normalUserPubkey, unlockAmount, callback)
    //     })
    //     await tx.prove()
    //     tx.sign([normalUserPrivkey])
    //     await tx.send()
    //
    // })
});
//# sourceMappingURL=Bridge.test.js.map