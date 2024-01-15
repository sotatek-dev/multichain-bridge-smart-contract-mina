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
import {Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, Experimental, CircuitString} from 'o1js';
import { Bridge } from '../Bridge.js';
import Token from '../token.js';
import Hook from '../Hooks.js';

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
const MINAURL = 'https://proxy.berkeley.minaexplorer.com/graphql';
// const MINAURL = 'https://api.minascan.io/node/berkeley/v1/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/berkeley/v1/graphql/';
//
const network = Mina.Network({
  mina: MINAURL,
  archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);

const AMOUNT_DEPOSIT = UInt64.from(5_000_000_000_000_000n)
const AMOUNT_TRANSFER = UInt64.from(5_000_000_000_000n)
const AMOUNT_TRANSFER_USER = UInt64.from(5_000_000_000n)

try {
    const accounts = await fetchAccount({publicKey: feepayerKey.toPublicKey()});
} catch (e) {
    console.log(e);
}

let targetAlias = process.argv[3];
if (!targetAlias)
    throw Error(`Missing <targetAlias> argument.

Usage:
node build/src/interact.js <targetAlias>
`);
let configTarget = configJson.deployAliases[targetAlias];
let zkBridgeKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
    await fs.readFile(configTarget.keyPath, 'utf8')
);

const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();
let zkApp = new Token(zkAppAddress);

let bridgeAppKey = PrivateKey.fromBase58(zkBridgeKeysBase58.privateKey);
let zkBridgeAddress = bridgeAppKey.toPublicKey();
let bridgeApp = new Bridge(zkBridgeAddress, zkApp.token.id);

let sentTx;
// compile the contract to create prover keys
console.log('compile the contract...');
await Token.compile();
await Bridge.compile();
await Hook.compile();
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');

    try {
        const accounts = await fetchAccount({publicKey: PublicKey.fromBase58("B62qjdNm8sDd9S2Zj2pfD3i85tuCk7SNjuF7J6UpPvT6pu1EqPv8Dqb")});
    } catch (e) {
        console.log(e);
    }
    console.log(zkAppAddress.toBase58());
    console.log(zkBridgeAddress.toBase58());
    console.log(feepayerAddress.toBase58());

    let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
        AccountUpdate.fundNewAccount(feepayerAddress);
        const callback = Experimental.Callback.create(bridgeApp, "unlock", [zkAppAddress, UInt64.one, feepayerAddress, UInt64.one])
        zkApp.mintToken(feepayerAddress, UInt64.one, callback)
        // const callback = Experimental.Callback.create(bridgeApp, "unlock", [zkAppAddress, UInt64.one, feepayerAddress, UInt64.one])
        // zkApp.sendTokensFromZkApp(feepayerAddress, UInt64.one, callback)
    }
  );
  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey]).send();
} catch (err) {
  console.log(err);
}
if (sentTx?.hash() !== undefined) {
  console.log(`
Success! Update transaction sent.

Your smart contract state will be updated
as soon as the transaction is included in a block:
${getTxnUrl(config.url, sentTx.hash())}
`);
}

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
