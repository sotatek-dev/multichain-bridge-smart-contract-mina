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
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, Field } from 'o1js';
import { Bridge } from '../Bridge.js';
import { BridgeToken } from '../BridgeToken.js';
import { FungibleToken } from '../index.js';
// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);
Error.stackTraceLimit = 1000;

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

let config = configJson.deployAliases[deployAlias];
let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.keyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';
//
const network = Mina.Network({
  mina: MINAURL,
  archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);

// try {
//     const accounts = await fetchAccount({publicKey: feepayerKey.toPublicKey()});
// } catch (e) {
//     console.log(e);
// }

console.log('compile the contract...');
await Bridge.compile();
await FungibleToken.compile();

// const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
// let feepayerAddress = feepayerKey.toPublicKey();
// let zkAppAddress = zkAppKey.toPublicKey();
// let zkBridge = new Bridge(zkAppAddress);
// console.log("🚀 ~ zkAppAddress:", zkAppAddress)
// const accounts = await fetchAccount({publicKey: zkAppAddress});
// const maxx = await zkBridge.maxAmount.get();
// console.log("🚀 ~ maxx:", maxx.toString())

// let sentTx;
// // compile the contract to create prover keys
// try {
//   // call update() and send transaction
//   console.log('build transaction and create proof...');
//     let tx = await Mina.transaction(
//     { sender: feepayerAddress, fee },
//     async () => {
//       AccountUpdate.fundNewAccount(feepayerAddress, 1);
//       await zkBridge.lock(UInt64.from(200_000_000), Field.from(1));
//     }
//   );
//   await tx.prove();
//   console.log('send transaction...');
//   sentTx = await tx.sign([feepayerKey, zkAppKey]).send();
// } catch (err) {
//   console.log(err);
// }
// console.log("=====================txhash: ", sentTx?.hash);
// await sentTx?.wait();
