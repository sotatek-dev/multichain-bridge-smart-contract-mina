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
  Provable
} from 'o1js'

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
  @state(PublicKey) configurator = State<PublicKey>()
  @state(UInt64) minAmount = State<UInt64>()
  @state(UInt64) maxAmount = State<UInt64>()

  events = {"Unlock": UnlockEvent, "Lock": LockEvent};

  @method decrementBalance(amount: UInt64) {
    this.balance.subInPlace(amount)
  }

  deploy(args?: DeployArgs) {
    super.deploy(args)

    // this.account.permissions.set({
    //   ...Permissions.default(),
    //   access: Permissions.proofOrSignature()
    // })
    this.configurator.set(this.sender);
    this.minter.set(this.sender);
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

  @method setConfigurator(_configurator: PublicKey) {
    this.configurator.getAndRequireEquals().assertEquals(this.sender);
    this.configurator.assertEquals(this.configurator.get());
    this.configurator.set(_configurator);
  }

  // @method setMinAmount(_min: UInt64) {
  //   this.configurator.getAndRequireEquals().assertEquals(this.sender);
  //   this.minAmount.assertEquals(this.minAmount.get());
  //   this.maxAmount.assertEquals(this.maxAmount.get());
  //   const max = this.maxAmount.get();
  //
  //   if (max.equals(UInt64.from(0)).not()) {
  //     this.maxAmount.get().assertGreaterThanOrEqual(_min);
  //   }
  //   this.minAmount.set(_min);
  // }
  //
  // @method setMaxAmount(_max: UInt64) {
  //   this.configurator.getAndRequireEquals().assertEquals(this.sender);
  //   this.maxAmount.assertEquals(this.maxAmount.get());
  //   this.minAmount.assertEquals(this.minAmount.get());
  //   // if (this.minAmount.get() != UInt64.from(0)) {
  //   this.minAmount.get().assertLessThanOrEqual(_max);
  //   // }
  //   this.maxAmount.set(_max);
  // }

  @method checkMinMax(amount: UInt64) {
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.get().assertLessThanOrEqual(amount);
    this.maxAmount.get().assertGreaterThanOrEqual(amount);
  }

  @method unlock(tokenAddress: PublicKey, amount: UInt64, receiver: PublicKey, id: UInt64) {
    this.minter.getAndRequireEquals().assertEquals(this.sender);
    this.maxAmount.assertEquals(this.maxAmount.get());
    this.minAmount.assertEquals(this.minAmount.get());
    this.minAmount.get().assertLessThanOrEqual(amount);
    this.maxAmount.get().assertGreaterThanOrEqual(amount);
    this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddress, amount, id));
  }
}