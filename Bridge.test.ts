import { equal, rejects } from "node:assert"
import { describe, it } from "node:test"
import {
  AccountUpdate,
  AccountUpdateForest,
  Bool,
  DeployArgs,
  Encoding,
  fetchAccount,
  Int64,
  method,
  Mina,
  Permissions,
  PrivateKey,
  PublicKey,
  Signature,
  SmartContract,
  State,
  state,
  UInt64,
  UInt8,
  VerificationKey,
} from "o1js"
import {
  Bridge,
  FungibleToken,
  FungibleTokenAdmin,
  FungibleTokenAdminBase,
  FungibleTokenAdminDeployProps,
  FungibleTokenErrors,
  Manager,
  ValidatorManager,
} from "./index.js"

import * as trace from 'autrace';

// Initialize AUTrace
const autrace = new trace.AUTrace();

const proofsEnabled = false
if (!proofsEnabled) console.log("Skipping proof generation in tests.")

const Local = await Mina.LocalBlockchain({
  proofsEnabled,
  // enforceTransactionLimits: false,
})
Mina.setActiveInstance(Local)

describe("bridge integration", async () => {
  const userPrivkey = Local.testAccounts[0].key;
  const userPubkey = Local.testAccounts[0];

  const adminTokenPrivkey = Local.testAccounts[6].key;
  const adminTokenPubkey = Local.testAccounts[6];


  const minter2 = Local.testAccounts[7].key;
  const minter2Pub = Local.testAccounts[7];

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

  describe("Deploy", async () => {
    if (proofsEnabled) {
      await FungibleToken.compile()
      await FungibleTokenAdmin.compile()
      await Bridge.compile()
    }

    let tokenDeployTx = await Mina.transaction(userPubkey, async () => {
      AccountUpdate.fundNewAccount(userPubkey, 3)
      await adminContract.deploy({ adminPublicKey: userPubkey })
      await token.deploy({
        symbol: "abc",
        src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/examples/e2e.eg.ts",
        allowUpdates: true
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
        _minter_1: userPubkey,
        _minAmount: UInt64.from(2),
        _maxAmount: UInt64.from(1_000_000_000_000_000),
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
        validatorPub: validatorManagerPubkey,
        threshold: UInt64.from(2),
        manager: managerPubkey,

      });
    })
    await bridgeTx.prove()
    bridgeTx.sign([userPrivkey, bridgePrivkey])
    await bridgeTx.send()


    let setBridgePubTx = await Mina.transaction(userPubkey, async () => {
      await adminContract.setBridgePublicKey(
        bridgePubkey
      );
    })
    await setBridgePubTx.prove()
    setBridgePubTx.sign([userPrivkey])
    await setBridgePubTx.send()

    it('unlock from with three signature ', async () => {

      // Initialize contracts for tracking
      autrace.initializeContracts([bridgeZkapp, token, adminContract, managerZkapp, validatorZkapp]);

      // Optional: Get contract analysis
      const contractAnalysis = autrace.getContractAnalysis();
      autrace.clearTransactionState();
      const nonceTx = UInt64.from(0);
      console.log("🚀 ~ it ~ nonceTx:", nonceTx)
      const DOMAIN = Encoding.stringToFields("MINA_BRIDGE")[0];
      const scAddress = bridgePubkey;
      console.log("adminContractPubkey: ", adminContractPubkey.toBase58());
      console.log("userPubkey: ", userPubkey.toBase58());
      console.log("bridgePubkey: ", bridgePubkey.toBase58());
      console.log("tokenPubkey: ", tokenPubkey.toBase58());

      if (!DOMAIN) {
        throw new Error("DOMAIN is undefined");
      }

      let amount = UInt64.from(10);
      const msg = [
        ...DOMAIN.toFields(),
        ...nonceTx.toFields(),
        ...scAddress.toFields(),
        ...normalUserPubkey.toFields(),
        ...amount.toFields(),
        ...tokenPubkey.toFields(),
      ]

      let signature1 = Signature.create(validator1Privkey, msg);
      let signature2 = Signature.create(validator2Privkey, msg);
      let signature3 = Signature.create(validator3Privkey, msg);




      let unlockTx = await Mina.transaction({
        sender: userPubkey,
      }, async () => {
        await AccountUpdate.fundNewAccount(userPubkey, 1)
        await bridgeZkapp.unlock(
          amount,
          normalUserPubkey,
          UInt64.from(1),
          tokenPubkey,
          nonceTx,
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
      unlockTx.sign([userPrivkey])
      await unlockTx.prove()

      const accountUpdates = JSON.parse(unlockTx.toJSON()).accountUpdates;
      console.log("🚀 ~ it ~ accountUpdates:", accountUpdates)
      console.log("🚀 ~ it ~ accountUpdates:", accountUpdates.length)

      const sendState = autrace.getTransactionState(await unlockTx.send());
      const history = autrace.getStateHistory();
      // Initialize visualizer with history
      const visualizer = new trace.AUVisualizer(history);

      // Generate different visualization formats
      await visualizer.generateMarkdownFile('output.md')

      // await unlockTx.send()

      const nonce_ = await bridgeZkapp.nonce.get();
      console.log("🚀 ~ it ~ nonce_:", nonce_.toString())
    });
  })
})
