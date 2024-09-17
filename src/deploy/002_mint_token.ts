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
import { Mina, PrivateKey, AccountUpdate, fetchAccount, PublicKey, UInt64, UInt8, Bool, Field, UInt32 } from 'o1js';
import { FungibleToken, FungibleTokenAdmin, Bridge } from '../index.js';

// check command line arg

let deployAlias = process.argv[2];
if (!deployAlias)
  throw Error(`Missing <deployAlias> argument.

Usage:
node build/src/interact.js <deployAlias>
`);

const project_alias = "env_" + deployAlias;

// parse config and private key from file
type Config = {
  deployAliases: Record<
    string,
    {
      url: string;
      keyPath: string;
      fee: string;
      feepayerKeyPath: string;
      feepayerAlias: string;
    }
  >;
};
let configJson: Config = JSON.parse(await fs.readFile('config.json', 'utf8'));

let config = configJson.deployAliases[project_alias];

let feepayerKeysBase58: { privateKey: string; publicKey: string } = JSON.parse(
  await fs.readFile(config.feepayerKeyPath, 'utf8')
);

let feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);

const allConfig = 
{
  token: {
    privateKey: 'EKEKTpjMCg9ZPJLALe6mid43jRBFS9bT7fBbZEsuGQcB5chuVFUj',
    publicKey: 'B62qr73ygjzM7VDAE2DS5CsTdBa8BNPAw3hWLExHTvjB9L2XHDEiyPY'
  },
  adminContract: {
    privateKey: 'EKEsF2a22gi1YDbcks3ArNrLEn3aNdmDuTUurJDDz4kBbC64GVV3',
    publicKey: 'B62qjUdeywXRb3BKhf9TB9cqcrsWMvpLgXniEdTHsr7XDLD1JN8mns9'
  },
  bridgeContract: {
    privateKey: 'EKFFsYK1qCS6pWeHCaRGfwW6v9337PGmEvnanNnmvK5uRmeNJVCZ',
    publicKey: 'B62qkpc9CMLjrzJUkaWJjoys2BJUP6cSAqendNizZeveCGJgKoSyfhf'
  },
  managerContract: {
    privateKey: 'EKFTrjnkZAKVshpHDG1G2Rqo76CBkpnr5LiuomDoYfbeXQcTPAQe',
    publicKey: 'B62qmqooeY16gx6P8aTMoY9qPzDtkLUt6iZ4fdNrubgKCJEVqAZn6zN'
  },
  validatorManagerContract: {
    privateKey: 'EKEJ5JZ82zyQoeq6xFxaad3zc96jt8mA4F2iGwbeGqMRyXagd41q',
    publicKey: 'B62qqriDkZ9nMTic1bL1mdv5s9m1b2Cz8koNFxmPGtr25iYCGP26kNc'
  },
  validator_1: { seed: '123456789012345678901234567890123456787' },
  validator_2: { seed: '123456789012345678901234567890123456788' },
  validator_3: { seed: '123456789012345678901234567890123456789' }
}



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

const token = new FungibleToken(tokenAddress)

const symbol = 'WETH';
const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
const supply = UInt64.from(1_000_000_000_000)

await fetchAccount({publicKey: feepayerAddress})



let sentTx;
// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toBase58())
console.log("🚀 ~ token address:", tokenAddress.toBase58())
console.log("🚀 ~ bridge address:", bridgeAddress.toBase58())

const nonce = await fetchAccount({ publicKey: feepayerAddress }).then((acc) => acc.account?.nonce);
console.log("🚀 ~ nonce:", nonce?.toString())
let newNonce = nonce?.add(0);
if (newNonce === undefined) {
  newNonce  = UInt32.from(0);
}
console.log("🚀 ~ newNonce:", newNonce)



try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee},
    async () => {
      AccountUpdate.fundNewAccount(feepayerAddress, 1)
      await token.approveAccountUpdate
      await token.mint(PublicKey.fromBase58("B62qq2TYNeGeUAXsMKzKeJ8wTWnNnTnESfpGGKZXHCw8FRf23uYzqXc"), supply);
    }
  );
  await tx.prove();
  console.log('send transaction...');
  sentTx = await tx.sign([feepayerKey, tokenKey]).send();
} catch (err) {
  console.log(err);
}
console.log("=====================txhash: ", sentTx?.hash);
await sentTx?.wait();

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
