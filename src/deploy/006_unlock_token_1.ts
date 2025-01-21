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
import { FungibleToken, FungibleTokenAdmin, Bridge, Secp256k1, ValidatorManager, Manager } from '../index.js';


// check command line arg

const allConfig = 
{
  token: {
    privateKey: 'EKDvgY1NiPfnwMPLmaqRbF9J7DJ5hc3LYLceVuBLUe94MVsddnVM',
    publicKey: 'B62qm3Q7ye2L6nvYzjxe8GZXwoKcFawPRKkGdm7RKXD1Tft5hhDkLLw'
  },
  adminContract: {
    privateKey: 'EKEPuCPKwnjsN3TuxZdWJetNH51SBbybHi38awyiJRFVzusk21pA',
    publicKey: 'B62qqpAmPhSwrL4QzWV12Bt37rjuTCoZXHnbDGXZ5MjqpCHa7FDcpdf'
  },
  bridgeContract: {
    privateKey: 'EKFTiQdYrGU2n2TEM9NzFDPxEird4d52ZDmzdqE4PJNvkM575Fcj',
    publicKey: 'B62qjGpJyWYchMh1hZnKZzaSozuC23WGYkFmfZVgY9mwcJWteyPZB6L'
  },
  managerContract: {
    privateKey: 'EKEkfVUCTXwTciCURajfDqEozeegdzg4srXw5bBhukdL1svuBcHa',
    publicKey: 'B62qmg8pfMMQN6zhJbfHRTaX26YPYBSUrMACt1Mfxi1i878t6iUD2rm'
  },
  validatorManagerContract: {
    privateKey: 'EKF2kh5g3GZ6aj5kdrM4bkKCg5Kr1hZbdBuHh6JUcxziHGgCh4y8',
    publicKey: 'B62qpGoJ2P6GxcdPbhZ9kJtUbixgg6V3L2bdUVYhB69zz2mYobV42Sg'
  },
  validator_1: {
    privateKey: 'EKDyQGWs5CNgoQjvRgZWEcqYmiactpy3swRFn5FJXG1KsGCrLuEk',
    publicKey: 'B62qrLugmbbzWCij82vBTMri7VDcGdWzRUDiKEe5XzaSm9rbrG5s1th'
  },
  validator_2: {
    privateKey: 'EKEKPiUqXN4j8YH24u7BXu2UZvhmuPWshEN9EghDe7QEyKs1g4Tq',
    publicKey: 'B62qph4qJTkY5WSC7LQq8yDGjW6SGjbEBUaGNjcSWjAmbHLWZdP8SBh'
  },
  validator_3: {
    privateKey: 'EKEyyH4ctND11MbekD4FiWcoonv5tAp2WYjZ6X2SZ7wJ4zJVcEQf',
    publicKey: 'B62qnEsMkLZoW28f6U25zLTfU4i7iCfhybLdumvks66HvjPiujVAgAL'
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
    privateKey: 'EKEcHxCzajipJnzTjfaQcG7UnEV4VPxNm19zq7B1sgaosqo6UxS1',
    publicKey: 'B62qqhxtwRQG94AB4TxpdSHcC6Gp97RJDwkzcZuqig6u3xbXvMsoz8r'
  },
  minter_3: {
    privateKey: 'EKDvZthn3T94k3pLPr7TYvGouCrU7Suakk987JjxZADHjVcu7cbQ',
    publicKey: 'B62qr5LTR9qyz4tJRr2vxThza9g3SLYnspKnjcctxwed6fxYR5bnJVW'
  }
}

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
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toBase58())
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[0].toString());
console.log("🚀 ~ feepayerAddress:", feepayerAddress.toFields()[1].toString());

let tokenAddress = tokenKey.toPublicKey();
let adminContractAddress = adminContractKey.toPublicKey();
let bridgeAddress = bridgeContractKey.toPublicKey();
let managerAddress = managerContractKey.toPublicKey();
let validatorManagerAddress = validatorManagerContractKey.toPublicKey();

await fetchAccount({publicKey: managerAddress});
await fetchAccount({publicKey: validatorManagerAddress});
await fetchAccount({publicKey: bridgeAddress});
await fetchAccount({publicKey: tokenAddress});


const token = new FungibleToken(tokenAddress)
const adminContract = new FungibleTokenAdmin(adminContractAddress)
let bridgeContract = new Bridge(bridgeAddress)
// let managerContract = new Manager(managerAddress)
let validatorManagerContract = new ValidatorManager(validatorManagerAddress)

const validator1Privkey = PrivateKey.fromBase58(allConfig.validator_1.privateKey);
const validator2Privkey = PrivateKey.fromBase58(allConfig.validator_2.privateKey);
const validator3Privkey = PrivateKey.fromBase58(allConfig.validator_3.privateKey);
const validator1 = validator1Privkey.toPublicKey();
const validator2 = validator2Privkey.toPublicKey();
const validator3 = validator3Privkey.toPublicKey();


let amount = UInt64.from(200_000_000_000);

const msg = [
  ...validator1.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature = await Signature.create(validator1Privkey, msg);


const msg2 = [
  ...validator2.toFields(),
  ...amount.toFields(),
  ...tokenAddress.toFields(),
]
const signature2 = await Signature.create(validator1Privkey, msg2);



const currentManager = await bridgeContract.manager.get();
console.log("🚀 ~ currentManager:", currentManager.toBase58())
console.log("🚀 ~ currentManager:", currentManager.toFields()[0].toString());

let managerContract = new Manager(currentManager)
const minter1 = await managerContract.minter_1.get();
const minter2 = await managerContract.minter_2.get();
const minter3 = await managerContract.minter_3.get();
console.log("🚀 ~ currentManager1:", minter1.toBase58());
console.log("🚀 ~ currentManager2:", minter2.toBase58());
console.log("🚀 ~ currentManager3:", minter3.toBase58());
await fetchAccount({publicKey: feepayerAddress});
let userUpdated = AccountUpdate.createSigned(feepayerAddress);
let nonce = userUpdated.account.nonce.get(); // nonce that o1js _thinks_ 
console.log("🚀 ~ it ~ nonce:", nonce.toString())


// compile the contract to create prover keys
// await fetchAccount({publicKey: feepayerAddress});
try {
  // call update() and send transaction
  console.log('build transaction and create proof...');
  let tx = await Mina.transaction(
    { sender: feepayerAddress, fee },
    async () => {
      await AccountUpdate.fundNewAccount(feepayerAddress, 1);
      await bridgeContract.unlock(
        amount,
        validator1,
        UInt64.from(1),
        tokenAddress,
        Bool(true),
        validator1,
        signature,
        Bool(false),
        validator2,
        signature,
        Bool(false),
        validator3,
        signature,
      );
    }
  );

  tx.sign([feepayerKey])
  await tx.prove()


  const sentTx = await tx.send();
  await sentTx.wait();
  console.log("🚀 ~ sentTx:", sentTx.hash)
} catch (err) {
  console.log(err);
}

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
