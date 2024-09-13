import {
  PublicKey,
  SmartContract,
  State,
  UInt64,
  method,
  state,
  Struct,
  CircuitString,
  Bool,
  DeployArgs,
  Permissions,
  Provable,
  Field,
  ZkProgram,
  Crypto,
  createEcdsaV2,
  createForeignCurveV2,
  Poseidon,
  MerkleMap,
  MerkleMapWitness,
  fetchAccount
} from 'o1js'

import { FungibleToken } from "mina-fungible-token"

import { Secp256k1, Ecdsa, keccakAndEcdsa, ecdsa, Bytes32, Bytes256 } from './ecdsa/ecdsa.js';

class UnlockEvent extends Struct({
  receiver: PublicKey,
  tokenAddress: PublicKey,
  amount: UInt64,
  id: UInt64,
}){
  constructor(
      receiver: PublicKey,
      tokenAddress: PublicKey,
      amount: UInt64,
      id: UInt64,
  ) {
    super({ receiver, tokenAddress, amount, id });
  }
}

class LockEvent extends Struct({
  locker: PublicKey,
  receipt: Field,
  amount: UInt64,
  tokenAddress: PublicKey
}){
  constructor(locker: PublicKey, receipt: Field, amount: UInt64, tokenAddress: PublicKey) {
    super({ locker, receipt, amount, tokenAddress });
  }
}

export class Bridge extends SmartContract {
  @state(PublicKey) minter = State<PublicKey>();
  @state(PublicKey) admin = State<PublicKey>()
  // @state (Field) settingMapRoot = State<Field>()
  // @state(Field) validatorsMapRoot = State<Field>()

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  // static readonly MIN_AMOUNT_KEY = Field(1);
  // static readonly MAX_AMOUNT_KEY = Field(2);
  // static readonly THRESHOLD_KEY = Field(3);

  @method async decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
  }

  async deploy(args: DeployArgs & { 
    validatorsMapRoot: Field,
    minAmount: UInt64,
    maxAmount: UInt64,
    threshold: UInt64,
  }) {
    await super.deploy(args)
    Provable.log("Deployed Bridge contract", this.sender.getAndRequireSignature());
    this.admin.set(this.sender.getAndRequireSignature());
    this.minter.set(this.sender.getAndRequireSignature());
    Provable.log("Function Initialize settings and validators map");
    Provable.log("Minter set to", this.sender.getAndRequireSignature());
    const settingsMap = new MerkleMap();
    // this.settingMapRoot.set(settingsMap.getRoot());
    // this.validatorsMapRoot.set(args.validatorsMapRoot);
  }

  @method async changeAdmin(_admin: PublicKey) {
    this.admin.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    this.admin.set(_admin);
  }

  @method async setValidator(xKey: Field, yKey: Field, isOk: Bool) {
    this.admin.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    const yKeyOrZero = Provable.if(isOk, yKey, yKey);
    Provable.log("Set validator", xKey, yKey);
    // this.validatorsMap.set(yKeyOrZero, yKeyOrZero);
    // let minAmount = UInt64.from(0);
    // this.validatorsMap.set(
    //   Bridge.MIN_AMOUNT_KEY,
    //   minAmount.toFields()[0]
    // );
  }

  // @method async updateSetting(key: Field, value: UInt64, witness: MerkleMapWitness) {
  //   this.admin.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    
  //   const currentRoot = this.settingMapRoot.getAndRequireEquals();
  //   const [newRoot, _] = witness.computeRootAndKeyV2(value.toFields()[0]);
  //   // Verify that the provided witness is correct for the given key
  //   witness.computeRootAndKeyV2(key)[0].assertEquals(currentRoot);
    
  //   // Update the root with the new value
  //   this.settingMapRoot.set(newRoot);
  // }

  @method async lock(amount: UInt64, address: Field, tokenAddr: PublicKey) {
    
    // Get the current settingMapRoot
  //  const minAmount = UInt64.fromFields([this.settingsMap.get(Bridge.MIN_AMOUNT_KEY)]);
  //  const maxAmount = UInt64.fromFields([this.settingsMap.get(Bridge.MAX_AMOUNT_KEY)]);

    // Verify that the amount is within the allowed range
    // amount.assertGreaterThanOrEqual(minAmount, "Amount is less than minimum allowed");
    // amount.assertLessThanOrEqual(maxAmount, "Amount is greater than maximum allowed");
    const token = new FungibleToken(tokenAddr);
    await token.burn(this.sender.getAndRequireSignature(), amount);
    this.emitEvent("Lock", new LockEvent(this.sender.getAndRequireSignature(), address, amount, tokenAddr));

  }

  // @method async test(value: Field[]) {
  //   Provable.log("Testing", value);
  // }

  @method async unlock(
    amount: UInt64,
    receiver: PublicKey,
    id: UInt64,
    tokenAddr: PublicKey,
    signature_1: Ecdsa,
    validator_1: Secp256k1,
    signature_2: Ecdsa,
    validator_2: Secp256k1,
    signature_3: Ecdsa,
    validator_3: Secp256k1,
    signature_4: Ecdsa,
    validator_4: Secp256k1,
    signature_5: Ecdsa,
    validator_5: Secp256k1
  ) {
    this.minter.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    // if (signatures.length !== validators.length) {
    //   Provable.log('Signatures length does not match validators length');
    //   throw new Error('Signatures length does not match validators length');
    // }
    // let threshold = UInt64.fromFields([this.settingsMap.get(Bridge.THRESHOLD_KEY)]);
    // if (UInt64.from(signatures.length) < threshold) {
    //   Provable.log('Not enough signatures');
    //   throw new Error('Not enough signatures');
    // }

    let msg = Bytes256.fromString(`unlock receiver = ${receiver.toFields} amount = ${amount.toFields} tokenAddr = ${tokenAddr.toFields}`);
    let listValidators: { [key: string]: string } = {};
    // this.validateValidator(validators);
    let isOk = await this.validateMsg(msg, signature_1, validator_1);
    isOk.assertTrue("Invalid signature 1");
    // isOk = await this.validateMsg(msg, signature_2, validator_2);
    // isOk.assertTrue("Invalid signature 2");
    // isOk = await this.validateMsg(msg, signature_3, validator_3);
    // isOk.assertTrue("Invalid signature 3");
    // isOk = await this.validateMsg(msg, signature_4, validator_4);
    // isOk.assertTrue("Invalid signature 3");
    // isOk = await this.validateMsg(msg, signature_5, validator_5);
    // isOk.assertTrue("Invalid signature 3");

    // let count = UInt64.from(0);

    // for (let i = 0; i < validators.length; i++) {
    //   const validator = validators[i];
    //   const xKey = validator.x.toBigInt().toString();
    //   const yValue = validator.y.toBigInt().toString();

    //   if (!listValidators[xKey]) {
    //     listValidators[xKey] = yValue;
    //     continue;
    //   }

    //   if (listValidators[xKey] === yValue) {
    //     Provable.log('Duplicate validator found');
    //     throw new Error('Duplicate validator found');
    //   }

    //   listValidators[xKey] = yValue;
    //   this.validateValidator(validator);
    //   const isOk = await this.validateMsg(msg, signatures[i], validator);
    //   if (!isOk) {
    //     throw new Error('Invalid signature');
    //   }
    // }
    const token = new FungibleToken(tokenAddr)
    await token.mint(receiver, amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddr, amount, id));
  }

  // @method.returns(Bool)
  public async checkProof(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1): Promise<Bool> {
    let proof = await keccakAndEcdsa.verifyEcdsa(message, signature, publicKey);
    Provable.log(proof);
    return proof.publicOutput;
  }


  public async validateMsg(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1): Promise<Bool> {
    let proof = await signature.verifyV2(message, publicKey);
    Provable.log("proof", proof);
    return proof;
  }

  public secp256k1ToPublicKey(secp256k1Key: Secp256k1) {
    // Convert Secp256k1 key to Field array
    const keyFields = [secp256k1Key.x.toBigInt().toString(), secp256k1Key.y.toBigInt().toString()];
    Provable.log('x', keyFields[0]);
    Provable.log('y', keyFields[1]);
    // Hash the Fields to create a single Field
    // const hashedKey = Poseidon.hash(keyFields);

    // Convert the hashed Field to a PublicKey
    // return PublicKey.fromFields([hashedKey]);
  }

  public validateValidator(validator: Secp256k1) {
    const xKey = validator.x.toBigInt().toString();
    const yValue = validator.y.toBigInt().toString();
    // const check = this.settingsMap.get(Field.from(xKey)).assertEquals(Field.from(yValue));
    // Provable.log('check', check);
  }

  public isValidator(validator: Secp256k1): Bool {
    const xKey = validator.x.toBigInt().toString();
    const yValue = validator.y.toBigInt().toString();
    // const check = this.validatorsMap.get(Field.from(xKey)).equals(Field.from(yValue));
    // Provable.log('check', check);
    // return check;
    return Bool(true);;
  }

}