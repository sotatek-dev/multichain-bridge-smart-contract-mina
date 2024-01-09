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
import { Mina, PrivateKey, fetchAccount, UInt64 } from 'o1js';
import { Token } from './erc20.js';
// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
    throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);
Error.stackTraceLimit = 1000;
let configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[deployAlias];
let feepayerKeysBase58 = JSON.parse(await fs.readFile(config.feepayerKeyPath, 'utf8'));
let zkAppKeysBase58 = JSON.parse(await fs.readFile(config.keyPath, 'utf8'));
let user1 = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let feepayerKey = PrivateKey.fromBase58("EKDzBD67hfEP6FGteCMxQPkzLwWPvG7sdNtXprjLjuBNNgQbVCRD");
let zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
// set up Mina instance and contract we interact with
const MINAURL = 'https://api.minascan.io/node/berkeley/v1/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/berkeley/v1/graphql/';
const network = Mina.Network({
    mina: MINAURL,
    archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);
const AMOUNT_DEPOSIT = UInt64.from(5000000000000000n);
const AMOUNT_TRANSFER = UInt64.from(5000000000000n);
const AMOUNT_TRANSFER_USER = UInt64.from(5000000000n);
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let zkAppAddress = zkAppKey.toPublicKey();
let zkApp = new Token(zkAppAddress);
let sentTx;
// compile the contract to create prover keys
console.log('compile the contract...');
await Token.compile();
try {
    // call update() and send transaction
    await fetchAccount({ publicKey: feepayerAddress });
    // await fetchAccount({publicKey: zkAppAddress});
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        // AccountUpdate.fundNewAccount(feepayerAddress);
        zkApp.transfer(feepayerAddress, user1.toPublicKey(), AMOUNT_TRANSFER_USER);
    });
    await tx.prove();
    console.log('send transaction...');
    sentTx = await tx.sign([feepayerKey, zkAppKey]).send();
}
catch (err) {
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
function getTxnUrl(graphQlUrl, txnHash) {
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
//# sourceMappingURL=9999101_transfer_erc20_from_user.js.map