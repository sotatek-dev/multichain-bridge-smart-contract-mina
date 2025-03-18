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
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';

import { allConfig } from "../../deploy-config/config.js";
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

let managerAddress = PublicKey.fromBase58(allConfig.managerContract.publicKey)
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


let newManager = PublicKey.fromBase58("B62qrZ7fgjAZq2XnJCg16oRH2L8vjebZvHEGFxanfrwbpKvSk3fFjEy");
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
