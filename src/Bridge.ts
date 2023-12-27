import { PublicKey, SmartContract, State, UInt64, method, state, Struct } from 'o1js'
import { Token } from './erc20'

class UnlockEvent extends Struct({
  tokenAddress: PublicKey,
  receiver: PublicKey,
  amount: UInt64
}){
  constructor(tokenAddress: PublicKey, receiver: PublicKey, amount: UInt64) {
    super({ tokenAddress, receiver, amount });
  }
}

export class Bridge extends SmartContract {

  events = {"Unlock": UnlockEvent};
  @method decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
  }

  @method unlock(tokenAddress: PublicKey, receiver: PublicKey, amount: UInt64) {
    this.balance.subInPlace(amount)
    this.emitEvent("Unlock", new UnlockEvent(tokenAddress, receiver, amount));
  }
}
