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
import { ValidatorManager } from './ValidatorManager.js';
import { Manager } from './Manager.js';

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
  @state(UInt64) minAmount = State<UInt64>();
  @state(UInt64) maxAmount = State<UInt64>();
  @state(UInt64) threshold = State<UInt64>();
  @state(PublicKey) validatorManager = State<PublicKey>();
  @state(PublicKey) manager = State<PublicKey>();

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  async deploy(args: DeployArgs & { 
    minAmount: UInt64,
    maxAmount: UInt64,
    threshold: UInt64,
    validatorPub: PublicKey,
    manager: PublicKey,
  }) {
    await super.deploy(args)
    this.minAmount.set(args.minAmount);
    this.maxAmount.set(args.maxAmount);
    this.validatorManager.set(args.validatorPub);
    this.threshold.set(args.threshold);
    this.manager.set(args.manager);

  }

  @method async setAmountLimits(newMinAmount: UInt64, newMaxAmount: UInt64) {
    // Ensure the caller is the manager
    
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Set the new minimum and maximum amounts
    this.minAmount.set(newMinAmount);
    this.maxAmount.set(newMaxAmount);

    // Ensure the new minimum is less than or equal to the new maximum
    newMinAmount.assertLessThanOrEqual(newMaxAmount);
  }

  @method async changeManager(newManager: PublicKey) {
    // Ensure the caller is the current manager
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the manager
    this.manager.set(newManager);
  }

  @method async changeValidatorManager(validatorManager: PublicKey) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the validator manager
    this.validatorManager.set(validatorManager);
  }

  @method async lock(amount: UInt64, address: Field, tokenAddr: PublicKey) {
    // Check if the amount is within the allowed range
    const minAmount = this.minAmount.getAndRequireEquals();
    const maxAmount = this.maxAmount.getAndRequireEquals();
    
    amount.assertGreaterThanOrEqual(minAmount, "Amount is less than minimum allowed");
    amount.assertLessThanOrEqual(maxAmount, "Amount exceeds maximum allowed");
    const token = new FungibleToken(tokenAddr);
    await token.burn(this.sender.getAndRequireSignature(), amount);
    this.emitEvent("Lock", new LockEvent(this.sender.getAndRequireSignature(), address, amount, tokenAddr));

  }

  @method async unlock(
    amount: UInt64,
    receiver: PublicKey,
    id: UInt64,
    tokenAddr: PublicKey,
    useSig1: Bool,
    signature_1: Ecdsa,
    validator_1: Secp256k1,
    useSig2: Bool,
    signature_2: Ecdsa,
    validator_2: Secp256k1,
    useSig3: Bool,
    signature_3: Ecdsa,
    validator_3: Secp256k1,
  ) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    let msg = Bytes256.fromString(`unlock receiver = ${receiver.toFields} amount = ${amount.toFields} tokenAddr = ${tokenAddr.toFields}`);
    this.validateValidator(
      useSig1,
      validator_1,
      useSig2,
      validator_2,
      useSig3,
      validator_3,
    );

    this.validateSig(msg, signature_1, validator_1, useSig1);
    this.validateSig(msg, signature_2, validator_2, useSig2);
    this.validateSig(msg, signature_3, validator_3, useSig3);

    const token = new FungibleToken(tokenAddr)
    await token.mint(receiver, amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddr, amount, id));
  }
  public isValidator(validator: Secp256k1, useSig: Bool): Bool {
    const validatorManager = new ValidatorManager(this.validatorManager.getAndRequireEquals());
    let isValid = Bool(false);
    Provable.asProver(() => {
      const x = Field.from(validator.x.toBigInt());
      const y = Field.from(validator.y.toBigInt());
      isValid = useSig.toBoolean() ? validatorManager.isValidator(x, y): Bool(false);
      Provable.log("isValid", isValid);
     })
    return isValid;
  }

  public validateValidator(
    useSig1: Bool,
    validator_1: Secp256k1,
    useSig2: Bool,
    validator_2: Secp256k1,
    useSig3: Bool,
    validator_3: Secp256k1,
    ) {
    let count = UInt64.from(0);

    Provable.asProver(async () => {
      const map = new MerkleMap();

      const checkValidator = (useSig: Bool, validator: Secp256k1) => {
        if (useSig.toBoolean()) {
          const x = Field.from(validator.x.toBigInt());
          const y = Field.from(validator.y.toBigInt());
          let yMap = map.get(x);
          yMap.assertNotEquals(y);
          map.set(x, y);
        }
      };

      checkValidator(useSig1, validator_1);
      checkValidator(useSig2, validator_2);
      checkValidator(useSig3, validator_3);
    })
    
    if (this.isValidator(validator_1, useSig1).toBoolean()) {
      count = count.add(1);
    }
    if (this.isValidator(validator_2, useSig2).toBoolean()) {
      count = count.add(1);
    }
    if (this.isValidator(validator_3, useSig3).toBoolean()) {
      count = count.add(1);
    }
    Provable.log("count", count);
   
    count.assertGreaterThanOrEqual(this.threshold.getAndRequireEquals(), "Not enough validators");
  }

  public async validateSig(msg: Bytes256, signature: Ecdsa, validator: Secp256k1, useSig: Bool) {
    let isValid = Bool(false);
    Provable.asProver(async () => {
      if (useSig.toBoolean()) {
        isValid = await this.validateMsg(msg, signature, validator);
        Provable.log("validateMsg isValid", isValid);
        isValid.assertTrue("Invalid signature for validator");
      }
    })
    
  }

  public async validateMsg(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1): Promise<Bool> {
    let proof = await signature.verifyV2(message, publicKey);
    Provable.log("proof", proof);
    return proof;
  }

}