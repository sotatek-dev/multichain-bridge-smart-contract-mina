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
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, UInt8, Bool, Field, Signature } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge, ValidatorManager, Manager } from '../index.js';


// check command line arg

const allConfig = 
{
  token: {
    privateKey: 'EKDvfxpNvF9zcg6pqcuUkKZn65LXSP9xEQcmHd2ZADkJ68kX6HEK',
    publicKey: 'B62qjN2JqvTCPK1VhpC6hkQa3DLgNAy9ivADNoSThTCM8vB66KjrLr9'
  },
  adminContract: {
    privateKey: 'EKEy3Crg1gvtNgR2GcnWkQBGNJjHCwWPEthovzXKQMJZ819xJocA',
    publicKey: 'B62qmAQ1S6Bnonvqf1tqfJV6eLRusQZ2Hk5268pzi2nZvmAWgQ93nkJ'
  },
  bridgeContract: {
    privateKey: 'EKE9CDuW71shmTutA6iifdn5F4FFL7pjjtYhMrvsxeWV8tufcMF1',
    publicKey: 'B62qpM9gRkgmRfZ6JFmZ4imKNJB58PYiaEDVCsFg5QvUTaT3cXsRLg2'
  },
  managerContract: {
    privateKey: 'EKDtK97KfSCQhDnfJGferQKq3JZAHqikGhRwdisNDh14DpsX8BKe',
    publicKey: 'B62qoqBVw9nXG7SNWtuntdXtTAELAe8fMKn5WBJM2pDzL8L9NHp7UbV'
  },
  validatorManagerContract: {
    privateKey: 'EKEF7R4xR7RSehHaFfkmJVnBLxX4RvXpGTPTbdUXLVCh4GacMn1p',
    publicKey: 'B62qrgVKH6Rd8G3YaS33cqaT18tAdXXksngmEzrn8q957fpcs1Bmskz'
  },
  validator_1: {
    privateKey: 'EKEY2ezSkDBWz3G4CYgDwDJckUn3yUtUAKsBfQ5XMoFE82g3abM4',
    publicKey: 'B62qkoyyJsms8mEJk74aFn6p2Y5nPNR5mgRKyUianMYMFaqQmK43fpE'
  },
  validator_2: {
    privateKey: 'EKEC7Vor9iL6qwz5UHNcWxVB3Y9DDB2u9oPLMo6cibyoX8HgAJbw',
    publicKey: 'B62qpJtPF3gQkfn4pXVYrADcwPBU2ogeox5fr5mS5rvqBZtysocg6B8'
  },
  validator_3: {
    privateKey: 'EKF5tK8MTbdj2q1i1gz5Pkb9KWKTnRVyuou16Qp6CEvqwyUT4A4b',
    publicKey: 'B62qpQQShEfBzJ1ZdtdFcLZ959EKEZ8EgBtYiqh1qPzk2aQUM5qRADD'
  },
  admin: {
    privateKey: 'EKEJGajgS77nvYvXN4JFuRMJLihPyKM WAiemJYVRfWRFndrdGzRs',
    publicKey: 'B62qmWDjTW1SLzrVkQ3Zr5FUFjAWf2KFTPJzQxyGKWpL2uitX3EK9p4'
  },
  minter_1: {
    privateKey: 'EKEQb3UzmvKyDni3s36ayBz7vonmKrtqfgdQZGhq8wa15EV3pDqL',
    publicKey: 'B62qjusMTNamLwcJeWhfQAozoRZgVfeTn3MvbDDm8k7g3rkdYeC1zoZ'
  },
  minter_2: {
    privateKey: 'EKEWLLTZNNmKrohPksxxkEVLSNkGHVj3zJFektx7AC1ApysFTSnt',
    publicKey: 'B62qnhdPmrEb2aGrUZdC8nEnBnLqcseCY1ne4L67Ayc5ryppbdcTce7'
  },
  minter_3: {
    privateKey: 'EKEjYNhfrmHxoUmeyWuuZFg2M8rL9XcBd9b8XDAgrEAbijvdLDpX',
    publicKey: 'B62qrCWt2kJnFtD7noh6sGK2wEJKUKb8RAbkBeKda91cTmofE2Uz1uo'
  }
}

let feepayerKey = PrivateKey.fromBase58(allConfig.minter_1.privateKey);



let tokenKey = PrivateKey.fromBase58(allConfig["token"].privateKey);
let adminContractKey = PrivateKey.fromBase58(allConfig["adminContract"].privateKey);
let bridgeContractKey = PrivateKey.fromBase58(allConfig["bridgeContract"].privateKey);
let managerContractKey = PrivateKey.fromBase58(allConfig["managerContract"].privateKey);
let validatorManagerContractKey = PrivateKey.fromBase58(allConfig["validatorManagerContract"].privateKey);

// set up Mina instance and contract we interact with
const MINAURL = 'https://api.minascan.io/node/devnet/v1/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql';

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

await fetchAccount({publicKey: feepayerAddress});
await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: adminContractAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});
await fetchAccount({publicKey: tokenAddress});

// Get current verification key before upgrade
const adminContractAccount = await fetchAccount({publicKey: adminContractAddress});
console.log("Current verification key:", adminContractAccount.account?.zkapp?.verificationKey?.hash.toString());

const adminContract = new FungibleTokenAdmin(adminContractAddress)

const verificationKey = (await FungibleTokenAdmin.compile()).verificationKey;
console.log("🚀 ~ verificationKey:", verificationKey.hash.toString())



let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString())

const upgradeTx = await Mina.transaction({ sender: feepayerAddress, fee },
  async () => {
    const update = await AccountUpdate.createSigned(adminContractAddress);
    await update.account.verificationKey.set(verificationKey);
  }
);
await upgradeTx.sign([feepayerKey]).prove();

const sentTx = await upgradeTx.send();
await sentTx.wait();
console.log("🚀 ~ sentTx:", sentTx.hash)

// // Get current verification key before upgrade
// const adminContractAccount = await fetchAccount({publicKey: adminContractAddress});
// console.log("Current verification key:", adminContractAccount.account?.zkapp?.verificationKey?.hash.toString());

// const adminContract = new FungibleTokenAdmin(adminContractAddress)

// const newVerificationKey = (await FungibleToken.compile()).verificationKey;
// console.log("🚀 ~ verificationKey:", newVerificationKey.hash.toString())



// // let userUpdated = AccountUpdate.createSigned(feepayerAddress);
// // let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
// // console.log("🚀 ~ it ~ nonce:", nonce.toString())

// const upgradeTx = await Mina.transaction({ sender: feepayerAddress, fee },
//   async () => {
//     // const update = await AccountUpdate.createSigned(adminContractAddress);
//     // await update.account.verificationKey.set(verificationKey);
//     await adminContract.updateVerificationKey(newVerificationKey);
//   }
// );
// await upgradeTx.sign([feepayerKey]).prove();

// const sentTx = await upgradeTx.send();
// await sentTx.wait();
// console.log("🚀 ~ sentTx:", sentTx.hash)



function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
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
