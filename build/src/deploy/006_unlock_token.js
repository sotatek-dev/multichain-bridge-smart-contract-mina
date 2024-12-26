import { Mina, PrivateKey, fetchAccount, PublicKey, UInt64, Bool, Signature } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';
// check command line arg
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
        privateKey: 'EKEMKffpc73ersrVG9zxuTfeVRgJMG3dquQD2xCZMji1v2eTw8yZ',
        publicKey: 'B62qrZ7fgjAZq2XnJCg16oRH2L8vjebZvHEGFxanfrwbpKvSk3fFjEy'
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
    ...receiver.toFields(),
    ...amount.toFields(),
    ...tokenAddress.toFields(),
];
const signature = await Signature.create(validator1Privkey, msg);
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
let sentTx;
// compile the contract to create prover keys
await fetchAccount({ publicKey: feepayerAddress });
try {
    // call update() and send transaction
    console.log('build transaction and create proof...');
    let tx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
        // await AccountUpdate.fundNewAccount(feepayerAddress, 1);
        await bridgeContract.unlock(amount, receiver, UInt64.from(1), tokenAddress, Bool(true), validator1, signature, Bool(false), validator2, signature, Bool(false), validator3, signature);
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