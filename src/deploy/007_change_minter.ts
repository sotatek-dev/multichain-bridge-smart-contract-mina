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
import { Bytes256, Ecdsa } from '../ecdsa/ecdsa.js';

// check command line arg

let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);

const project_alias = "env_" + deployAlias;

// parse config and private key from file
type Config = {
  deployAliases: Record<
    string,
    {
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));

let config = configJson.deployAliases[project_alias];

let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);


const allConfig = 
{
  // token: {
  //   privateKey: 'EKFJCJnfuv85kSqrNyqMxhCJzCqKYrJ9Gd6Q7Laakvh6DcoAA8D4',
  //   publicKey: 'B62qkuPGhLfrD12buqho48hSnc3DMGQ1d4ugzNjtYuRmSi5vvAjoZRz'
  // },
  // adminContract: {
  //   privateKey: 'EKFWVTP5cmdkeu3n3TEHo5jEToo2YVLiJCWR4zjbpavAJV4eSpUt',
  //   publicKey: 'B62qqY8QRCbTbUM2Va3Lzn91EZKWWFaobX5KhFmpbve4wzvgo7ZER9A'
  // },
  // bridgeContract: {
  //   privateKey: 'EKFVE4fiRtBgdkKgffRzcNHZ6GJmkg95mWEDatmJ3ZueGgZg5K4W',
  //   publicKey: 'B62qqKFZav5StzHmRkaU21Mw34CgGu5fWCsdGcCuxdgjZb3MSrxo67Q'
  // },
  // managerContract: {
  //   privateKey: 'EKEmiXywqnKC8vWXko8ktKnGbYbQqmCHfrZ7YRbKRZEr1PREcDNN',
  //   publicKey: 'B62qpTBL7K2NEYfiW5jLr4p8iY3x1kccyMETFi7ZUwFor5Viw337ivd'
  // },
  // validatorManagerContract: {
  //   privateKey: 'EKEfwksv72JHarTSZAXgeSwcZGejvRkcdVmPQ7mujtczv2gJhQU6',
  //   publicKey: 'B62qnFAsrYfqgRk8MD8F5Lbpi6RdqkEb7wqJjYhQk3NbC2mQmjcFGJ1'
  // },
  // validator_1: {
  //   privateKey: 'EKE8MzLKBQQn3v53v6JSCXHRPvrTwAB6xytnxYfpATgYnX17bMeM',
  //   publicKey: 'B62qnatDbNraYYPAnUYW1rGpS5tzXsGzLvyPebafNseYgNrHF83eu7d'
  // },
  // validator_2: {
  //   privateKey: 'EKF3PE1286RVzZNgieYeDw96LrMKc6V2szhvV2zyj2Z9qLwzc1SG',
  //   publicKey: 'B62qroF6gTiaDNBqFETV2wPWmdVxufxaQHr3gKSGqh9U4tXVYjJZsVc'
  // },
  // validator_3: {
  //   privateKey: 'EKEqLGiiuaZwAV5XZeWGWBsQUmBCXAWR5zzq2vZtyCXou7ZYwryi',
  //   publicKey: 'B62qjM9WyCn9BK2jyv6KkuLeXqiWsvaFPNtkNt9snt7U1TKxcZq9q7P'
  // }

  token: {
    privateKey: 'EKDn5QRDi16RbgWoQCbvqzo1XF4B6TDd2WmXF8r5YpYimR5NxQ5g',
    publicKey: 'B62qjM88vh9bmR24QTRqJBurdJ8pWKbuPMtmTohiDtdmQEAdPzsBrif'
  },
  adminContract: {
    privateKey: 'EKE2BwhPwhpjzRCsFQehCKV9qrLmFjV37HM5JMPpgFjoDrZWj1BX',
    publicKey: 'B62qjBb8Wh9aW66yKZQng7FiZXVtu2nQdhSXYRGS9KwL6iNnN6nhq15'
  },
  bridgeContract: {
    privateKey: 'EKF19hihcXry9QMttf719fVp56DuRB2vZySdeQ1y9BkkvWWxnJAa',
    publicKey: 'B62qmL9EHYMWJHhbLg2oVRqVJ7i9hEYx6u9qRPGRaq8iyrYFyAAiTc2'
  },
  managerContract: {
    privateKey: 'EKFJTWVcq6Qixm9s2guG2yXh7adbP9jX8ZpVYhkDf8NvhvoFadPY',
    publicKey: 'B62qqP6TrYTCXrM7p2HmrLHpP41nwgb4iykf1sdpkFCo4NJD2AxK51r'
  },
  validatorManagerContract: {
    privateKey: 'EKEeeKpgQWwcp2hGyATAgK1EshbaYiNZWfAyiheDzCXaJntLV5ma',
    publicKey: 'B62qnTKW4ogzzioZ9ApynRE8f4vjPnoFbhs4ANokSRHA7CBhRgpxCs9'
  },
  validator_1: {
    privateKey: 'EKEo6bA2EsKgHEXoqogccvX6iTwdiGZfHijyMn7xmUXj7CG5e47m',
    publicKey: 'B62qnXpFWCh3wg1ZjiJgoxYFdiwmnsMCZ313DyWFua6ZYcfSyKH1qYH'
  },
  validator_2: {
    privateKey: 'EKEMpP9tfvkH4t5HrLUnySzK16ZJMVxmCLHVgiY9LQtzfRXigxMW',
    publicKey: 'B62qk5QZLop9UQoCkj81DRNHmXVLmVn5ccRmng7RrTi4u6ChUUEvUGi'
  },
  validator_3: {
    privateKey: 'EKE7SCvSR7oDoKrNs6LFMi1XdaYhHxVqcpeUuYWZcsBHjDGZbHmS',
    publicKey: 'B62qpjFBgyNWv4RAroZTnypqMaYjhqWv7ppduHzoTHhmvwVajho6dPq'
  },
  admin: {
    privateKey: 'EKENccWLj2Tvgiuw29EeGARh4APVJHZc7d1DjMKQuHNQxpjPTPqb',
    publicKey: 'B62qpSTaJEiN9QVmaVDX8B2SmEA9nzdYrjhfaSjabXVgHTS7MQE7he7'
  },
  minter: {
    privateKey: 'EKEhzBN7hxnCnki7xqYa72vkagwC4quoANYPXtRrKwDsVznxMgvu',
    publicKey: 'B62qrCAYXUuRLg9CY9QbNRW8b7hXLkN9JY3QdNhfNmXBD2xF88JU4MH'
  }
}

let feepayerKey = PrivateKey.fromBase58(allConfig.minter.privateKey);



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


const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
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
let newMinterPubKey = PublicKey.fromBase58("B62qkkjqtrVmRLQhmkCQPw2dwhCZfUsmxCRTSfgdeUPhyTdoMv7h6b9");
let sentTx;
// compile the contract to create prover keys
await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await managerContract.changeMinter(newMinterPubKey);
    }
  );
  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey]).send();
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
