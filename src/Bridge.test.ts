import { Account, AccountUpdate, Bool, EcdsaSignature, EcdsaSignatureV2, Encoding, Experimental, Field, Int64, MerkleMap, Mina, PrivateKey, Provable, PublicKey, Signature, UInt64, UInt8, fetchAccount } from 'o1js'
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

    const adminUserPrivkey = Local.testAccounts[1].key
    const adminPubkey = Local.testAccounts[1];

    const normalUserPrivkey = Local.testAccounts[2].key
    const normalUserPubkey = Local.testAccounts[2]

    const validator1Privkey = Local.testAccounts[3].key
    const validator1Pubkey = Local.testAccounts[3]

    const validator2Privkey = Local.testAccounts[4].key
    const validator2Pubkey = Local.testAccounts[4]

    const validator3Privkey = Local.testAccounts[5].key
    const validator3Pubkey = Local.testAccounts[5]

    



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
    // console.log("🚀 ~ beforeAll ~ proofsEnabled:", proofsEnabled);
    // console.log("🚀 ~ beforeAll ~ userPubkey:", userPubkey.toBase58());
    // console.log("🚀 ~ beforeAll ~ userPrivkey:", userPrivkey);
    // console.log("🚀 ~ beforeAll ~ normalUserPubkey:", normalUserPubkey.toBase58());
    // console.log("🚀 ~ beforeAll ~ normalUserPrivkey:", normalUserPrivkey);
    // console.log("🚀 ~ beforeAll ~ tokenPubkey:", tokenPubkey.toBase58());
    // console.log("🚀 ~ beforeAll ~ tokenPrivkey:", tokenPrivkey);
    // console.log("🚀 ~ beforeAll ~ bridgePubkey:", bridgePubkey.toBase58());
    // console.log("🚀 ~ beforeAll ~ bridgePrivkey:", bridgePrivkey);

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
                _admin: adminPubkey,
                _minter: userPubkey,
            })
        })
        await managerTx.prove()
        await managerTx.sign([userPrivkey, managerPrivkey])
        await managerTx.send()

        let validatorManagerTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1)
            await validatorZkapp.deploy({
                _validator1: validator1Pubkey,
                _validator2: validator2Pubkey,
                _validator3: validator3Pubkey,
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
                threshold: UInt64.from(2),
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

   
    it('lock from normal user ', async () => {
        const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
        const bridgeBalance = await token.getBalanceOf(bridgePubkey);
        await fetchAccount({publicKey: tokenPubkey});
        let lockTx = await Mina.transaction(normalUserPubkey, async () => {
            await bridgeZkapp.lock(UInt64.from(5), Field.from(1), tokenPubkey);
        })
        lockTx.sign([normalUserPrivkey])
        await lockTx.prove()
        await lockTx.send()

        const afterLockBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("after lock balance:", afterLockBalance.toString());
    })

    it('lock from normal user ', async () => {
        const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
        const bridgeBalance = await token.getBalanceOf(bridgePubkey);
        await fetchAccount({publicKey: tokenPubkey});
        let lockTx = await Mina.transaction(normalUserPubkey, async () => {
            await bridgeZkapp.lock(UInt64.from(2), Field.from(1), tokenPubkey);
        })
        lockTx.sign([normalUserPrivkey])
        await lockTx.prove()
        await lockTx.send()

        const afterLockBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("after lock balance:", afterLockBalance.toString());
    })


    it('unlock from with three signature ', async () => {
        const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("balance:", normalUserBalance.toString());

        let amount = UInt64.from(10);
        const msg = [
            ...normalUserPubkey.toFields(),
            ...amount.toFields(),
            ...tokenPubkey.toFields(),
        ]

        let signature1 = Signature.create(validator1Privkey, msg);
        let signature2 = Signature.create(validator2Privkey, msg);;
        let signature3 = Signature.create(validator3Privkey, msg);;

        let unlockTx = await Mina.transaction(userPubkey, async () => {
            await bridgeZkapp.unlock(
                amount,
                normalUserPubkey,
                UInt64.from(1),
                tokenPubkey,
                Bool(true),
                validator1Pubkey,
                signature1,
                Bool(true),
                validator2Pubkey,
                signature2,
                Bool(true),
                validator3Pubkey,
                signature3,
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
    })

    it('unlock from with two signature ', async () => {
        const normalUserBalance = await token.getBalanceOf(normalUserPubkey);
        console.log("balance:", normalUserBalance.toString());

        let amount = UInt64.from(10);
        const msg = [
            ...normalUserPubkey.toFields(),
            ...amount.toFields(),
            ...tokenPubkey.toFields(),
        ]

        let signature1 = Signature.create(validator1Privkey, msg);
        let signature2 = Signature.create(validator2Privkey, msg);
        let signature3 = Signature.create(validator3Privkey, msg);;

        let unlockTx = await Mina.transaction(userPubkey, async () => {
            await bridgeZkapp.unlock(
                amount,
                normalUserPubkey,
                UInt64.from(1),
                tokenPubkey,
                Bool(true),
                validator1Pubkey,
                signature1,
                Bool(true),
                validator2Pubkey,
                signature2,
                Bool(false),
                validator3Pubkey,
                signature3,
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
    })


    it('set amount limits', async () => {
        const newMin = UInt64.from(10);
        const newMax = UInt64.from(100);
        let setAmountLimitsTx = await Mina.transaction(adminPubkey, async () => {
            await bridgeZkapp.setAmountLimits(newMin, newMax);
        })
        setAmountLimitsTx.sign([adminUserPrivkey, bridgePrivkey])
        await setAmountLimitsTx.prove()
        await setAmountLimitsTx.send()

    })

    it('set minter', async () => {
        const newMinterPrivateKey = PrivateKey.random()
        const newMinterPubKey = newMinterPrivateKey.toPublicKey();
        let setMinterTx = await Mina.transaction(adminPubkey, async () => {
            await managerZkapp.changeMinter(newMinterPubKey);
        })
        setMinterTx.sign([adminUserPrivkey])
        await setMinterTx.prove()
        await setMinterTx.send()

    })

    it('set validator', async () => {
        const newVal1Priv = PrivateKey.random()
        const newVal2Priv = PrivateKey.random()
        const newVal3Priv = PrivateKey.random()
        const newVal1Pub = newVal1Priv.toPublicKey();
        const newVal2Pub = newVal2Priv.toPublicKey();
        const newVal3Pub = newVal3Priv.toPublicKey();

        let setValidatorTx = await Mina.transaction(adminPubkey, async () => {
            await validatorZkapp.changeValidator(newVal1Pub, newVal2Pub, newVal3Pub);
        })
        setValidatorTx.sign([adminUserPrivkey])
        await setValidatorTx.prove()
        await setValidatorTx.send()

        const isValidator1 = await validatorZkapp.isValidator(newVal1Pub);
        isValidator1.assertTrue("New validator 1 is not registered");

        const isValidator2 = await validatorZkapp.isValidator(newVal2Pub);
        isValidator2.assertTrue("New validator 2 is not registered");

        const isValidator3 = await validatorZkapp.isValidator(newVal3Pub);
        isValidator3.assertTrue("New validator 3 is not registered");
        
    })

    it('set admin', async () => {
        const newAdminPrivateKey = Local.testAccounts[9].key;
        const newAdminPubKey = Local.testAccounts[9];
        let setMinterTx = await Mina.transaction(adminPubkey, async () => {
            await managerZkapp.changeAdmin(newAdminPubKey);
        })
        setMinterTx.sign([adminUserPrivkey])
        await setMinterTx.prove()
        await setMinterTx.send()

        let setMinterTx1 = await Mina.transaction(newAdminPubKey, async () => {
            await managerZkapp.changeAdmin(adminPubkey);
        })
        setMinterTx1.sign([newAdminPrivateKey])
        await setMinterTx1.prove()
        await setMinterTx1.send()
    })

    
})


