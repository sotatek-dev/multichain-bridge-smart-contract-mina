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
  Field
} from 'o1js'

import { BridgeToken } from "./BridgeToken.js"

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
  // @state(PublicKey) tokenAddress = State<PublicKey>()

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  @method decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
  }

  deploy(args: DeployArgs & { tokenAddress: PublicKey }) {
    super.deploy(args)
    this.configurator.set(this.sender);
    this.minter.set(this.sender);
    // this.tokenAddress.set(args.tokenAddress)
    this.minAmount.set(UInt64.from(0));
    this.maxAmount.set(UInt64.from(0));
    // this.total.set(UInt64.from(0));
  }

  @method config(_configurator: PublicKey, _min: UInt64, _max: UInt64) {
    this.configurator.getAndRequireEquals().assertEquals(this.sender);
    this.configurator.assertEquals(this.configurator.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.configurator.set(_configurator);
    this.minAmount.set(_min);
    this.maxAmount.set(_max);
    _max.assertGreaterThanOrEqual(_min);

  }

  @method checkMinMax(amount: UInt64) {
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.get().assertLessThanOrEqual(amount);
    this.maxAmount.get().assertGreaterThanOrEqual(amount);
  }
// 
  @method lock(amount: UInt64, address: Field, tokenAddress: PublicKey) {
    this.checkMinMax(amount);
    const token = new BridgeToken(tokenAddress);
    token.transfer(this.sender, this.address, amount)
    this.emitEvent("Lock", new LockEvent(this.sender, address, amount, tokenAddress));

  }

  @method unlock(tokenAddress: PublicKey, amount: UInt64, receiver: PublicKey, id: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    const token = new BridgeToken(tokenAddress)
    token.transfer(this.address, receiver, amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddress, amount, id));
  }
}