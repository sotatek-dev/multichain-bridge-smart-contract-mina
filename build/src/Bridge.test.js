import { AccountUpdate, Bool, Encoding, Field, Mina, PrivateKey, UInt64, UInt8 } from 'o1js';
import { Bridge } from './Bridge';
import { FungibleToken, FungibleTokenAdmin } from 'mina-fungible-token';
import { Bytes256, Ecdsa, Secp256k1 } from './ecdsa/ecdsa';
const proofsEnabled = true;
const Local = await Mina.LocalBlockchain({ proofsEnabled });
Mina.setActiveInstance(Local);
describe("Bridge", () => {
    const userPrivkey = Local.testAccounts[0].key;
    const userPubkey = Local.testAccounts[0];
    const normalUserPrivkey = Local.testAccounts[2].key;
    const normalUserPubkey = Local.testAccounts[2];
    const adminContractPrivkey = PrivateKey.random();
    const adminContractPubkey = adminContractPrivkey.toPublicKey();
    const tokenPrivkey = PrivateKey.random();
    const tokenPubkey = tokenPrivkey.toPublicKey();
    const token = new FungibleToken(tokenPubkey);
    const adminContract = new FungibleTokenAdmin(adminContractPubkey);
    const symbol = 'WETH';
    const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
    const supply = UInt64.from(21000000000000);
    const lockAmount = UInt64.from(1000000000000);
    const bridgePrivkey = PrivateKey.random();
    const bridgePubkey = bridgePrivkey.toPublicKey();
    const bridgeZkapp = new Bridge(bridgePubkey);
    const SYMBOL = Encoding.stringToFields('BTC')[0];
    const DECIMALS = UInt8.from(9);
    const SUPPLY_MAX = UInt64.from(21000000000000000n);
    const AMOUNT_MINT = UInt64.from(20000000000000000n);
    const AMOUNT_DEPOSIT = UInt64.from(5000000000000000n);
    const AMOUNT_SEND = UInt64.from(1000000000n);
    const AMOUNT_WITHDRAW = UInt64.from(3000000000000000n);
    const totalSupply = UInt64.from(5000000000000000n);
    console.log("🚀 ~ beforeAll ~ proofsEnabled:", proofsEnabled);
    console.log("🚀 ~ beforeAll ~ userPubkey:", userPubkey.toBase58());
    console.log("🚀 ~ beforeAll ~ userPrivkey:", userPrivkey);
    console.log("🚀 ~ beforeAll ~ normalUserPubkey:", normalUserPubkey.toBase58());
    console.log("🚀 ~ beforeAll ~ normalUserPrivkey:", normalUserPrivkey);
    console.log("🚀 ~ beforeAll ~ tokenPubkey:", tokenPubkey.toBase58());
    console.log("🚀 ~ beforeAll ~ tokenPrivkey:", tokenPrivkey);
    console.log("🚀 ~ beforeAll ~ bridgePubkey:", bridgePubkey.toBase58());
    console.log("🚀 ~ beforeAll ~ bridgePrivkey:", bridgePrivkey);
    beforeAll(async () => {
        if (proofsEnabled) {
            await FungibleToken.compile();
            await FungibleTokenAdmin.compile();
            await Bridge.compile();
        }
        let tokenDeployTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 3);
            await adminContract.deploy({ adminPublicKey: bridgePubkey });
            await token.deploy({
                symbol: "abc",
                src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/examples/e2e.eg.ts",
            });
            await token.initialize(adminContractPubkey, UInt8.from(9), Bool(false));
        });
        tokenDeployTx.sign([userPrivkey, tokenPrivkey, adminContractPrivkey]);
        await tokenDeployTx.prove();
        await tokenDeployTx.send();
        let privateKey = Secp256k1.Scalar.random();
        let publicKey = Secp256k1.generator.scale(privateKey);
        let validators = [Field(publicKey.x.toBigInt()), Field(publicKey.y.toBigInt())];
        let bridgeTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            await bridgeZkapp.deploy({
                threshold: UInt64.from(1),
                validatorsMapRoot: new Field(0),
                minAmount: UInt64.from(2),
                maxAmount: UInt64.from(1000000000000000),
            });
        });
        await bridgeTx.prove();
        bridgeTx.sign([userPrivkey, bridgePrivkey]);
        await bridgeTx.send();
        const adminToken = await token.getAdminContract();
        console.log("🚀 ~ adminToken:", adminToken.address.toBase58());
        let mintTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            console.log("🚀 ~ mintTx ~ normalUserPubkey:", normalUserPubkey.toBase58());
            await token.mint(normalUserPubkey, supply);
        });
        mintTx.sign([userPrivkey, bridgePrivkey]);
        await mintTx.prove();
        await mintTx.send();
    });
    // it('lock from normal user ', async () => {
    //     const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
    //     console.log("balance:", normalUserBalance.toString());
    //     const bridgeBalance = await token.getBalanceOf(bridgePubkey);
    //     console.log("bridge balance:", bridgeBalance.toString());
    //     console.log("bridge sc address:", bridgePubkey.toBase58());
    //     console.log("token sc address:", tokenPubkey);
    //     console.log("adminContractPubkey sc address:", adminContractPubkey.toBase58());
    //     await fetchAccount({publicKey: tokenPubkey});
    //     let lockTx = await Mina.transaction(normalUserPubkey, async () => {
    //         // AccountUpdate.fundNewAccount(normalUserPubkey, 1);
    //         await bridgeZkapp.lock(UInt64.from(5), Field.from(1), tokenPubkey);
    //         // await token.transfer(normalUserPubkey, bridgePubkey, UInt64.from(1));
    //         // await token.burn(normalUserPubkey, UInt64.from(1));
    //     })
    //     lockTx.sign([normalUserPrivkey])
    //     await lockTx.prove()
    //     await lockTx.send()
    //     const afterLockBalance = await token.getBalanceOf(normalUserPubkey);
    //     console.log("after lock balance:", afterLockBalance.toString());
    // })
    // it('unlock from admin ', async () => {
    //     const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
    //     console.log("balance:", normalUserBalance.toString());
    //     await fetchAccount({publicKey: tokenPubkey});
    //     let lockTx = await Mina.transaction(userPubkey, async () => {
    //         // AccountUpdate.fundNewAccount(normalUserPubkey, 1);
    //         await bridgeZkapp.unlock(UInt64.from(4), normalUserPubkey , UInt64.from(1), tokenPubkey);
    //         // await token.transfer(normalUserPubkey, bridgePubkey, UInt64.from(1));
    //         // await token.burn(normalUserPubkey, UInt64.from(1));
    //     })
    //     lockTx.sign([userPrivkey, bridgePrivkey])
    //     await lockTx.prove()
    //     await lockTx.send()
    //     const afterLockBalance = await token.getBalanceOf(normalUserPubkey);
    //     console.log("after lock balance:", afterLockBalance.toString());
    //     // let privateKey = Secp256k1.Scalar.random();
    //     // let publicKey = Secp256k1.generator.scale(privateKey);
    //     // let message = Bytes32.fromString("what's up");
    //     // let message1 = Bytes32.fromString("what's upppppppppp");
    //     // let signature = Ecdsa.sign(message.toBytes(), privateKey.toBigInt());
    //     // const isValid = await bridgeZkapp.validateMsg(message1, signature, publicKey);
    //     // console.log("🚀 ~ it ~ isValid:", isValid.toString())
    //     // await bridgeZkapp.secp256k1ToPublicKey(publicKey);
    //     // // console.log("��� ~ it ~ pubkey:", pubkey.toBase58())
    //     // console.log("��� ~ it ~ publicKey:", publicKey.x.toBigInt().toString(), publicKey.y.toBigInt().toString());
    // })
    it('unlock from admin ', async () => {
        const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("balance:", normalUserBalance.toString());
        let privateKey = Secp256k1.Scalar.random();
        let publicKey = Secp256k1.generator.scale(privateKey);
        let privateKey_1 = Secp256k1.Scalar.random();
        let publicKey_1 = Secp256k1.generator.scale(privateKey_1);
        let amount = UInt64.from(3);
        let msg = Bytes256.fromString(`unlock receiver = ${normalUserPubkey.toFields} amount = ${amount.toFields} tokenAddr = ${tokenPubkey.toFields}`);
        let signature = Ecdsa.sign(msg.toBytes(), privateKey.toBigInt());
        // let setValidator = await Mina.transaction(userPubkey, async () => {
        //     await bridgeZkapp.setValidator(xKey, yKey, Bool(true));
        // });
        // setValidator.sign([userPrivkey])
        // await setValidator.prove()
        // await setValidator.send()
        let lockTx = await Mina.transaction(userPubkey, async () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey, 1);
            // await bridgeZkapp.setValidator(xKey, yKey, Bool(true));
            // await bridgeZkapp.unlock(
            //     amount,
            //     normalUserPubkey,
            //     UInt64.from(1),
            //     tokenPubkey,
            //     signature,
            //     publicKey,
            //     signature,
            //     publicKey,
            //     signature,
            //     publicKey,
            //     signature,
            //     publicKey,
            //     signature,
            //     publicKey,
            // );
            // await token.transfer(normalUserPubkey, bridgePubkey, UInt64.from(1));
            // await token.burn(normalUserPubkey, UInt64.from(1));
        });
        lockTx.sign([userPrivkey, bridgePrivkey]);
        await lockTx.prove();
        await lockTx.send();
        const check = await bridgeZkapp.isValidator(publicKey);
        console.log("��� ~ it ~ check:", check.toString());
    });
});
//# sourceMappingURL=Bridge.test.js.map