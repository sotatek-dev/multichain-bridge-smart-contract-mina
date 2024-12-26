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
} from 'o1js'


export class Manager extends SmartContract {
  @state(PublicKey) admin = State<PublicKey>();
  @state(PublicKey) minter_1 = State<PublicKey>();
  @state(PublicKey) minter_2 = State<PublicKey>();
  @state(PublicKey) minter_3 = State<PublicKey>();
  

  async deploy(args: DeployArgs & { 
    _admin: PublicKey,
    _minter_1: PublicKey,
    _minter_2: PublicKey,
    _minter_3: PublicKey,
  }) {
    await super.deploy(args)
    this.minter_1.set(args._minter_1);
    this.minter_2.set(args._minter_2);
    this.minter_3.set(args._minter_3);
    this.admin.set(args._admin);
  }

  public isAdmin(sender: PublicKey) {
    this.admin.getAndRequireEquals().assertEquals(sender);
  }

  public isMinter(sender: PublicKey) {
    const minter1 = this.minter_1.getAndRequireEquals();
    const minter2 = this.minter_2.getAndRequireEquals();
    const minter3 = this.minter_3.getAndRequireEquals();
    
    // Check if sender matches any of the minters
    const isMinter1 = sender.equals(minter1);
    const isMinter2 = sender.equals(minter2);
    const isMinter3 = sender.equals(minter3);
    
    // Require that sender is one of the minters
    isMinter1.or(isMinter2).or(isMinter3).assertTrue("Sender is not a minter");
  }

  @method async changeAdmin(_admin: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.admin.set(_admin);
  }

  @method async changeMinter_1(_minter_1: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.minter_1.set(_minter_1);
  }

  @method async changeMinter_2(_minter_2: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.minter_2.set(_minter_2);
  }

  @method async changeMinter_3(_minter_3: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.minter_3.set(_minter_3);
  }
}