import { Mina, PrivateKey, AccountUpdate, PublicKey } from 'o1js';
import { Manager } from '../index.js';
const allConfig = {
    // token: {
    //   privateKey: 'EKFJCJnfuv85kSqrNyqMxhCJzCqKYrJ9Gd6Q7Laakvh6DcoAA8D4',
    //   publicKey: 'B62qkuPGhLfrD12buqho48hSnc3DMGQ1d4ugzNjtYuRmSi5vvAjoZRz'
    // },
    // adminContract: {
    //   privateKey: 'EKFWVTP5cmdkeu3n3TEHo5jEToo2YVLiJCWR4zjbpavAJV4eSpUt',
    //   publicKey: 'B62qqY8QRCbTbUM2Va3Lzn91EZKWWFaobX5KhFmpbve4wzvgo7ZER9A'
    // },
    // bridgeContract: {
    //   privateKey: 'EKFVE4fiRtBgdkKgffRzcNHZ6GJmkg95mWEDatmJ3ZueGgZg5K4W',
    //   publicKey: 'B62qqKFZav5StzHmRkaU21Mw34CgGu5fWCsdGcCuxdgjZb3MSrxo67Q'
    // },
    // managerContract: {
    //   privateKey: 'EKEmiXywqnKC8vWXko8ktKnGbYbQqmCHfrZ7YRbKRZEr1PREcDNN',
    //   publicKey: 'B62qpTBL7K2NEYfiW5jLr4p8iY3x1kccyMETFi7ZUwFor5Viw337ivd'
    // },
    // validatorManagerContract: {
    //   privateKey: 'EKEfwksv72JHarTSZAXgeSwcZGejvRkcdVmPQ7mujtczv2gJhQU6',
    //   publicKey: 'B62qnFAsrYfqgRk8MD8F5Lbpi6RdqkEb7wqJjYhQk3NbC2mQmjcFGJ1'
    // },
    // validator_1: {
    //   privateKey: 'EKE8MzLKBQQn3v53v6JSCXHRPvrTwAB6xytnxYfpATgYnX17bMeM',
    //   publicKey: 'B62qnatDbNraYYPAnUYW1rGpS5tzXsGzLvyPebafNseYgNrHF83eu7d'
    // },
    // validator_2: {
    //   privateKey: 'EKF3PE1286RVzZNgieYeDw96LrMKc6V2szhvV2zyj2Z9qLwzc1SG',
    //   publicKey: 'B62qroF6gTiaDNBqFETV2wPWmdVxufxaQHr3gKSGqh9U4tXVYjJZsVc'
    // },
    // validator_3: {
    //   privateKey: 'EKEqLGiiuaZwAV5XZeWGWBsQUmBCXAWR5zzq2vZtyCXou7ZYwryi',
    //   publicKey: 'B62qjM9WyCn9BK2jyv6KkuLeXqiWsvaFPNtkNt9snt7U1TKxcZq9q7P'
    // }
    token: {
        privateKey: 'EKDn5QRDi16RbgWoQCbvqzo1XF4B6TDd2WmXF8r5YpYimR5NxQ5g',
        publicKey: 'B62qjM88vh9bmR24QTRqJBurdJ8pWKbuPMtmTohiDtdmQEAdPzsBrif'
    },
    adminContract: {
        privateKey: 'EKE2BwhPwhpjzRCsFQehCKV9qrLmFjV37HM5JMPpgFjoDrZWj1BX',
        publicKey: 'B62qjBb8Wh9aW66yKZQng7FiZXVtu2nQdhSXYRGS9KwL6iNnN6nhq15'
    },
    bridgeContract: {
        privateKey: 'EKF19hihcXry9QMttf719fVp56DuRB2vZySdeQ1y9BkkvWWxnJAa',
        publicKey: 'B62qmL9EHYMWJHhbLg2oVRqVJ7i9hEYx6u9qRPGRaq8iyrYFyAAiTc2'
    },
    managerContract: {
        privateKey: 'EKFJTWVcq6Qixm9s2guG2yXh7adbP9jX8ZpVYhkDf8NvhvoFadPY',
        publicKey: 'B62qqP6TrYTCXrM7p2HmrLHpP41nwgb4iykf1sdpkFCo4NJD2AxK51r'
    },
    validatorManagerContract: {
        privateKey: 'EKEeeKpgQWwcp2hGyATAgK1EshbaYiNZWfAyiheDzCXaJntLV5ma',
        publicKey: 'B62qnTKW4ogzzioZ9ApynRE8f4vjPnoFbhs4ANokSRHA7CBhRgpxCs9'
    },
    validator_1: {
        privateKey: 'EKEo6bA2EsKgHEXoqogccvX6iTwdiGZfHijyMn7xmUXj7CG5e47m',
        publicKey: 'B62qnXpFWCh3wg1ZjiJgoxYFdiwmnsMCZ313DyWFua6ZYcfSyKH1qYH'
    },
    validator_2: {
        privateKey: 'EKEMpP9tfvkH4t5HrLUnySzK16ZJMVxmCLHVgiY9LQtzfRXigxMW',
        publicKey: 'B62qk5QZLop9UQoCkj81DRNHmXVLmVn5ccRmng7RrTi4u6ChUUEvUGi'
    },
    validator_3: {
        privateKey: 'EKE7SCvSR7oDoKrNs6LFMi1XdaYhHxVqcpeUuYWZcsBHjDGZbHmS',
        publicKey: 'B62qpjFBgyNWv4RAroZTnypqMaYjhqWv7ppduHzoTHhmvwVajho6dPq'
    },
    admin: {
        privateKey: 'EKENccWLj2Tvgiuw29EeGARh4APVJHZc7d1DjMKQuHNQxpjPTPqb',
        publicKey: 'B62qpSTaJEiN9QVmaVDX8B2SmEA9nzdYrjhfaSjabXVgHTS7MQE7he7'
    },
    minter: {
        privateKey: 'EKEhzBN7hxnCnki7xqYa72vkagwC4quoANYPXtRrKwDsVznxMgvu',
        publicKey: 'B62qrCAYXUuRLg9CY9QbNRW8b7hXLkN9JY3QdNhfNmXBD2xF88JU4MH'
    }
};
let feepayerKey = PrivateKey.fromBase58(allConfig.admin.privateKey);
let minter_1 = PrivateKey.random();
let minter_2 = PrivateKey.random();
let minter_3 = PrivateKey.random();
let adminKey = feepayerKey;
let managerKey = PrivateKey.random();
// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';
const network = Mina.Network({
    mina: MINAURL,
    archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);
await Manager.compile();
console.log('compile the validator contract...');
const fee = Number(0.5) * 1e9; // in nanomina (1 billion = 1.0 mina)
let feepayerAddress = feepayerKey.toPublicKey();
let managerAddress = managerKey.toPublicKey();
// const adminAddress = adminKey.toPublicKey();
// const minter1Address = minter_1.toPublicKey();
// const minter2Address = minter_2.toPublicKey();
// const minter3Address = minter_3.toPublicKey();
const adminAddress = PublicKey.fromBase58("B62qpSTaJEiN9QVmaVDX8B2SmEA9nzdYrjhfaSjabXVgHTS7MQE7he7");
const minter1Address = PublicKey.fromBase58("B62qpSTaJEiN9QVmaVDX8B2SmEA9nzdYrjhfaSjabXVgHTS7MQE7he7");
const minter2Address = PublicKey.fromBase58("B62qmzvufvs3be28v4imYdL64WfcpYEMe7PXSfHEjaWeGgoFTPQY3oa");
const minter3Address = PublicKey.fromBase58("B62qnU7YupXnx7ByiV6GYfwPiMcnZQe1SCVtTdG293cwnTZQpLiudzD");
const managerContract = new Manager(managerAddress);
let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
    // call update() and send transaction
    console.log('Deploying...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        AccountUpdate.fundNewAccount(feepayerAddress, 1);
        await managerContract.deploy({
            _admin: adminAddress,
            _minter_1: minter1Address,
            _minter_2: minter2Address,
            _minter_3: minter3Address
        });
        // await token.mint(feepayerAddress, UInt64.from(1_000_000_000_000));
    });
    console.log('prove transaction...');
    await tx.prove();
    console.log('send transaction...');
    sentTx = await tx.sign([feepayerKey, managerKey]).send();
}
catch (err) {
    console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();
// Save all private and public keys to a single JSON file
const keysToSave = [
    { name: 'managerContract', privateKey: managerKey, publicKey: managerAddress },
    { name: 'admin', privateKey: adminKey, publicKey: adminAddress },
    { name: 'minter_1', privateKey: feepayerKey, publicKey: feepayerAddress },
    { name: 'minter_2', privateKey: minter_2, publicKey: minter2Address },
    { name: 'minter_3', privateKey: minter_3, publicKey: minter3Address },
];
const allKeys = {};
for (const key of keysToSave) {
    allKeys[key.name] = {
        privateKey: key.privateKey.toBase58(),
        publicKey: key.publicKey.toBase58()
    };
}
console.log("🚀 ~ allKeys:", allKeys);
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
//# sourceMappingURL=010_deploy_manager.js.map