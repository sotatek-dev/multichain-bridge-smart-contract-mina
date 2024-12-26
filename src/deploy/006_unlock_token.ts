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
    privateKey: 'EKEuM539ELpAFgkyCnmparyYHJky5UXffB3HGexShiB9XhMwsXrX',
    publicKey: 'B62qkWzVREU1d9NNzu4Whnve6htA9Y9nnUUf4hbqUbMcBhhVmoQ738S'
  },
  adminContract: {
    privateKey: 'EKErGuUaYJzRN5iDSUKSVFvUoMrwZxnnNc5dcfcsFiZcppgpZ3xa',
    publicKey: 'B62qjYkw4wAkxsS27sKTQNRmuj3SoocgaezTmGKv5381Hrs53QzHU2q'
  },
  bridgeContract: {
    privateKey: 'EKFXhsvbiAn8XGP3GQvsH5xsKQnfAZauezcGEMGQN5ZpLzvcB3Es',
    publicKey: 'B62qqUmzvZs1iJwUPm2A6HgZbVRkqTojQuVWPyGhTwC2q1XiZpbAght'
  },
  managerContract: {
    privateKey: 'EKEKZmmFrb7jGPYZb9eDDVmCABzp52fVkjjMbyirKTLZr7HuKfpF',
    publicKey: 'B62qmicwXA4uwms8Zd25128oaUUnXYjUNVFFgzatBH8KkU7NLg8EjMA'
  },
  validatorManagerContract: {
    privateKey: 'EKELBrnWTorisipsP2e9tq4fCY6ETpJY6VZ1oBYVtUZCTMirMVrM',
    publicKey: 'B62qnN6FBjCGi4n5WGFfZ21aojvSEzm4x2Ac2CYhfkmhAgkJe2G8bRt'
  },
  validator_1: {
    privateKey: 'EKEUhvRE34hiXeBJ8FyCXioeiVCEDpjhz72i1dTKy5pVpdufqXFA',
    publicKey: 'B62qmfFaPCjyBirroHhVQsAN9d39AEhA5CGengTLPuvxiemd1kTEGYF'
  },
  validator_2: {
    privateKey: 'EKEKjmv8AYamB9Yhr9AYYz8jfNAov37oJE5wg9tTxmYjsWFEpXby',
    publicKey: 'B62qnUPXfLSG7wg1ZW3qQDkQNyhFzyDZHeMiuvYNF991xL5iZATGyvJ'
  },
  validator_3: {
    privateKey: 'EKFQZ7GMWe9GhpWoZnRAFtweLsEbbyUugF8TUz8PwFGrFfiUftZ9',
    publicKey: 'B62qpo9BKd8p95zrGCcL2sd6sGe6Umjq4PEk5EDVM551vovQMT8dUdb'
  },
  admin: {
    privateKey: 'EKDmhptfKxFbLrsY8mfWYLMDeMaX95Yxs2wVWd7fEBjc8eBaQ5f7',
    publicKey: 'B62qqEBYiYEDmzdUXAtzJDdDqxuKqhU4N4cMV89wnXcG2DLN9dCJfJy'
  },
  minter_1: {
    privateKey: 'EKFQWW89p2oVCd8yfM5SYVUGCiSMAByQ3yWzegLVz2cvcqMPJXgQ',
    publicKey: 'B62qpsijHYn2VGmLPHMQiGcxtwEin1FhJzXqdQwN3wg5otxqLXZGd8E'
  },
  minter_2: {
    privateKey: 'EKFM1HgDFrZXjAasv4sJXCGNR82F6FhFaFDvkCk4Xm3cHstKCjJn',
    publicKey: 'B62qrRLPD8S2tUgnBm3uYQnt8eaH45fikDyFGPGLSr3xUazuUaw1ro6'
  },
  minter_3: {
    privateKey: 'EKFcYMacnWeAsxHCpfgjNdBerrEfYeN966BffNa7atrWiJVhZc3L',
    publicKey: 'B62qozSfYv6Aahpjd5ZxEWrfrfQNP9TQgB1P3vKoZH8Qy6FFTsBiWuV'
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


const token = new FungibleToken(tokenAddress)
const adminContract = new FungibleTokenAdmin(adminContractAddress)
let bridgeContract = new Bridge(bridgeAddress)
let managerContract = new Manager(managerAddress)
let validatorManagerContract = new ValidatorManager(validatorManagerAddress)

await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});


const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(21_000_000_000_000)


const validator1Privkey = PrivateKey.fromBase58(allConfig.validator_1.privateKey);
const validator2Privkey = PrivateKey.fromBase58(allConfig.validator_2.privateKey);
const validator3Privkey = PrivateKey.fromBase58(allConfig.validator_3.privateKey);
const validator1 = validator1Privkey.toPublicKey();
const validator2 = validator2Privkey.toPublicKey();
const validator3 = validator3Privkey.toPublicKey();


let amount = UInt64.from(200_000_000_000);

// let receiver = PublicKey.fromBase58("B62qmHMUwiyNfv81NNTumW7Hv8SfRAGLXceGK3ZpyzXgmg2FLqmVhmA");
let receiver = PublicKey.fromBase58("B62qkkjqtrVmRLQhmkCQPw2dwhCZfUsmxCRTSfgdeUPhyTdoMv7h6b9");
const msg = [
  ...receiver.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature = await Signature.create(validator1Privkey, msg);

const currentManager = await bridgeContract.manager.get();
console.log("🚀 ~ currentManager:", currentManager.toBase58())
console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());

let sentTx;
// compile the contract to create prover keys
await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await AccountUpdate.fundNewAccount(feepayerAddress, 1);
      await bridgeContract.unlock(
        amount,
        receiver,
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

  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey, bridgeContractKey]).send();
} catch (err) {
  console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();

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
