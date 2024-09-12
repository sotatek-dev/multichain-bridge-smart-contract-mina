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
import { Mina, PrivateKey, AccountUpdate, fetchAccount, UInt64 } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge } from '../index.js';
// check command line arg
let after_fix = "";
const tokenAlias = "token" + after_fix;
const adminContractAlias = "admin" + after_fix;
const bridgeAlias = "bridge" + after_fix;
let configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[tokenAlias];
let adminConfig = configJson.deployAliases[adminContractAlias];
let bridgeConfig = configJson.deployAliases[bridgeAlias];
let feepayerKeysBase58 = JSON.parse(await fs.readFile(config.feepayerKeyPath, 'utf8'));
let zkAppKeysBase58 = JSON.parse(await fs.readFile(config.keyPath, 'utf8'));
let adminZkAppKeysBase58 = JSON.parse(await fs.readFile(adminConfig.keyPath, 'utf8'));
let bridgeZkappKeysBase58 = JSON.parse(await fs.readFile(bridgeConfig.keyPath, 'utf8'));
let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
let tokenKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);
let adminContractKey = PrivateKey.fromBase58(adminZkAppKeysBase58.privateKey);
let bridgeContractKey = PrivateKey.fromBase58(bridgeZkappKeysBase58.privateKey);
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
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
const token = new FungibleToken(tokenAddress);
const adminContract = new FungibleTokenAdmin(adminContractAddress);
let bridgeContract = new Bridge(bridgeAddress);
const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(21000000000000);
let sentTx;
// compile the contract to create prover keys
await fetchAccount({ publicKey: feepayerAddress });
try {
    // call update() and send transaction
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        await bridgeContract.unlock(UInt64.from(2), feepayerAddress, UInt64.from(1), tokenAddress);
    });
    await tx.prove();
    console.log('send transaction...');
    sentTx = await tx.sign([feepayerKey, bridgeContractKey]).send();
}
catch (err) {
    console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();
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
//# sourceMappingURL=006_unlock_token.js.map