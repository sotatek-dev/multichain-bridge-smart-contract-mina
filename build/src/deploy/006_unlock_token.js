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
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, Bool } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, Secp256k1, ValidatorManager, Manager } from '../index.js';
import { Bytes256, Ecdsa } from '../ecdsa/ecdsa.js';
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
        privateKey: 'EKEEF6VqgxHGM1AnGCsEJkry7KUM3PfMhESCMDyaX81Xh2bSgKWW',
        publicKey: 'B62qkEXoCDTeABfvpXmizZnah8Xtsy6LsUkMC4wQ1dBQYJapge5DJQY'
    },
    adminContract: {
        privateKey: 'EKFSjHF3PDsSBMaRD8eg95hgL96mehfLSNXMWS2ZxnRNTWBpvp86',
        publicKey: 'B62qqGHGFcvPvRNNcSfciPUhq5w4Q8QSJGZn8PEMeu7sBPq8XnmXY4U'
    },
    bridgeContract: {
        privateKey: 'EKEdWnS3pfLTWeBBhaNGWgGCQagLkXAUXcmrLh3K1GYqNLSMFTBS',
        publicKey: 'B62qkz1P3ftenFunfUGsoQGb3ZeftKmYkYQbfY4vC3avSJJxJ4uQHr2'
    },
    managerContract: {
        privateKey: 'EKDxPsi367kKBD8QLYZK2LfmXHt8oqxqwKY1pSnQ3wrQFRcogfhE',
        publicKey: 'B62qjZjqY47JEyeYfaAjRHHGEMV1deRLj4J2o4yB8JPoYa6QwRNs3sc'
    },
    validatorManagerContract: {
        privateKey: 'EKE4ZVgaYhgsSBapK89ktUgzE5MiZZkXpVPyePqmoV4c23e5x4nv',
        publicKey: 'B62qjZmg2hbtJcjQ8k2UaFa3ZTHiJ1yKUVSuQrmbWoHst3Hse5oaiSM'
    },
    validator_1: { seed: '123456789012345678901234567890123456787' },
    validator_2: { seed: '123456789012345678901234567890123456788' },
    validator_3: { seed: '123456789012345678901234567890123456789' }
};
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
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();
const token = new FungibleToken(tokenAddress);
const adminContract = new FungibleTokenAdmin(adminContractAddress);
let bridgeContract = new Bridge(bridgeAddress);
let managerContract = new Manager(managerAddress);
let validatorManagerContract = new ValidatorManager(validatorManagerAddress);
await fetchAccount({ publicKey: managerAddress });
await fetchAccount({ publicKey: validatorManagerAddress });
const x1 = await validatorManagerContract.validator1X.get();
console.log("🚀 ~ x1:", x1);
const admin = await managerContract.admin.get();
console.log("🚀 ~ admin:", admin);
const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(21000000000000);
const seed1 = allConfig['validator_1'].seed;
let privateKey = Secp256k1.Scalar.from(seed1);
let publicKey = Secp256k1.generator.scale(privateKey);
let amount = UInt64.from(2000000000000);
// let receiver = PublicKey.fromBase58("B62qmHMUwiyNfv81NNTumW7Hv8SfRAGLXceGK3ZpyzXgmg2FLqmVhmA");
let receiver = PublicKey.fromBase58("B62qjWwgHupW7k7fcTbb2Kszp4RPYBWYdL4KMmoqfkMH3iRN2FN8u5n");
let msg = Bytes256.fromString(`unlock receiver = ${receiver.toFields} amount = ${amount.toFields} tokenAddr = ${tokenAddress.toFields}`);
let signature = Ecdsa.sign(msg.toBytes(), privateKey.toBigInt());
let sentTx;
// compile the contract to create prover keys
await fetchAccount({ publicKey: feepayerAddress });
try {
    // call update() and send transaction
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        await bridgeContract.unlock(amount, receiver, UInt64.from(1), tokenAddress, Bool(true), signature, publicKey, Bool(false), signature, publicKey, Bool(false), signature, publicKey);
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