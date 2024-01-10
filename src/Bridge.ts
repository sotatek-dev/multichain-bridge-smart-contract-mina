import {PublicKey, SmartContract, State, UInt64, method, state, Struct, CircuitString} from 'o1js'
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

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};
  @method decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
    this.minter.set(this.sender)
  }

  @method setMinter(_minter: PublicKey) {
    this.minter.set(_minter);
  }

  @method unlock(tokenAddress: PublicKey, amount: UInt64, receiver: PublicKey, id: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender)
    // this.balance.subInPlace(amount)
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddress, amount, id));
  }
}
