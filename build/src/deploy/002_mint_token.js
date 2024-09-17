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
import { Mina, PrivateKey, AccountUpdate, PublicKey, UInt64 } from 'o1js';
import { FungibleToken, FungibleTokenAdmin } from '../index.js';
// check command line arg
let deployAlias = process.argv[2];
if (!deployAlias)
    throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);
const project_alias = "env_" + deployAlias;
let configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
let config = configJson.deployAliases[project_alias];
let feepayerKeysBase58 = JSON.parse(await fs.readFile(config.feepayerKeyPath, 'utf8'));
let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
const allConfig = {
    token: {
        privateKey: "EKEduaLewszM2TAAZAbWC7RyuG4QNMn8ux524pVbUwpHRzj54Q18",
        publicKey: "B62qisgt5S7LwrBKEc8wvWNjW7SGTQjMZJTDL2N6FmZSVGrWiNkV21H"
    },
    adminContract: {
        privateKey: "EKERSuhfw7JAAW7dgW5T7WtenQ7e5KJSUn81fNbJtgbx6mRvZC4N",
        publicKey: "B62qp6GHBtDh2corBRYDmciQ6wcXwQtFw72p4q82H4W8upEeuwZcRqU"
    },
    bridgeContract: {
        privateKey: 'EKFGpQ17SoZo8d9csh7tsjDwAezcdP8G44FBQX1swfU2wdztSwSy',
        publicKey: 'B62qjv5RdC63eidxMofZBtMJdFCnuM9bAoxok1jE7xD2ZXE17WKuT9V'
    },
    managerContract: {
        privateKey: 'EKFRSa846HcBvbgh7KA2RyP2bv88DDXCrWXDDtCaJsQ9nrUJ2Y4z',
        publicKey: 'B62qpnD6kqKpqLKod7TQ1fTccWeVuy5CqFkuqZ3q7h9LKoC2xGj3KYg'
    },
    validatorManagerContract: {
        privateKey: 'EKFPSYABq9mHbuJVgrk3xq1mCfLY6BCZt9W7K23Tcrx7uRXRAyxf',
        publicKey: 'B62qkSDKKTgTcXhwmRd2iVipQZh6qEriHK22VQPxmSsootgj93MWLoZ'
    },
    validator_1: { seed: '123456789012345678901234567890123456787' },
    validator_2: { seed: '123456789012345678901234567890123456788' },
    validator_3: { seed: '123456789012345678901234567890123456789' }
};
let tokenKey = PrivateKey.fromBase58(allConfig["token"].privateKey);
let adminContractKey = PrivateKey.fromBase58(allConfig["adminContract"].privateKey);
let bridgeContractKey = PrivateKey.fromBase58(allConfig["bridgeContract"].privateKey);
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
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
const token = new FungibleToken(tokenAddress);
const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(1000000000000);
let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toBase58());
console.log("🚀 ~ token address:", tokenAddress.toBase58());
console.log("🚀 ~ bridge address:", bridgeAddress.toBase58());
try {
    // call update() and send transaction
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        AccountUpdate.fundNewAccount(feepayerAddress, 1);
        await token.mint(PublicKey.fromBase58("B62qq2TYNeGeUAXsMKzKeJ8wTWnNnTnESfpGGKZXHCw8FRf23uYzqXc"), supply);
    });
    await tx.prove();
    console.log('send transaction...');
    sentTx = await tx.sign([feepayerKey, bridgeContractKey, adminContractKey]).send();
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
//# sourceMappingURL=002_mint_token.js.map