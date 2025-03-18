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

let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();

await fetchAccount({publicKey: feepayerAddress});
await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: adminContractAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});
await fetchAccount({publicKey: tokenAddress});

// Get current verification key before upgrade
const adminContractAccount = await fetchAccount({publicKey: adminContractAddress});
console.log("Current verification key:", adminContractAccount.account?.zkapp?.verificationKey?.hash.toString());

const adminContract = new FungibleTokenAdmin(adminContractAddress)

const verificationKey = (await FungibleTokenAdmin.compile()).verificationKey;
console.log("🚀 ~ verificationKey:", verificationKey.hash.toString())



let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString())

const upgradeTx = await Mina.transaction({ sender: feepayerAddress, fee },
  async () => {
    const update = await AccountUpdate.createSigned(adminContractAddress);
    await update.account.verificationKey.set(verificationKey);
  }
);
await upgradeTx.sign([feepayerKey, adminContractKey]).prove();

const sentTx = await upgradeTx.send();
await sentTx.wait();
console.log("🚀 ~ sentTx:", sentTx.hash)



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
