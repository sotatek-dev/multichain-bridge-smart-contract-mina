/**
 * This script can be used to interact with the Add contract, after deploying it.
 *
 * We call the update() method on the contract, create a proof and send it to the chain.
 * The endpoint that we interact with is read from your config.json.
 *
 * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
 * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
 * would send the transaction and pay the fee.
 *
 * To run locally:
 * Build the project: `$ npm run build`
 * Run with node:     `$ node build/src/interact.js <deployAlias>`.
 */
import fs from 'fs/promises';
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, UInt8, Bool, Field, Signature } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, Secp256k1, ValidatorManager, Manager } from '../index.js';


// check command line arg

const allConfig = 
{
  token: {
    privateKey: 'EKF7itnJCXSZU68eXMFw7JCy3e6UrMgeoCW288vAMzXsHo7hCW8h',
    publicKey: 'B62qqcH9gouXRJxViLxKYMrtWPUT1KkV9t8SbPpJ1sDcezPoVzvvake'
  },
  adminContract: {
    privateKey: 'EKEftTBVadbsAwQ88Mawm9VzGYec7Eyn1e8JWJQUNmpxwYAA8NGq',
    publicKey: 'B62qkw2waHGyEewF6mUvSeEX63KEaGfKJud71nxoyoqKyhbgb9rVDQw'
  },
  bridgeContract: {
    privateKey: 'EKEhLNL8Ho5BhXYSbPtJtjr4KE2kK89Zx3zVZZ7YWw4bLDn24Kf5',
    publicKey: 'B62qpCtfnEsWe2MxTwSD3QDxEUyVnG2nwk64ytx2cUj9MDFfLMRN1qo'
  },
  managerContract: {
    privateKey: 'EKFUcBPTvioAjStYpciUGewESHXpRAiN8khoReaeM5x4rL8MVYi4',
    publicKey: 'B62qmTocUPk3GP23LkQ14rb93UZ64cZRhLp2yQVewxDtZ3agN3mH3AM'
  },
  validatorManagerContract: {
    privateKey: 'EKEi6bM3LB5s9b3pB79o87FkGd6sY8nwKrNT9SRpYrTv3JkJg2rs',
    publicKey: 'B62qj1cgBH1c8q8aJqFU9Xq3W7zRq9esGTtuEJMpKRPBD8CT3nZp1s8'
  },
  validator_1: {
    privateKey: 'EKE1nnSVM3bWyqupNiqA1bP87XhqfV4Y6nLUGLAZZNiVgTEqD6Xp',
    publicKey: 'B62qkx13A9jfeebfNDNqawyVmqCAQdD4vrNdchoGG5KDCV1X9kuN5NS'
  },
  validator_2: {
    privateKey: 'EKFK7v87vUSjc2sb2TgQm2aKwJumzTc1oFebx16uBcG65JWoXu7d',
    publicKey: 'B62qjc2AF1FiHBpnm1EE3nTNDeryz5XJPkkZ66ZVE5bQAvjkJz4Tcju'
  },
  validator_3: {
    privateKey: 'EKEdHqhFVrQsZSuJAEkn2Mko3AQYjmfrV57CnzTc5VHiwVmCbzvi',
    publicKey: 'B62qqhRrtoshL2qtccvMS7CQpBVQhtYLgZhyMg6UTSQAHZxcLi9ciW5'
  },
  admin: {
    privateKey: 'EKF4K8o13ZPGov7m89d8bsDSpKWEQUw1rfsmEKnFjUQGwYYSjLLg',
    publicKey: 'B62qk9LodeoCLjsFPd6wUgzsr5dW5DSYKDfHppbqt6AZZx724mMKQmp'
  },
  minter_1: {
    privateKey: "EKDzBD67hfEP6FGteCMxQPkzLwWPvG7sdNtXprjLjuBNNgQbVCRD",
    publicKey: "B62qjEURvygCt8F1k268edeUuy4RjmBtKibhpxnQxWXSxHhb1ZX3h4q"
  },
  minter_2: {
    privateKey: 'EKEdSDp7CDcUY6KDSSWvVCUjkBJRPPFxoeN4csfqicYHS2bpZC82',
    publicKey: 'B62qkGv5mbgSXCRrYyyyzRq9qfTjK8x3KeeiuhaTssFgYGjWtvCQ56k'
  },
  minter_3: {
    privateKey: 'EKF9qYLaSzYqLpoNsm1VUpip2VkmnfzoSCLMrampVEdSV4zfMDaE',
    publicKey: 'B62qmdo5oUpCYAcoujMWzmPsyQqAuDog8gMxVoSkzBTyihkuDY8zFa1'
  }
}

let feepayerKey = PrivateKey.fromBase58(allConfig.minter_1.privateKey);



let tokenKey = PrivateKey.fromBase58(allConfig["token"].privateKey);
let adminContractKey = PrivateKey.fromBase58(allConfig["adminContract"].privateKey);
let bridgeContractKey = PrivateKey.fromBase58(allConfig["bridgeContract"].privateKey);
let managerContractKey = PrivateKey.fromBase58(allConfig["managerContract"].privateKey);
let validatorManagerContractKey = PrivateKey.fromBase58(allConfig["validatorManagerContract"].privateKey);

// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';

const network = Mina.Network({
  mina: MINAURL,
  archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);

const startTime = Date.now();


console.log('compile the contract...');
await FungibleToken.compile();
await FungibleTokenAdmin.compile();
await Bridge.compile();
await Manager.compile();
await ValidatorManager.compile();


const fee = Number(0.5) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toBase58())
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[0].toString());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[1].toString());

let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();

await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});
await fetchAccount({publicKey: tokenAddress});


const token = new FungibleToken(tokenAddress)
const adminContract = new FungibleTokenAdmin(adminContractAddress)
let bridgeContract = new Bridge(bridgeAddress)
// let managerContract = new Manager(managerAddress)
let validatorManagerContract = new ValidatorManager(validatorManagerAddress)

const validator1Privkey = PrivateKey.fromBase58(allConfig.validator_1.privateKey);
const validator2Privkey = PrivateKey.fromBase58(allConfig.validator_2.privateKey);
const validator3Privkey = PrivateKey.fromBase58(allConfig.validator_3.privateKey);
const validator1 = validator1Privkey.toPublicKey();
const validator2 = validator2Privkey.toPublicKey();
const validator3 = validator3Privkey.toPublicKey();


let amount = UInt64.from(200_000_000_000);

const msg = [
  ...validator1.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature = await Signature.create(validator1Privkey, msg);


const msg2 = [
  ...validator2.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature2 = await Signature.create(validator1Privkey, msg2);



const currentManager = await bridgeContract.manager.get();
console.log("🚀 ~ currentManager:", currentManager.toBase58())
console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());

let managerContract = new Manager(currentManager)
const minter1 = await managerContract.minter_1.get();
const minter2 = await managerContract.minter_2.get();
const minter3 = await managerContract.minter_3.get();
console.log("🚀 ~ currentManager1:", minter1.toBase58());
console.log("🚀 ~ currentManager2:", minter2.toBase58());
console.log("🚀 ~ currentManager3:", minter3.toBase58());
await fetchAccount({publicKey: feepayerAddress});
let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString())


// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await AccountUpdate.fundNewAccount(feepayerAddress, 1);
      await bridgeContract.unlock(
        amount,
        validator1,
        UInt64.from(1),
        tokenAddress,
        Bool(true),
        validator1,
        signature,
        Bool(false),
        validator2,
        signature,
        Bool(false),
        validator3,
        signature,
      );
    }
  );

  tx.sign([feepayerKey])
  await tx.prove()


  const sentTx = await tx.send();
  await sentTx.wait();
  console.log("🚀 ~ sentTx:", sentTx.hash)
} catch (err) {
  console.log(err);
}

function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
  const txnBroadcastServiceName = new URL(graphQlUrl).hostname
    .split('.')
    .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
  const networkName = new URL(graphQlUrl).hostname
    .split('.')
    .filter((item) => item === 'berkeley' || item === 'testworld')?.[0];
  if (txnBroadcastServiceName && networkName) {
    return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
  }
  return `Transaction hash: ${txnHash}`;
}
