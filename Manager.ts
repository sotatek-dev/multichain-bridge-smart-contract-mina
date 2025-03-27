import {
  SmartContract,
  State,
  state,
  Bool,
  DeployArgs,
  Field,
  Provable,
  PublicKey,
  method,
  UInt64,
} from 'o1js'


export class Manager extends SmartContract {
  @state(PublicKey) admin = State<PublicKey>();
  @state(PublicKey) minter_1 = State<PublicKey>();
  @state(UInt64) minAmount = State<UInt64>();
  @state(UInt64) maxAmount = State<UInt64>();
  

  async deploy(args: DeployArgs & { 
    _admin: PublicKey,
    _minter_1: PublicKey,
    _minAmount: UInt64,
    _maxAmount: UInt64
  }) {
    await super.deploy(args)
    this.minter_1.set(args._minter_1);
    this.admin.set(args._admin);
    this.minAmount.set(args._minAmount);
    this.maxAmount.set(args._maxAmount);
  }

  public isAdmin(sender: PublicKey) {
    this.admin.getAndRequireEquals().assertEquals(sender);
  }

  @method async setAmountLimits(newMinAmount: UInt64, newMaxAmount: UInt64) {
    // Ensure the caller is the manager

    this.isAdmin(this.sender.getAndRequireSignature());
    // Set the new minimum and maximum amounts
    this.minAmount.set(newMinAmount);
    this.maxAmount.set(newMaxAmount);

    // Ensure the new minimum is less than or equal to the new maximum
    newMinAmount.assertLessThanOrEqual(newMaxAmount);
  }

  public isValidAmount(amount: UInt64) {
    const minAmount = this.minAmount.getAndRequireEquals();
    const maxAmount = this.maxAmount.getAndRequireEquals();
    amount.assertGreaterThanOrEqual(minAmount, "Amount is less than minimum allowed");
    amount.assertLessThanOrEqual(maxAmount, "Amount exceeds maximum allowed");
  }

  public isMinter(sender: PublicKey) {
    const minter1 = this.minter_1.getAndRequireEquals();
    
    // Check if sender matches any of the minters
    const isMinter1 = sender.equals(minter1);
    
    // Require that sender is one of the minters
    isMinter1.assertTrue("Sender is not a minter");
  }

  @method async changeAdmin(_admin: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.admin.set(_admin);
  }

  @method async changeMinter_1(_minter_1: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.minter_1.set(_minter_1);
  }
}