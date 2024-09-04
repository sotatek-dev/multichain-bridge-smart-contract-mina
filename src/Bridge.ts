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
  createEcdsa,
  createForeignCurveV2
} from 'o1js'

import { FungibleToken } from "mina-fungible-token"

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
  @state(PublicKey) minter = State<PublicKey>()
  @state(PublicKey) configurator = State<PublicKey>()
  @state(UInt64) minAmount = State<UInt64>()
  @state(UInt64) maxAmount = State<UInt64>()
  // @state(UInt64) total = State<UInt64>()
  @state(PublicKey) tokenAddress = State<PublicKey>()

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  @method async decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
  }

  async deploy(args: DeployArgs & { tokenAddress: PublicKey }) {
    super.deploy(args)
    this.configurator.set(this.sender.getAndRequireSignature());
    this.minter.set(this.sender.getAndRequireSignature());
    this.tokenAddress.set(args.tokenAddress)
    this.minAmount.set(UInt64.from(100));
    this.maxAmount.set(UInt64.from(1000000));
    // this.total.set(UInt64.from(0));
  }

  @method async config(_configurator: PublicKey, _min: UInt64, _max: UInt64) {
    this.configurator.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    this.configurator.set(_configurator);
    this.minAmount.set(_min);
    this.maxAmount.set(_max);
    _max.assertGreaterThanOrEqual(_min);

  }

  private checkMinMax(amount: UInt64) {
    this.minAmount.getAndRequireEquals().assertLessThanOrEqual(amount);
    this.maxAmount.getAndRequireEquals().assertGreaterThanOrEqual(amount);
  }

  @method async lock(amount: UInt64, address: Field) {
    this.checkMinMax(amount);
    const tokenAddress = this.tokenAddress.getAndRequireEquals();
    const token = new FungibleToken(tokenAddress);
    await token.transfer(this.sender.getAndRequireSignature(), this.address, amount)
    this.emitEvent("Lock", new LockEvent(this.sender.getAndRequireSignature(), address, amount, tokenAddress));

  }

  @method async unlock(amount: UInt64, receiver: PublicKey, id: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender.getAndRequireSignature());
    const tokenAddress = this.tokenAddress.getAndRequireEquals();
    const token = new FungibleToken(tokenAddress)
    await token.transfer(this.address, receiver, amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddress, amount, id));
  }

  @method.returns(Bool)
  async checkProof(message: String, signature: String, publicKey: PublicKey) {
    let proof = await keccakAndEcdsa.verifyEcdsa(message, signature, publicKey);
    return proof;
  }
}