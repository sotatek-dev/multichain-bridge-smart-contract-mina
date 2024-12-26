import { Mina, PrivateKey, AccountUpdate, PublicKey } from 'o1js';
import { Manager } from '../index.js';
const allConfig = {
    token: {
        privateKey: 'EKF6PbdJfk2YAF9fapgmQRaHZRrt1PQ226YcpEAV4JvdDdVFHham',
        publicKey: 'B62qjQJTD1msi2zy3tRo6gzyR3qN94HGqikULkhZqRUZXK5iEhbgWEp'
    },
    adminContract: {
        privateKey: 'EKEeitS6FwUcZRZHvcTPtqJT4bgaVQbKbpURRKYb45oPHDwd5tDs',
        publicKey: 'B62qmMfKvVCigNY6FArjWEMWf3HumoDbLkg1bBx3qEmkfWnVQiYdk5d'
    },
    bridgeContract: {
        privateKey: 'EKEGWYkKMDN4RDn85B68vU2GT9WEoqBC2ioRuRJ7ihRmYucRLcox',
        publicKey: 'B62qp8hz6spPXyPoiU96mjmBDw8iLGP4AZPijBy1XXqhrK75dECGZvZ'
    },
    managerContract: {
        privateKey: 'EKFYzr7rWjH4cwuaYXwQ57voEU7RX148o2m3EyPy8TP73E8xtW1g',
        publicKey: 'B62qrcANacDDjQTN5C8fY7VKtF1P4dCQsDjoFEpNzRdjULdgqJXJzFW'
    },
    validatorManagerContract: {
        privateKey: 'EKDr4W5nxgmWcdNWctN4Yskkef8pfCjvRumpBNYjKwfDMDbCmEVB',
        publicKey: 'B62qkoUaTgmwkRXtZhLSRSRtrc9AfdjrTnNSSEEkKsdmQv6GjohBxVb'
    },
    validator_1: {
        privateKey: 'EKEHFXdgfxeY9xVg4WSgHCiqgukXXAnZp5vvXoWsag2BxvKgd5Ld',
        publicKey: 'B62qrTpG875K8ct1hvoEuhc77JfFfMqEqxENdiFWE1H9QuGDjiTw3BF'
    },
    validator_2: {
        privateKey: 'EKFZEY59qx2oFYpQJeir8tizXjLbYyrd7rDeoaNzt7bjcqTmfecD',
        publicKey: 'B62qmr6KLUjXaC5RGVkpLBqNfmYJJ7oinwpTZhRHcckfAnwuwrrSVZJ'
    },
    validator_3: {
        privateKey: 'EKF4oGqrt4cTuXtkcUsrACnRsxCo5pH1fTyt1bhoQiGPtLLiBi2J',
        publicKey: 'B62qnS9kc6Bh3NayRzd9Qhhew8TiEDkfXAPq94wK6WsjuebMYAquEa5'
    },
    admin: {
        privateKey: 'EKEGqQac3mtUGAELScNk7GR5e1PsoZQDF8CpjFdWdAhTjRjU3jT1',
        publicKey: 'B62qqjuQJRp4cRrsbMERuEJspyGcPJhJG3LkcFQRpeU3YKGdy7qVnho'
    },
    minter_1: {
        privateKey: 'EKFdfWDUQydsZ4q3dw23Wr1kANYaySDzxNzErwkUzSDEi233z6Fk',
        publicKey: 'B62qmKosYp5GbJc6voKpufJ1e11CDVSTy6YEvNSVAg68bYSqqnEJNrG'
    },
    minter_2: {
        privateKey: 'EKEnFtcTwnd19FbexkxYFgCyVjzuiMA1dDWUHKto7c72kj2WSF6u',
        publicKey: 'B62qqiqFmXziBSMDnBNRXiiENAjY2PbXfS3uvBX5tVRGgHkbakQRuEr'
    },
    minter_3: {
        privateKey: 'EKDykYNZm7G7cccjAq36rZEAQLTcxz7z2Fs5E2YyydcnjNcnWC3T',
        publicKey: 'B62qmB5Ca7XmLtf4zjtsoEzeejRn9xZNwrYzdviExNPETKJrw2ppAcf'
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
const adminAddress = PublicKey.fromBase58(allConfig.admin.publicKey);
const minter1Address = PublicKey.fromBase58(allConfig.minter_1.publicKey);
const minter2Address = PublicKey.fromBase58(allConfig.minter_2.publicKey);
const minter3Address = PublicKey.fromBase58(allConfig.minter_3.publicKey);
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
    { name: 'minter_1', privateKey: minter_1, publicKey: minter1Address },
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