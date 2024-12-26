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
    privateKey: 'EKEFUsGAPWmhjwiKWq4vbewQBmQSWSAo3diKWYYf5Ss9Ss3ZmAi5',
    publicKey: 'B62qmhCKWHDEK6Pr5AMH55J8xe8HSh9ekMDYiT6hNP8PjkoCCDHYDSB'
  },
  managerContract: {
    privateKey: 'EKFUKpR5Nbj82QQHEZQ2qQs45ujNqyQiG1LFnGYVKpgVxi2ErdLx',
    publicKey: 'B62qriVASqb3Vm4ryqRPRVhQEWY5CivSiQQdNNbkLrVrfL8EoHM7gz6'
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
  minter_1: {
    privateKey: 'EKENccWLj2Tvgiuw29EeGARh4APVJHZc7d1DjMKQuHNQxpjPTPqb',
    publicKey: 'B62qpSTaJEiN9QVmaVDX8B2SmEA9nzdYrjhfaSjabXVgHTS7MQE7he7'
  },
  minter_2: {
    privateKey: 'EKF4xJTw5BMi6dCtT9PbHQzkJSbG7vrVyXTeeSBJXJK9xxU79Si9',
    publicKey: 'B62qmzvufvs3be28v4imYdL64WfcpYEMe7PXSfHEjaWeGgoFTPQY3oa'
  },
  minter_3: {
    privateKey: 'EKEMubrJwi8zYc1gP52zYRyFPC1jgpBqXqL92ScqDM6WyY5L3D71',
    publicKey: 'B62qnU7YupXnx7ByiV6GYfwPiMcnZQe1SCVtTdG293cwnTZQpLiudzD'
  }
}

let feepayerKey = PrivateKey.fromBase58(allConfig.admin.privateKey);



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

let managerAddress = PublicKey.fromBase58("B62qq6tiEWDqZivcv36WCkR5kFHH8GVqd5wKh1aREAPzCputfuuEfgn")
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();



let bridgeAddress = bridgeContractKey.toPublicKey();

await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});
await fetchAccount({publicKey: managerAddress});
let bridgeContract = new Bridge(bridgeAddress)
const currentManager = await bridgeContract.manager.get();
console.log("🚀 ~ currentManager:", currentManager.toBase58())
console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());

let managerContract = new Manager(managerAddress)
const minter1 = await managerContract.minter_1.get();
const minter2 = await managerContract.minter_2.get();
const minter3 = await managerContract.minter_3.get();
console.log("🚀 ~ currentManager1:", minter1.toBase58());
console.log("🚀 ~ currentManager2:", minter2.toBase58());
console.log("🚀 ~ currentManager3:", minter3.toBase58());


let newManager = PublicKey.fromBase58("B62qqj2FBQFEZrUZ2r5et37wDKDRShZ9jZVRPfjs92vik2UkW8G6niR");
let sentTx;
await fetchAccount({publicKey: feepayerAddress});
try {
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await bridgeContract.changeManager(newManager);
    }
  );
  
  console.log('generating proof...');
  const proof = await tx.prove();
  console.log('proof generated successfully');
  
  console.log('signing transaction...');
  const signedTx = await tx.sign([feepayerKey, bridgeContractKey, managerContractKey]);
  
  console.log('sending transaction...');
  sentTx = await signedTx.send();
} catch (err) {
  console.error('Transaction failed:', err);
  if (err instanceof Error) {
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
  }
  process.exit(1);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();


const currentManagerSC = await bridgeContract.manager.get();
console.log("🚀 ~ currentManagerSC:", currentManagerSC.toBase58())
console.log("🚀 ~ currentManagerSC:", currentManagerSC.toFields()[0].toString());

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
