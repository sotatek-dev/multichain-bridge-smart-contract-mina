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
  Signature,
  Encoding
} from 'o1js'

import { FungibleToken } from "./FungibleToken.js";
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js";
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
  @state(PublicKey) validatorManager = State<PublicKey>();
  @state(PublicKey) manager = State<PublicKey>();
  @state(UInt64) nonce = State<UInt64>();
  @state(UInt64) threshold = State<UInt64>();
  @state(Bool) checkState = State<Bool>();

  events = { "Unlock": UnlockEvent, "Lock": LockEvent };

  async deploy(args: DeployArgs & {
    threshold: UInt64,
    validatorPub: PublicKey,
    manager: PublicKey,
  }) {
    await super.deploy(args)
    this.validatorManager.set(args.validatorPub);
    this.threshold.set(args.threshold);
    this.manager.set(args.manager);
    this.checkState.set(Bool(false));

  }

  @method async changeManager(newManager: PublicKey) {
    // Ensure the caller is the current manager
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the manager
    this.manager.set(newManager);
  }

  @method async changeThreshold(newThreshold: UInt64) {
    // Ensure the caller is the current manager
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the threshold
    this.threshold.set(newThreshold);
  }

  @method async changeValidatorManager(validatorManager: PublicKey) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the validator manager
    this.validatorManager.set(validatorManager);
  }

  @method async lock(amount: UInt64, address: Field, tokenAddr: PublicKey) {
    // Check if the amount is within the allowed range
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isValidAmount(amount);
    const token = new FungibleToken(tokenAddr);
    await token.burn(this.sender.getAndRequireSignature(), amount);
    this.emitEvent("Lock", new LockEvent(this.sender.getAndRequireSignature(), address, amount, tokenAddr));

  }

  @method async unlock(
    amount: UInt64,
    receiver: PublicKey,
    id: UInt64,
    tokenAddr: PublicKey,
    nonce: UInt64,
    useSig1: Bool,
    validator1: PublicKey,
    sig1: Signature,
    useSig2: Bool,
    validator2: PublicKey,
    sig2: Signature,
    useSig3: Bool,
    validator3: PublicKey,
    sig3: Signature
  ) {
    this.nonce.requireEquals(nonce);
    const DOMAIN = Encoding.stringToFields("MINA_BRIDGE")[0];
    if (!DOMAIN) {
      throw new Error("DOMAIN is undefined");
    }
    const scAddress = await this.address;
    const managerAddress = this.manager.getAndRequireEquals()
    const managerZkapp = new Manager(managerAddress);
    managerZkapp.isMinter(this.sender.getAndRequireSignature());
    const msg = [
      ...DOMAIN.toFields(),
      ...nonce.toFields(),
      ...scAddress.toFields(),
      ...receiver.toFields(),
      ...amount.toFields(),
      ...tokenAddr.toFields(),
    ];

    await this.validateValidator(
      useSig1,
      validator1,
      useSig2,
      validator2,
      useSig3,
      validator3
    );

    await this.validateSig(msg, sig1, validator1, useSig1);
    await this.validateSig(msg, sig2, validator2, useSig2);
    await this.validateSig(msg, sig3, validator3, useSig3);
    const token = new FungibleToken(tokenAddr);
    const adminAddr = await token.admin.get();
    const adminContract = new FungibleTokenAdmin(adminAddr);
    await this.checkState.set(Bool(true));
    await adminContract.mint(receiver, amount, tokenAddr);
    await this.checkState.set(Bool(false));
    this.emitEvent('Unlock', new UnlockEvent(receiver, tokenAddr, amount, id));
  }

  @method async assertInsideUpdate() {
    await this.checkState.requireEquals(Bool(true));
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
    const validatorManager = new ValidatorManager(this.validatorManager.getAndRequireEquals());
    count = Provable.if(useSig1, count.add(1), count);
    count = Provable.if(useSig2, count.add(1), count);
    count = Provable.if(useSig3, count.add(1), count);
    count.assertGreaterThanOrEqual(this.threshold.getAndRequireEquals(), "Not reached threshold");

    const index1 = await validatorManager.getValidatorIndex(validator1);
    const index2 = await validatorManager.getValidatorIndex(validator2);    
    const index3 = await validatorManager.getValidatorIndex(validator3);
    
    const isValid1 = Provable.if(useSig1, index1.equals(Field(1)), Bool(true));
    const isValid2 = Provable.if(useSig2, index2.equals(Field(2)), Bool(true));
    const isValid3 = Provable.if(useSig3, index3.equals(Field(3)), Bool(true));
    
    isValid1.assertTrue("Validator1 has incorrect index");
    isValid2.assertTrue("Validator2 has incorrect index");
    isValid3.assertTrue("Validator3 has incorrect index");
  }

  public async validateSig(msg: Field[], signature: Signature, validator: PublicKey, useSig: Bool) {
    let isValidSig = signature.verify(validator, msg);
    const isValid = Provable.if(useSig, isValidSig, Bool(true));
    isValid.assertTrue("Invalid signature");
  }

}