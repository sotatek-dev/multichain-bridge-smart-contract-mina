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
import path from 'path';
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, UInt8, Bool, Field } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, Manager, ValidatorManager } from '../index.js';

import { allConfig } from "../../deploy-config/config.js";

let feepayerKey = PrivateKey.fromBase58(allConfig.admin.privateKey);

let minter_1 = PrivateKey.random();
let minter_2 = PrivateKey.random();
let minter_3 = PrivateKey.random();
let adminKey = feepayerKey;
let managerKey = PrivateKey.random();

// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';

const network = Mina.Network({
  mina: MINAURL,
  archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);

await Manager.compile();
console.log('compile the validator contract...');


const fee = Number(0.5) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let managerAddress = managerKey.toPublicKey();
// const adminAddress = adminKey.toPublicKey();
// const minter1Address = minter_1.toPublicKey();
// const minter2Address = minter_2.toPublicKey();
// const minter3Address = minter_3.toPublicKey();


const adminAddress = PublicKey.fromBase58(allConfig.admin.publicKey);
const minter1Address = PublicKey.fromBase58(allConfig.minter_1.publicKey);
const minter2Address = PublicKey.fromBase58(allConfig.minter_2.publicKey);
const minter3Address = PublicKey.fromBase58(allConfig.minter_3.publicKey);

const managerContract = new Manager(managerAddress)


let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('Deploying...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      AccountUpdate.fundNewAccount(feepayerAddress, 1)
            await managerContract.deploy({
              _admin: adminAddress,
              _minter_1: minter1Address,
              _minter_2: minter2Address,
              _minter_3: minter3Address
            })
            // await token.mint(feepayerAddress, UInt64.from(1_000_000_000_000));
    }
  );
  console.log('prove transaction...');
  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey, managerKey]).send();
} catch (err) {
  console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();
// Save all private and public keys to a single JSON file
const keysToSave = [
  { name: 'managerContract', privateKey: managerKey, publicKey: managerAddress },
  { name: 'admin', privateKey: adminKey, publicKey: adminAddress },
  { name: 'minter_1', privateKey: minter_1, publicKey: minter1Address },
  { name: 'minter_2', privateKey: minter_2, publicKey: minter2Address },
  { name: 'minter_3', privateKey: minter_3, publicKey: minter3Address },
];

const allKeys = {};
for (const key of keysToSave) {
  (allKeys as Record<string, { privateKey: string; publicKey: string }>)[key.name] = {
    privateKey: key.privateKey.toBase58(),
    publicKey: key.publicKey.toBase58()
  };
}

console.log("🚀 ~ allKeys:", allKeys);

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
