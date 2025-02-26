import { Mina, PrivateKey, fetchAccount, UInt64, Signature } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';
// check command line arg
const allConfig = {
    token: {
        privateKey: 'EKDr9hBqdjwZLecmphNF9cXWRBSWXHfSsnD2Pid5r2BUBmLiLoqM',
        publicKey: 'B62qjHAiGSN1tEvp2E9TgPVxyyomwJFr8PKCB3yqKQL7AgJ7ieZ8j5L'
    },
    adminContract: {
        privateKey: 'EKEHoabgJxLtvYFNnmsNkLo9mY1SZxipU3FjUpy1scBcjW2DF26f',
        publicKey: 'B62qpyKsmMrHaiyMsuqggLSJbucfWVesh6LqY5kAvz7dTzhzgtx8826'
    },
    bridgeContract: {
        privateKey: 'EKFMw2TtZoEaFgNDULA7PHikkvdqq4WGkP2SLTJP7gTfUAtTFdfD',
        publicKey: 'B62qraiMK838V8f5DvsmquRRtc6zi1X9u8v257NHCFnX5QQzj9G365s'
    },
    managerContract: {
        privateKey: 'EKF197bgnQtP7qNqNYwNtkndPAyPyv2RQgySqEZ8cwfNXCEGXRka',
        publicKey: 'B62qqyMbSpoXTLimCaDgtmu8scdmrDxUykjjreurn18YLkeZ6NJJLhY'
    },
    validatorManagerContract: {
        privateKey: 'EKFEjraTPnWmcuuABWUVwm4HFndJnMu5U2ox8tSFiWLcvTrHaTmz',
        publicKey: 'B62qqarGzKhX18JgNePZGcqSowJg3T3YaStwj2uigs86C2ypSAcT9Sa'
    },
    validator_1: {
        privateKey: 'EKDu1Jrm9LQ4yTZjNjcDvNggdvvwusjDSe7Krk43u3fLUTmcjRaW',
        publicKey: 'B62qog352TxV8ug4o9TkQEsTEEWSpC6ERkXfq3bgZJvyBhraJ1VQ32H'
    },
    validator_2: {
        privateKey: 'EKDjeb9oqvcvddLpPoGymM7CeECyv2YiBeSsvtMxgvxbCSR6tokA',
        publicKey: 'B62qke4TwFqcmRL7FxVPNrz6Ne8YKVU1japGC5FMXoT9SfvTETHmKZz'
    },
    validator_3: {
        privateKey: 'EKEHPrdTJdweigymbws2dAMUimoz8eapmrNZqkcz19z6svyYvB8A',
        publicKey: 'B62qm75B7en1F5b8WVq4cxq6EAyoFVGtVBQiduJTRdchzh2kVQfJ25P'
    },
    admin: {
        privateKey: "EKDzBD67hfEP6FGteCMxQPkzLwWPvG7sdNtXprjLjuBNNgQbVCRD",
        publicKey: "B62qjEURvygCt8F1k268edeUuy4RjmBtKibhpxnQxWXSxHhb1ZX3h4q"
    },
    minter_1: {
        privateKey: "EKDzBD67hfEP6FGteCMxQPkzLwWPvG7sdNtXprjLjuBNNgQbVCRD",
        publicKey: "B62qjEURvygCt8F1k268edeUuy4RjmBtKibhpxnQxWXSxHhb1ZX3h4q"
    },
    minter_2: {
        privateKey: 'EKFWi6XGsK9Wruu2pc9cLroKSggUrcs6XC2GTmbn1AwgHGkk3cdK',
        publicKey: 'B62qrPwF3qKJvysk2ji248C22WnBiFLVsKqU7XdSrcj3P4wUByDbQfP'
    },
    minter_3: {
        privateKey: 'EKEaKn1d8cfaLV32RA7abzkaiRXp45dwViEzrHdQ9uHb4kpWZest',
        publicKey: 'B62qr2CLY4vgaZb9T9oW7RBKaKpL2NURTEkcVC6KHmLeYvGZKRfPPGp'
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
await fetchAccount({ publicKey: managerAddress });
await fetchAccount({ publicKey: validatorManagerAddress });
await fetchAccount({ publicKey: bridgeAddress });
await fetchAccount({ publicKey: tokenAddress });
const token = new FungibleToken(tokenAddress);
const adminContract = new FungibleTokenAdmin(adminContractAddress);
let bridgeContract = new Bridge(bridgeAddress);
// let managerContract = new Manager(managerAddress)
let validatorManagerContract = new ValidatorManager(validatorManagerAddress);
const validator1Privkey = PrivateKey.fromBase58(allConfig.validator_1.privateKey);
const validator2Privkey = PrivateKey.fromBase58(allConfig.validator_2.privateKey);
const validator3Privkey = PrivateKey.fromBase58(allConfig.validator_3.privateKey);
const validator1 = validator1Privkey.toPublicKey();
const validator2 = validator2Privkey.toPublicKey();
const validator3 = validator3Privkey.toPublicKey();
let amount = UInt64.from(200000000000);
const msg = [
    ...validator1.toFields(),
    ...amount.toFields(),
    ...tokenAddress.toFields(),
];
const signature = await Signature.create(validator1Privkey, msg);
console.log("🚀 ~ signature:", signature.toJSON());
// const msg2 = [
//   ...validator2.toFields(),
//   ...amount.toFields(),
//   ...tokenAddress.toFields(),
// ]
// const signature2 = await Signature.create(validator1Privkey, msg2);
// const currentManager = await bridgeContract.manager.get();
// console.log("🚀 ~ currentManager:", currentManager.toBase58())
// console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());
// let managerContract = new Manager(currentManager)
// const minter1 = await managerContract.minter_1.get();
// const minter2 = await managerContract.minter_2.get();
// const minter3 = await managerContract.minter_3.get();
// console.log("🚀 ~ currentManager1:", minter1.toBase58());
// console.log("🚀 ~ currentManager2:", minter2.toBase58());
// console.log("🚀 ~ currentManager3:", minter3.toBase58());
// await fetchAccount({publicKey: feepayerAddress});
// let userUpdated = AccountUpdate.createSigned(feepayerAddress);
// let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
// console.log("🚀 ~ it ~ nonce:", nonce.toString())
// // compile the contract to create prover keys
// // await fetchAccount({publicKey: feepayerAddress});
// try {
//   // call update() and send transaction
//   console.log('build transaction and create proof...');
//   let tx = await Mina.transaction(
//     { sender: feepayerAddress, fee },
//     async () => {
//       await AccountUpdate.fundNewAccount(feepayerAddress, 1);
//       await bridgeContract.unlock(
//         amount,
//         validator1,
//         UInt64.from(1),
//         tokenAddress,
//         Bool(true),
//         validator1,
//         signature,
//         Bool(false),
//         validator2,
//         signature,
//         Bool(false),
//         validator3,
//         signature,
//       );
//     }
//   );
//   tx.sign([feepayerKey])
//   await tx.prove()
//   const sentTx = await tx.send();
//   await sentTx.wait();
//   console.log("🚀 ~ sentTx:", sentTx.hash)
// } catch (err) {
//   console.log(err);
// }
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
//# sourceMappingURL=006_unlock_token_1.js.map