import { Account, AccountUpdate, Bool, EcdsaSignature, EcdsaSignatureV2, Encoding, Experimental, Field, Int64, MerkleMap, Mina, PrivateKey, Provable, PublicKey, UInt64, UInt8, fetchAccount } from 'o1js'
import { Bridge } from './Bridge'
import { FungibleToken, FungibleTokenAdmin } from 'mina-fungible-token';
import { Bytes256, ecdsa, Ecdsa, keccakAndEcdsa, Secp256k1 } from './ecdsa/ecdsa';
import { ValidatorManager } from './ValidatorManager';
import { Manager } from './Manager';
const proofsEnabled = false

const Local = await Mina.LocalBlockchain({ proofsEnabled })
Mina.setActiveInstance(Local)


describe("Bridge", () => {

    const userPrivkey = Local.testAccounts[0].key;
    const userPubkey = Local.testAccounts[0];

    const normalUserPrivkey = Local.testAccounts[2].key
    const normalUserPubkey = Local.testAccounts[2]

    const validatorPrivateKey1 = Secp256k1.Scalar.random();
    const validatorPublicKey1 = Secp256k1.generator.scale(validatorPrivateKey1);

    const validatorPrivateKey2 = Secp256k1.Scalar.random();
    const validatorPublicKey2 = Secp256k1.generator.scale(validatorPrivateKey2);

    const validatorPrivateKey3 = Secp256k1.Scalar.random();
    const validatorPublicKey3 = Secp256k1.generator.scale(validatorPrivateKey3);

    const validatorPrivateKeyGen = Secp256k1.Scalar.from(BigInt('123456789012345678901234567890123456789'));
    const validatorPublicKeyGen = Secp256k1.generator.scale(validatorPrivateKeyGen);
    console.log("🚀 ~ describe ~ validatorPublicKeyGen:", validatorPublicKeyGen)
    console.log("🚀 ~ describe ~ validatorPublicKeyGen x :", validatorPublicKeyGen.x.toBigInt().toString());
    console.log("🚀 ~ describe ~ validatorPublicKeyGen y :", validatorPublicKeyGen.y.toBigInt().toString());
    

    const x1 = Field.from(validatorPublicKey1.x.toBigInt().toString());
    const y1 = Field.from(validatorPublicKey1.y.toBigInt().toString());

    let x2 = Field.from(validatorPublicKey2.x.toBigInt().toString());
    let y2 = Field.from(validatorPublicKey2.y.toBigInt().toString());

    let x3 = Field.from(validatorPublicKey3.x.toBigInt().toString());
    let y3 = Field.from(validatorPublicKey3.y.toBigInt().toString());

    const adminContractPrivkey = PrivateKey.random()
    const adminContractPubkey = adminContractPrivkey.toPublicKey()
    const tokenPrivkey = PrivateKey.random()
    const tokenPubkey = tokenPrivkey.toPublicKey()

    const token = new FungibleToken(tokenPubkey);
    const adminContract = new FungibleTokenAdmin(adminContractPubkey);
    const validatorManagerPrivkey = PrivateKey.random()
    const validatorManagerPubkey = validatorManagerPrivkey.toPublicKey()
    const validatorZkapp = new ValidatorManager(validatorManagerPubkey);

    const managerPrivkey = PrivateKey.random();
    const managerPubkey = managerPrivkey.toPublicKey()
    const managerZkapp = new Manager(managerPubkey); 


    const symbol = 'WETH';
    const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
    const supply = UInt64.from(21_000_000_000_000)
    const lockAmount = UInt64.from(1_000_000_000_000)

    const bridgePrivkey = PrivateKey.random()
    const bridgePubkey = bridgePrivkey.toPublicKey()
    const bridgeZkapp = new Bridge(bridgePubkey)

    const SYMBOL = Encoding.stringToFields('BTC')[0]
    const DECIMALS = UInt8.from(9)
    const SUPPLY_MAX = UInt64.from(21_000_000_000_000_000n)
    const AMOUNT_MINT = UInt64.from(20_000_000_000_000_000n)
    const AMOUNT_DEPOSIT = UInt64.from(5_000_000_000_000_000n)
    const AMOUNT_SEND = UInt64.from(1_000_000_000n)
    const AMOUNT_WITHDRAW = UInt64.from(3_000_000_000_000_000n)
    const totalSupply = UInt64.from(5_000_000_000_000_000n)
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
            await FungibleToken.compile()
            await FungibleTokenAdmin.compile()
            await Bridge.compile()
        }
        
        let tokenDeployTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 3)
            await adminContract.deploy({ adminPublicKey: bridgePubkey })
            await token.deploy({
                symbol: "abc",
                src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/examples/e2e.eg.ts",
            })
            await token.initialize(
                adminContractPubkey,
                UInt8.from(9),
                Bool(false),
            )
        })
        
        tokenDeployTx.sign([userPrivkey, tokenPrivkey, adminContractPrivkey])
        await tokenDeployTx.prove();
        await tokenDeployTx.send()

        let managerTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1)
            await managerZkapp.deploy({
                _admin: userPubkey,
                _minter: userPubkey,
            })
        })
        await managerTx.prove()
        await managerTx.sign([userPrivkey, managerPrivkey])
        await managerTx.send()

        let validatorManagerTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1)
            await validatorZkapp.deploy({
                _val1X: x1,
                _val1Y: y1,
                _val2X: x2,
                _val2Y: y2,
                _val3X: x3,
                _val3Y: y3,
                _manager: managerPubkey,
            })
        })

        await validatorManagerTx.prove()
        await validatorManagerTx.sign([userPrivkey, validatorManagerPrivkey])
        await validatorManagerTx.send()
        
        
        let bridgeTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1)
            await bridgeZkapp.deploy({
                minAmount: UInt64.from(2),
                maxAmount: UInt64.from(1_000_000_000_000_000),
                validatorPub: validatorManagerPubkey,
                threshold: UInt64.from(1),
                manager: managerPubkey,
                
            });
        })
        await bridgeTx.prove()
        bridgeTx.sign([userPrivkey, bridgePrivkey])
        await bridgeTx.send()
        
        const adminToken = await token.getAdminContract();
        console.log("🚀 ~ adminToken:", adminToken.address.toBase58())
        
        let mintTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            console.log("🚀 ~ mintTx ~ normalUserPubkey:", normalUserPubkey.toBase58())
            await token.mint(normalUserPubkey, supply)
        })
        mintTx.sign([userPrivkey, bridgePrivkey])
        await mintTx.prove()
        await mintTx.send()
    })

   
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
        // let publicKey_1 = Secp256k1.from({
        //     x: 1,
        //     y: 1,
        // });

        // console.log("publicKey_1:", publicKey_1);

        let amount = UInt64.from(10);

        let msg = Bytes256.fromString(`unlock receiver = ${normalUserPubkey.toFields} amount = ${amount.toFields} tokenAddr = ${tokenPubkey.toFields}`);

        let signature = Ecdsa.sign(msg.toBytes(), validatorPrivateKey1.toBigInt());
        let signature1 = Ecdsa.sign(msg.toBytes(), privateKey_1.toBigInt());

        let unlockTx = await Mina.transaction(userPubkey, async () => {
            // AccountUpdate.fundNewAccount(userPubkey, 1);
            await bridgeZkapp.unlock(
                amount,
                normalUserPubkey,
                UInt64.from(1),
                tokenPubkey,
                Bool(true),
                signature,
                validatorPublicKey1,
                Bool(false),
                signature,
                validatorPublicKey1,
                Bool(false),
                signature,
                validatorPublicKey1,
            );
        })
        unlockTx.sign([userPrivkey, bridgePrivkey])
        await unlockTx.prove()
        await unlockTx.send()

        const beforeLockBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("before lock balance:", beforeLockBalance.toString());


        let lockTx = await Mina.transaction(normalUserPubkey, async () => {
            await bridgeZkapp.lock(UInt64.from(5), Field.from(1), tokenPubkey);
        })
        lockTx.sign([normalUserPrivkey])
        await lockTx.prove()
        await lockTx.send()

        const afterLockBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("after lock balance:", afterLockBalance.toString());

        // const check = await validatorZkapp.isValidator(publicKey_1)
        // console.log("��� ~ it ~ check:", check.toString());
    })

    
})


