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

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);

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
    privateKey: 'EKEcoMWrsTBfoGnathz7BRYbUNET7QRvSWUd2Z4VNU7cgKshCLsZ',
    publicKey: 'B62qqKNnNRpCtgcBexw5khZSpk9K2d9Z7Wzcyir3WZcVd15Bz8eShVi'
  },
  adminContract: {
    privateKey: 'EKDqtw3oZcjNzZi9tBVyRB3RcXeCwXRi7CLyaZHfW9Zf1i3bmEWm',
    publicKey: 'B62qoee93ggvKcm9t9fGVnEMLFbLtAtL2NzKoZLNGEFG5hWB6wyEXZB'
  },
  bridgeContract: {
    privateKey: 'EKF3KdEnYJui1dhRgLTfiQAVUVddUybU1e9bZnpYYDGFVwhWWZH3',
    publicKey: 'B62qpeJGDMHp36rqyvfxHmjmHEZk7a7ryq2nCFFHkGHRMqXqkq5F2VS'
  },
  managerContract: {
    privateKey: 'EKE5q5WTPDaBdRghfwcfEF2HeS7Sf4S1QQwspTUM1Szd72bHmdQo',
    publicKey: 'B62qpzVF3Kv2r6bzUwrKDdUsgjduEQUYwdpy7yQCxq5MPBGr8A1cB8x'
  },
  validatorManagerContract: {
    privateKey: 'EKDoyqLeJfSKWFqL6JUV47uq3vW96egaTJPJPoSmNMrMrTCSVmnh',
    publicKey: 'B62qpF6RVH1huSrXjfcxhNhnSNK3f8ZxgC2fQ2rTok4LSxYZKGBEz79'
  },
  validator_1: {
    privateKey: 'EKE13it8YUCmD59RbCjumdnt7C155zVGJvCH6gsFUgMh3nXY5Ev4',
    publicKey: 'B62qkQ96hyWcc5tyjhN2Qda5X2DfFgVC14ELLAaQTjkpQdveZExK5H9'
  },
  validator_2: {
    privateKey: 'EKETXTSiv6DvSUQErrz8t1AEtsgoT6j2uCAP82HryqjPfNPmDSoE',
    publicKey: 'B62qnqGrRCgzsRTLjvWsaaKuoWmiShmZhJgZ5Km1oef5R4gNh2ZefWw'
  },
  validator_3: {
    privateKey: 'EKF2w9AivRXgJefeBV4wErmgBKUYChDwhnK46YBkVwbhEvviYbeg',
    publicKey: 'B62qq8614KZCuDM7cVScqBLPiLmqLrhVxBt9mRwy95aCZDsbCjfQx8v'
  }
}


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
let receiver = PublicKey.fromBase58("B62qkkjqtrVmRLQhmkCQPw2dwhCZfUsmxCRTSfgdeUPhyTdoMv7h6b9");
const msg = [
  ...receiver.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature = await Signature.create(validator1Privkey, msg);

let sentTx;
// compile the contract to create prover keys
await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
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
