import {
  PublicKey,
  SmartContract,
  State,
  UInt64,
  method,
  state,
  Struct,
  Bool,
  DeployArgs,
  Provable,
  Field,
  MerkleMap,
  Signature
} from 'o1js'

import { FungibleToken } from "mina-fungible-token"
import { ValidatorManager } from './ValidatorManager.js';
import { Manager } from './Manager.js';

class UnlockEvent extends Struct({
  receiver: PublicKey,
  tokenAddress: PublicKey,
  amount: UInt64,
  id: UInt64,
}) {
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
}) {
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

  events = { "Unlock": UnlockEvent, "Lock": LockEvent };

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
    validator1: PublicKey,
    sig1: Signature,
    useSig2: Bool,
    validator2: PublicKey,
    sig2: Signature,
    useSig3: Bool,
    validator3: PublicKey,
    sig3: Signature,
  ) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    const msg = [
      ...receiver.toFields(),
      ...amount.toFields(),
      ...tokenAddr.toFields(),
    ]
    this.validateValidator(
      useSig1,
      validator1,
      useSig2,
      validator2,
      useSig3,
      validator3,
    );

    this.validateSig(msg, sig1, validator1, useSig1);
    this.validateSig(msg, sig2, validator2, useSig2);
    this.validateSig(msg, sig3, validator3, useSig3);
    const token = new FungibleToken(tokenAddr)
    await token.mint(receiver, amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddr, amount, id));
  }

  public async validateValidator(
    useSig1: Bool,
    validator1: PublicKey,
    useSig2: Bool,
    validator2: PublicKey,
    useSig3: Bool,
    validator3: PublicKey,
  ) {

    let count = UInt64.from(0);
    const zero = Field.from(0);
    const falseB = Bool(false);
    const trueB = Bool(true);
    const validatorManager = new ValidatorManager(this.validatorManager.getAndRequireEquals());
    const validateIndex = async (validator: PublicKey, useSig: Bool) => {
      const index = await validatorManager.getValidatorIndex(validator);
      const isGreaterThanZero = index.greaterThan(zero);
      let isOk = Provable.if(useSig, Provable.if(isGreaterThanZero, trueB, falseB), trueB);
      isOk.assertTrue("Public key not found in validators");
    };

    const notDupValidator12 = Provable.if(useSig1.and(useSig2), Provable.if(validator1.equals(validator2), falseB, trueB), trueB);
    const notDupValidator13 = Provable.if(useSig1.and(useSig3), Provable.if(validator1.equals(validator3), falseB, trueB),trueB);
    const notDupValidator23 = Provable.if(useSig2.and(useSig3), Provable.if(validator2.equals(validator3), falseB, trueB), trueB);

    const isDuplicate = Provable.if(
      notDupValidator12.and(notDupValidator13).and(notDupValidator23),
      falseB,
      trueB,
    );

    isDuplicate.assertFalse("Duplicate validator keys");

    count = Provable.if(useSig1, count.add(1), count);
    count = Provable.if(useSig2, count.add(1), count);
    count = Provable.if(useSig3, count.add(1), count);
    count.assertGreaterThanOrEqual(this.threshold.getAndRequireEquals(), "Not reached threshold");

  }

  public async validateSig(msg: Field[], signature: Signature, validator: PublicKey, useSig: Bool) {
    let isValidSig = signature.verify(validator, msg);
    const isValid = Provable.if(useSig, isValidSig, Bool(true));
    isValid.assertTrue("Invalid signature");
  }

  public async verifyMsg(publicKey: PublicKey, msg: Field[], sig: Signature) {
    const isOk = await sig.verify(publicKey, msg);
    Provable.log("isOk", isOk.toString());
  }

}