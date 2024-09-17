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
  @state(PublicKey) minter = State<PublicKey>();
  

  async deploy(args: DeployArgs & { 
    _admin: PublicKey,
    _minter: PublicKey,
  }) {
    await super.deploy(args)
    this.minter.set(args._minter);
    this.admin.set(args._admin);
  }

  public isAdmin(sender: PublicKey) {
    this.admin.getAndRequireEquals().assertEquals(sender);
  }

  public isMinter(sender: PublicKey) {
    this.minter.getAndRequireEquals().assertEquals(sender);
  }

  @method async changeAdmin(_admin: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.admin.set(_admin);
  }

  @method async changeMinter(_minter: PublicKey) {
    this.isAdmin(this.sender.getAndRequireSignature() as PublicKey);
    this.minter.set(_minter);
  }
}