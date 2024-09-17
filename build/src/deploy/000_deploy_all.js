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
import { Mina, PrivateKey, AccountUpdate, UInt64, UInt8, Bool, Field } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, Manager, ValidatorManager, Secp256k1 } from '../index.js';
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
let tokenKey = PrivateKey.random();
let adminContractKey = PrivateKey.random();
let bridgeContractKey = PrivateKey.random();
let managerKey = PrivateKey.random();
let validatorManagerKey = PrivateKey.random();
// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';
const network = Mina.Network({
    mina: MINAURL,
    archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);
console.log('compile the token contract...');
await FungibleToken.compile();
console.log('compile the token admin contract...');
await FungibleTokenAdmin.compile();
console.log('compile the bridge contract...');
await Bridge.compile();
console.log('compile the manager contract...');
await Manager.compile();
console.log('compile the validator contract...');
await ValidatorManager.compile();
console.log('compile the contract DONE...');
const fee = Number(config.fee) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerKey.toPublicKey();
let validatorManagerAddress = validatorManagerKey.toPublicKey();
const token = new FungibleToken(tokenAddress);
const adminContract = new FungibleTokenAdmin(adminContractAddress);
const bridgeContract = new Bridge(bridgeAddress);
const managerContract = new Manager(managerAddress);
const validatorManagerContract = new ValidatorManager(validatorManagerAddress);
const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(21000000000000);
let validatorSeed1 = "123456789012345678901234567890123456787";
let validatorSeed2 = "123456789012345678901234567890123456788";
let validatorSeed3 = "123456789012345678901234567890123456789";
const validatorPrivateKeyGen1 = Secp256k1.Scalar.from(BigInt(validatorSeed1));
const validatorPublicKey1 = Secp256k1.generator.scale(validatorPrivateKeyGen1);
const validatorPrivateKeyGen2 = Secp256k1.Scalar.from(BigInt(validatorSeed2));
const validatorPublicKey2 = Secp256k1.generator.scale(validatorPrivateKeyGen2);
const validatorPrivateKeyGen3 = Secp256k1.Scalar.from(BigInt(validatorSeed3));
const validatorPublicKey3 = Secp256k1.generator.scale(validatorPrivateKeyGen3);
let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
    // call update() and send transaction
    console.log('Deploying...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        AccountUpdate.fundNewAccount(feepayerAddress, 6);
        await adminContract.deploy({ adminPublicKey: bridgeAddress });
        await token.deploy({
            symbol: symbol,
            src: src,
        });
        await token.initialize(adminContractAddress, UInt8.from(9), Bool(false));
        await managerContract.deploy({
            _admin: feepayerAddress,
            _minter: feepayerAddress,
        });
        await validatorManagerContract.deploy({
            _val1X: Field.from(validatorPublicKey1.x.toBigInt().toString()),
            _val1Y: Field.from(validatorPublicKey1.y.toBigInt().toString()),
            _val2X: Field.from(validatorPublicKey2.x.toBigInt().toString()),
            _val2Y: Field.from(validatorPublicKey2.y.toBigInt().toString()),
            _val3X: Field.from(validatorPublicKey3.x.toBigInt().toString()),
            _val3Y: Field.from(validatorPublicKey3.y.toBigInt().toString()),
            _manager: managerAddress,
        });
        await bridgeContract.deploy({
            threshold: UInt64.from(1),
            minAmount: UInt64.from(1),
            maxAmount: UInt64.from(1000000000000000),
            validatorPub: validatorManagerAddress,
            manager: managerAddress
        });
        // await token.mint(feepayerAddress, UInt64.from(1_000_000_000_000));
    });
    console.log('prove transaction...');
    await tx.prove();
    console.log('send transaction...');
    sentTx = await tx.sign([feepayerKey, adminContractKey, tokenKey, managerKey, validatorManagerKey, bridgeContractKey]).send();
}
catch (err) {
    console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();
// Save all private and public keys to a single JSON file
const keysToSave = [
    { name: 'token', privateKey: tokenKey, publicKey: tokenAddress },
    { name: 'adminContract', privateKey: adminContractKey, publicKey: adminContractAddress },
    { name: 'bridgeContract', privateKey: bridgeContractKey, publicKey: bridgeAddress },
    { name: 'managerContract', privateKey: managerKey, publicKey: managerAddress },
    { name: 'validatorManagerContract', privateKey: validatorManagerKey, publicKey: validatorManagerAddress }
];
const allKeys = {};
for (const key of keysToSave) {
    allKeys[key.name] = {
        privateKey: key.privateKey.toBase58(),
        publicKey: key.publicKey.toBase58()
    };
}
allKeys['validator_1'] = {
    seed: validatorSeed1
};
allKeys['validator_2'] = {
    seed: validatorSeed2
};
allKeys['validator_3'] = {
    seed: validatorSeed3
};
console.log("🚀 ~ allKeys:", allKeys);
// const keysDir = path.join('..', '..', 'keys');
// const fileName = path.join(keysDir, `${project_alias}_all_keys.json`);
// // Create the keys directory if it doesn't exist
// await fs.mkdir(keysDir, { recursive: true });
// await fs.writeFile(fileName, JSON.stringify(allKeys, null, 2));
// console.log(`Saved all keys to ${fileName}`);
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
//# sourceMappingURL=000_deploy_all.js.map