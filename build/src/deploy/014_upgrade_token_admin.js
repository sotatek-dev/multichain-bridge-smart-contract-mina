import { Mina, PrivateKey, AccountUpdate, fetchAccount } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';
// check command line arg
const allConfig = {
    token: {
        privateKey: 'EKE5MybHmdnu6cNECyC9ukvooPUNYp8bt6iTg8nqmCRewgTPh5py',
        publicKey: 'B62qpgGcAgWpVmHgWehx1dEBPnF3ZYtS6CDs96w6pdUahXzYrMVDwDb'
    },
    adminContract: {
        privateKey: 'EKDtcAGRY68upT9xuFoCZYmjd6fuWbGmB2rQqErYrYo21utmxBpr',
        publicKey: 'B62qnjWnTGRVUx1KC2HpXDCQUpM8rRrMB1TzTADfYsNDcKBey81VtMB'
    },
    bridgeContract: {
        privateKey: 'EKEpdGzvRoKk3KSjzkP43BNxQJtCwLeM6CuGygXcq4efykc6zPeK',
        publicKey: 'B62qoouqimsnJDgSPrXZHL3KHFaRmNciFp74q6ckYexov3i1M1JMTkr'
    },
    managerContract: {
        privateKey: 'EKFLqVGRPdSEZQEudVJV6PqpQBDEgfo65iLSp92QiRbKmzQMZj12',
        publicKey: 'B62qoQVt5di7SznBxfB1k9F6Yzm4PdxaLYJ8GK4EF3cQVS3hRd5FoJk'
    },
    validatorManagerContract: {
        privateKey: 'EKEinyYHYqefebMEszvnM3Q2eodewr8ehF1N84rErufpR541kaYh',
        publicKey: 'B62qmYquxXNBotKWZF1iSGF1cMWmCoaEYcUkQMiP3zwCMgUQRiRFsjj'
    },
    validator_1: {
        privateKey: 'EKDjwGCUDje2R1ox7wusssZ6CUepcBikzT5ix3nSGX43p6gWFSQk',
        publicKey: 'B62qoJqsWUtUuJq32MD4oL4pFRs5cy2R69LTwatkFrP2R9dR5bt8h16'
    },
    validator_2: {
        privateKey: 'EKFTxPcGXYzM9X2yFKDisB2RX4Gp9aMa19mniLL1FAfVPXHANHeX',
        publicKey: 'B62qko8i4iNGf2LtNukYi6rWikuL2bFU7gPfnDDM7XoGwPyBvjG5Mub'
    },
    validator_3: {
        privateKey: 'EKFZsQLYwVdtfPG4xxm5yj4FLav7QEfKEc9HG5kYGCXUHaLcPnpD',
        publicKey: 'B62qqrtLNmUrZzsaHKq1BXhv3MAQqFY6e8SzFabktYftKjEpAvSqtLP'
    },
    admin: {
        privateKey: 'EKE3qMZGrySofpUrsRjapfss2cof1zChrYQnopMN2Kp1rYkB68Zk',
        publicKey: 'B62qrVA7dzdfE333LxFfGCZ7qb67nP9qj9DJnZRidg3RE3rHZCoLcFx'
    },
    minter_1: {
        privateKey: 'EKF8C8JHFrWrGWJRCz7TM1M7KakfkNA9UstHWzx6kXMDkwLq3FRd',
        publicKey: 'B62qjr1dWH5Ph9A8KouuajGBiFsyQzmBvokgViZJ2F5j7UcXv9bfyun'
    },
    minter_2: {
        privateKey: 'EKDxyMteQvfsxevC23knLQnJsEc6i5D9TkKkTJe7SC5cZWSEWMJ4',
        publicKey: 'B62qmyEyxZiKPAfnh24eNLV7bEpb2ftQ8NMKcrVSa6PUEQaUnswxnKP'
    },
    minter_3: {
        privateKey: 'EKDrUUhe14cGpqCz3J1tCRFuUn8ruVfQYFo91VRqDTZFm1sVLAb3',
        publicKey: 'B62qicEZ4KoqxjbN6ezfqpZFUitpAbWTrFcAm1J6ofuXAUaVEKKQ7xx'
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
let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();
await fetchAccount({ publicKey: feepayerAddress });
await fetchAccount({ publicKey: managerAddress });
await fetchAccount({ publicKey: adminContractAddress });
await fetchAccount({ publicKey: validatorManagerAddress });
await fetchAccount({ publicKey: bridgeAddress });
await fetchAccount({ publicKey: tokenAddress });
// Get current verification key before upgrade
const adminContractAccount = await fetchAccount({ publicKey: adminContractAddress });
console.log("Current verification key:", adminContractAccount.account?.zkapp?.verificationKey?.hash.toString());
const adminContract = new FungibleTokenAdmin(adminContractAddress);
const verificationKey = (await FungibleTokenAdmin.compile()).verificationKey;
console.log("🚀 ~ verificationKey:", verificationKey.hash.toString());
let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString());
const upgradeTx = await Mina.transaction({ sender: feepayerAddress, fee }, async () => {
    const update = await AccountUpdate.createSigned(adminContractAddress);
    await update.account.verificationKey.set(verificationKey);
});
await upgradeTx.sign([feepayerKey, adminContractKey]).prove();
const sentTx = await upgradeTx.send();
await sentTx.wait();
console.log("🚀 ~ sentTx:", sentTx.hash);
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
//# sourceMappingURL=014_upgrade_token_admin.js.map