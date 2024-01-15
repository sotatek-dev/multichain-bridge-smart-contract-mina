import { Account, AccountUpdate, Encoding, Experimental, Field, Int64, Mina, PrivateKey, UInt64 } from 'o1js'
import { Bridge } from './Bridge'
import Token from './token';
import Hook from "./Hooks";

const proofsEnabled = false

describe('token bridge test', () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled })
    Mina.setActiveInstance(Local)

    const userPrivkey = Local.testAccounts[0].privateKey
    const userPubkey = Local.testAccounts[0].publicKey

    const minterPrivkey = Local.testAccounts[1].privateKey
    const minterPubkey = Local.testAccounts[1].publicKey

    const normalUserPrivkey = Local.testAccounts[2].privateKey
    const normalUserPubkey = Local.testAccounts[2].publicKey

    const hookpk = PrivateKey.random()
    const hookPub = hookpk.toPublicKey()
    const hookZkapp = new Hook(hookPub)

    const tokenPrivkey = PrivateKey.random()
    const tokenPubkey = tokenPrivkey.toPublicKey()
    const tokenZkapp = new Token(tokenPubkey)

    const bridgePrivkey = PrivateKey.random()
    const bridgePubkey = bridgePrivkey.toPublicKey()
    const bridgeZkapp = new Bridge(bridgePubkey, tokenZkapp.token.id)

    const SYMBOL = Encoding.stringToFields('BTC')[0]
    const DECIMALS = UInt64.from(9)
    const SUPPLY_MAX = UInt64.from(21_000_000_000_000_000n)
    const AMOUNT_MINT = UInt64.from(20_000_000_000_000_000n)
    const AMOUNT_DEPOSIT = UInt64.from(5_000_000_000_000_000n)
    const AMOUNT_SEND = UInt64.from(1_000_000_000n)
    const AMOUNT_WITHDRAW = UInt64.from(3_000_000_000_000_000n)
    const totalSupply = UInt64.from(5_000_000_000_000_000n)

    beforeAll(async () => {
        if (proofsEnabled) {
            await Hook.compile()
            await Token.compile()
            await Bridge.compile()
        }
    })

    it('test', async () => {
        let tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey)
            hookZkapp.deploy()
        })
        await tx.prove()
        tx.sign([userPrivkey, hookpk])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(userPubkey)
            hookZkapp.initialize(userPubkey);
        })
        await tx.prove()
        tx.sign([userPrivkey, hookpk])
        await tx.send()


        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.deploy();
            tokenZkapp.initialize(hookPub, totalSupply);
        })
        await tx.prove()
        tx.sign([userPrivkey, tokenPrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.mint(normalUserPubkey, AMOUNT_DEPOSIT);
        })
        await tx.prove()
        tx.sign([userPrivkey, tokenPrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.mint(userPubkey, AMOUNT_DEPOSIT);
        })
        await tx.prove()
        tx.sign([userPrivkey, tokenPrivkey])
        await tx.send()


        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(userPubkey);
            tokenZkapp.lock(Field.from(100), bridgePubkey, UInt64.one);
        })
        await tx.prove()
        tx.sign([userPrivkey, tokenPrivkey])
        await tx.send()

        tx = await Mina.transaction(normalUserPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            tokenZkapp.lock(Field.from(100), bridgePubkey, UInt64.one);
        })
        await tx.prove()
        tx.sign([normalUserPrivkey, tokenPrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            AccountUpdate.fundNewAccount(userPubkey, 1);
            bridgeZkapp.deploy();
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        })
        await tx.prove()
        tx.sign([userPrivkey, bridgePrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            // AccountUpdate.fundNewAccount(userPubkey, 1);
            bridgeZkapp.setMinter(userPubkey);
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        })
        await tx.prove()
        tx.sign([userPrivkey, bridgePrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            // AccountUpdate.fundNewAccount(userPubkey, 1);
            bridgeZkapp.setMaxAmount(UInt64.from(10000));
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        })
        await tx.prove()
        tx.sign([userPrivkey, bridgePrivkey])
        await tx.send()

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(normalUserPubkey);
            // AccountUpdate.fundNewAccount(userPubkey, 1);
            bridgeZkapp.setMinAmount(UInt64.from(100));
            tokenZkapp.approveUpdate(bridgeZkapp.self);
        })
        await tx.prove()
        tx.sign([userPrivkey, bridgePrivkey])
        await tx.send()

        const unlockAmount = UInt64.from(103)

        tx = await Mina.transaction(userPubkey, () => {
            // AccountUpdate.fundNewAccount(userPubkey, 1);
            const callback = Experimental.Callback.create(bridgeZkapp, "unlock", [tokenPubkey, unlockAmount, userPubkey, unlockAmount])
            tokenZkapp.mintToken(userPubkey, unlockAmount, callback)
        })
        await tx.prove()
        tx.sign([userPrivkey])
        await tx.send()


    })
})
