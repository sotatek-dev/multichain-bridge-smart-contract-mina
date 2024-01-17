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
  Permissions
} from 'o1js'
import { Token } from './erc20.js'

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
  tokenAddress: PublicKey,
  amount: UInt64,
}){
  constructor(
      tokenAddress: PublicKey,
      amount: UInt64,
  ) {
    super({ tokenAddress, amount });
  }
}

export class Bridge extends SmartContract {
  @state(PublicKey) minter = State<PublicKey>()
  @state(UInt64) minAmount = State<UInt64>()
  @state(UInt64) maxAmount = State<UInt64>()

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  @method firstInitialize(_minter: PublicKey) {
    this.minter.set(_minter);
  }

  @method decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
    this.minter.set(this.sender)
  }

  @method setMinter(_minter: PublicKey) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    this.minter.set(_minter);
  }

  @method setMinAmount(_min: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.set(_min);
  }

  @method setMaxAmount(_max: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.maxAmount.set(_max);
  }

  @method checkMinMax(amount: UInt64) {
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.get().assertLessThan(amount);
    this.maxAmount.get().assertGreaterThan(amount);
  }

  @method unlock(tokenAddress: PublicKey, amount: UInt64, receiver: PublicKey, id: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.get().assertLessThan(amount);
    this.maxAmount.get().assertGreaterThan(amount);
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddress, amount, id));
  }
}
