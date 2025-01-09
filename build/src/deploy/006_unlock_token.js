import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, Bool, Signature } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';
// check command line arg
const allConfig = {
    token: {
        privateKey: 'EKEdF6VWNGGXUu8Z1vmVjbEXPdTmh8GpvEBUyzEgR9aPoQdwQUQj',
        publicKey: 'B62qjPSJG7MrPHSn9HCxHiVSQ6trqjPekZHnnfuXpdzyLNFefy5wY1u'
    },
    adminContract: {
        privateKey: 'EKERitU8c8hVpN4c5JnJGsw2kcR8bAuckN4LmidH9CSb1uYJrAVS',
        publicKey: 'B62qpnsGfD2nhCWrCdP4JXoqjmXDDpcYkeun3VQwgVG2yeMvRf8vJ7y'
    },
    bridgeContract: {
        privateKey: 'EKEY5QnjT5ESCkbCe3TZvahGkbFpNWyZWmo3HLvQE368ydLzyVCw',
        publicKey: 'B62qirUmdVB1nrvLaEgr1gu3FU7d69wpXZ5ctCyRmNXps4JQBFZs9wT'
    },
    managerContract: {
        privateKey: 'EKFZAdRt4b2Yqpfumcq9htWoVqeuUvwnrs9mnNZKVRKcfzxbVnWS',
        publicKey: 'B62qqG1ac5ZmWYuWGg8kPdKXqboK7d4r6CzgtzL4bnycjbcjvRhszhx'
    },
    validatorManagerContract: {
        privateKey: 'EKDucojSnF1WeBfNeYXsBSas7o8w6wyG7FAPvQGvV8KM7frFrH8B',
        publicKey: 'B62qqACmQ6SHnrPtbWx4g1MQbsnAKi9y3JAuaZ4t1ULCp2BLzzMyTXF'
    },
    validator_1: {
        privateKey: 'EKDwmhHtvFHSmdCjibxkYvJdSLqvmPyVvRZdBaos7cM83cR1DVVT',
        publicKey: 'B62qiuYihCxPxuu9HNri7s53EZrzLJrUJCVf453oPpZk13QzUjVfMMK'
    },
    validator_2: {
        privateKey: 'EKEhgc7ePWnkWBUGzeqCVL8A6e4FZsS1VkLdurUMNfBJ2BTCdob2',
        publicKey: 'B62qj7c85t75DmDwjcW6YLEumYPo3ybury8pWY6G6hFzPiXVbsWg7yr'
    },
    validator_3: {
        privateKey: 'EKEH72Ybd5gS4NZgVU4kVqxs1SZe7Gj2nowvkJipm7Xztvm1xtK6',
        publicKey: 'B62qjxNSmfLyKJkUMvkqTrzAhH5ztgk7wSdLPnnz7soooYcbkHNC9kA'
    },
    admin: {
        privateKey: 'EKE86qT74pHat3gudytwR7mH3PQXgkfsSYTUR2Yu8TV9yTohtBRi',
        publicKey: 'B62qkJqkXZ1FiwCsyz1gGvakGVFGaUUUnMacjQRK3t7GRsmR2zFhN65'
    },
    minter_1: {
        privateKey: 'EKEZZrCTuRX4uWnp6YQXnUWkQ7ckW9XBQkbdLbqP9Xdg6exNh3uf',
        publicKey: 'B62qkhnJUAPJzSRGHhv6ufM6bKcvpadU2oDEk1PsojRMnPM9WGhxmBU'
    },
    minter_2: {
        privateKey: 'EKFS6bSUPdS4hgPz6VEa8xbwaRoNRBNi1d5GhLURo2fhkqCdt4er',
        publicKey: 'B62qk6HV5u1P8dp6YeVPST4xYdzULKYj3MnM4S1KzizVgsxENj74Yvr'
    },
    minter_3: {
        privateKey: 'EKF4M5YvQP4oRkHUaqb5akT7Kn9Ww8SNn94fMKgtdc1DPajpULBw',
        publicKey: 'B62qpyM31TLkv41DJeZUoWgFzZ4x3uaC6GFhRDmFfMEqrN8SjQGzLSo'
    }
};
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
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toBase58());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[0].toString());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[1].toString());
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();
const token = new FungibleToken(tokenAddress);
const adminContract = new FungibleTokenAdmin(adminContractAddress);
let bridgeContract = new Bridge(bridgeAddress);
// let managerContract = new Manager(managerAddress)
let validatorManagerContract = new ValidatorManager(validatorManagerAddress);
await fetchAccount({ publicKey: managerAddress });
await fetchAccount({ publicKey: validatorManagerAddress });
await fetchAccount({ publicKey: bridgeAddress });
const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(21000000000000);
const validator1Privkey = PrivateKey.fromBase58(allConfig.validator_1.privateKey);
const validator2Privkey = PrivateKey.fromBase58(allConfig.validator_2.privateKey);
const validator3Privkey = PrivateKey.fromBase58(allConfig.validator_3.privateKey);
const validator1 = validator1Privkey.toPublicKey();
const validator2 = validator2Privkey.toPublicKey();
const validator3 = validator3Privkey.toPublicKey();
let amount = UInt64.from(200000000000);
// let receiver = PublicKey.fromBase58("B62qmHMUwiyNfv81NNTumW7Hv8SfRAGLXceGK3ZpyzXgmg2FLqmVhmA");
let receiver = PublicKey.fromBase58("B62qkkjqtrVmRLQhmkCQPw2dwhCZfUsmxCRTSfgdeUPhyTdoMv7h6b9");
const msg = [
    ...validator1.toFields(),
    ...amount.toFields(),
    ...tokenAddress.toFields(),
];
const signature = await Signature.create(validator1Privkey, msg);
const msg2 = [
    ...validator2.toFields(),
    ...amount.toFields(),
    ...tokenAddress.toFields(),
];
const signature2 = await Signature.create(validator1Privkey, msg2);
const currentManager = await bridgeContract.manager.get();
console.log("🚀 ~ currentManager:", currentManager.toBase58());
console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());
let managerContract = new Manager(currentManager);
const minter1 = await managerContract.minter_1.get();
const minter2 = await managerContract.minter_2.get();
const minter3 = await managerContract.minter_3.get();
console.log("🚀 ~ currentManager1:", minter1.toBase58());
console.log("🚀 ~ currentManager2:", minter2.toBase58());
console.log("🚀 ~ currentManager3:", minter3.toBase58());
await fetchAccount({ publicKey: feepayerAddress });
let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString());
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
    // call update() and send transaction
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee, nonce: +nonce.toString() }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        console.log("================================1");
        await bridgeContract.unlock(amount, validator1, UInt64.from(1), tokenAddress, Bool(true), validator1, signature, Bool(false), validator2, signature, Bool(false), validator3, signature);
    });
    tx.sign([feepayerKey]);
    await tx.prove();
    let tx2 = await Mina.transaction({ sender: feepayerAddress, fee, nonce: +nonce.add(1).toString() }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        console.log("================================2");
        await bridgeContract.unlock(amount, validator2, UInt64.from(1), tokenAddress, Bool(true), validator1, signature2, Bool(false), validator2, signature, Bool(false), validator3, signature);
    });
    tx2.sign([feepayerKey]);
    await tx2.prove();
    let tx3 = await Mina.transaction({ sender: feepayerAddress, fee, nonce: +nonce.add(2).toString() }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        console.log("================================3");
        await bridgeContract.unlock(amount, validator2, UInt64.from(1), tokenAddress, Bool(true), validator1, signature2, Bool(false), validator2, signature, Bool(false), validator3, signature);
    });
    tx3.sign([feepayerKey]);
    await tx3.prove();
    let tx4 = await Mina.transaction({ sender: feepayerAddress, fee, nonce: +nonce.add(3).toString() }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        console.log("================================4");
        await bridgeContract.unlock(amount, validator2, UInt64.from(1), tokenAddress, Bool(true), validator1, signature2, Bool(false), validator2, signature, Bool(false), validator3, signature);
    });
    tx4.sign([feepayerKey]);
    await tx4.prove();
    let tx5 = await Mina.transaction({ sender: feepayerAddress, fee, nonce: +nonce.add(4).toString() }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        console.log("================================5");
        await bridgeContract.unlock(amount, validator2, UInt64.from(1), tokenAddress, Bool(true), validator1, signature2, Bool(false), validator2, signature, Bool(false), validator3, signature);
    });
    tx5.sign([feepayerKey]);
    await tx5.prove();
    const transactions = [tx, tx2, tx3, tx4, tx5];
    const startSendTime = Date.now();
    // const results = [];
    // for (const transaction of transactions) {
    //   const result = await transaction.send();
    //   results.push(result);
    // }
    // const [tx1Rs, tx2Rs, tx3Rs, tx4Rs, tx5Rs] = results;
    // console.log("send tx1 is success: ", tx1Rs?.hash);
    // console.log("send tx2 is success: ", tx2Rs?.hash);
    // console.log("send tx3 is success: ", tx3Rs?.hash);
    // console.log("send tx4 is success: ", tx4Rs?.hash);
    // console.log("send tx5 is success: ", tx5Rs?.hash);
    const sendTransactionsInOrder = async (txs) => {
        const results = await Promise.all(txs.map(async (transaction) => {
            const result = await transaction.send();
            console.log("=====================txhash: ", result?.hash);
            return result;
        }));
        return results;
    };
    const resultTx = await sendTransactionsInOrder(transactions);
    let listWait = []; // Explicitly define listWait as an array of promises
    resultTx.forEach((txResult) => {
        listWait.push(txResult.wait());
    });
    await Promise.all(listWait);
    const endTime = Date.now();
    console.log(`��� ~ time taken to send transactions: ${startSendTime - startTime}ms`);
    console.log(`��� ~ time taken to send + await  transactions: ${endTime - startSendTime}ms`);
}
catch (err) {
    console.log(err);
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
//# sourceMappingURL=006_unlock_token.js.map