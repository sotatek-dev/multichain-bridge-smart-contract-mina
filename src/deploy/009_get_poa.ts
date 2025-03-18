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


let tokenKey = PrivateKey.fromBase58(allConfig["token"].privateKey);
let adminContractKey = PrivateKey.fromBase58(allConfig["adminContract"].privateKey);

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


let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();


const token = new FungibleToken(tokenAddress)
const adminContract = new FungibleTokenAdmin(adminContractAddress)

await fetchAccount({ publicKey: tokenAddress });

const cir = await token.getCirculating();
console.log("🚀 ~ cir:", cir.toBigInt());


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
let newAdminPubkey = PublicKey.fromBase58("B62qkkjqtrVmRLQhmkCQPw2dwhCZfUsmxCRTSfgdeUPhyTdoMv7h6b9");
let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
// try {
//   // call update() and send transaction
//   console.log('build transaction and create proof...');
//   let tx = await Mina.transaction(
//     { sender: feepayerAddress, fee },
//     async () => {
//       await managerContract.changeAdmin(newAdminPubkey);
//     }
//   );
//   await tx.prove();
//   console.log('send transaction...');
//   sentTx = await tx.sign([feepayerKey]).send();
// } catch (err) {
//   console.log(err);
// }
// console.log("=====================txhash: ", sentTx?.hash);
// await sentTx?.wait();

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
