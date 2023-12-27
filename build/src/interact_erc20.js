"use strict";
// /**
//  * This script can be used to interact with the Add contract, after deploying it.
//  *
//  * We call the update() method on the contract, create a proof and send it to the chain.
//  * The endpoint that we interact with is read from your config.json.
//  *
//  * This simulates a user interacting with the zkApp from a browser, except that here, sending the transaction happens
//  * from the script and we're using your pre-funded zkApp account to pay the transaction fee. In a real web app, the user's wallet
//  * would send the transaction and pay the fee.
//  *
//  * To run locally:
//  * Build the project: `$ npm run build`
//  * Run with node:     `$ node build/src/interact.js <deployAlias>`.
//  */
// import fs from 'fs/promises';
// import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey } from 'o1js';
// import { WETH } from './erc20.js';
//
// // check command line arg
// let deployAlias = process.argv[2];
// if (!deployAlias)
//   throw Error(`Missing <deployAlias> argument.
//
// Usage:
// node build/src/interact.js <deployAlias>
// `);
// Error.stackTraceLimit = 1000;
//
// // parse config and private key from file
// type Config = {
//   deployAliases: Record<
//     string,
//     {
//       url: string;
//       keyPath: string;
//       fee: string;
//       feepayerKeyPath: string;
//       feepayerAlias: string;
//     }
//   >;
// };
// let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));
//
// let config = configJson.deployAliases[deployAlias];
// let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.feepayerKeyPath, 'utf8')
// );
//
// let zkAppKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
//   await fs.readFile(config.keyPath, 'utf8')
// );
//
// let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
// let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
//
// // set up Mina instance and contract we interact with
// const MINAURL = 'https://api.minascan.io/node/berkeley/v1/graphql';
// const ARCHIVEURL = 'https://api.minascan.io/archive/berkeley/v1/graphql/';
//
// const network = Mina.Network({
//   mina: MINAURL,
//   archive: ARCHIVEURL,
// });
// Mina.setActiveInstance(network);
//
// const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
// let feepayerAddress = feepayerKey.toPublicKey();
// let zkAppAddress = zkAppKey.toPublicKey();
// let zkApp = new WETH(zkAppAddress);
//
// try {
//     const pkey = "B62qjEURvygCt8F1k268edeUuy4RjmBtKibhpxnQxWXSxHhb1ZX3h4q";
//     const target = PublicKey.fromBase58(pkey);
//     await fetchAccount({publicKey: target});
//     console.log("Calculate balance of: ", pkey);
//     const data = await zkApp.balanceOf(target);
//     // const data = await zkApp.symbol();
//     console.log(data.toString());
// } catch (error) {
//     throw new Error(
//         `On-chain zkApp account state doesn't match the expected state. ${error}`
//     );
// }
//# sourceMappingURL=interact_erc20.js.map