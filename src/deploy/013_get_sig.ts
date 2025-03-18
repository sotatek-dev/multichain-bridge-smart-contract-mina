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

let feepayerKey = PrivateKey.fromBase58("");

// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';

const network = Mina.Network({
  mina: MINAURL,
  archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);


const msg = `{"id":"y96qmT865fCMGGHdKAQ448uUwqs7dEfqnGBGVrv3tiRKTC2hxE","address":"B62qpN6sE9Bg9vzYVfs4ZBajgnv2sobb8fy76wZPB5vWM27s9GgtUTA","name":"Httpz","symbol":"Httpz","decimal":"9","description":"Httpz Token in Mainnet","website":"https://claim.httpz.link/","fungibleTokenVersion":"1.1.0"}`
const signature = await Signature.create(feepayerKey, msg);
console.log("🚀 ~ signature:", signature.toJSON())