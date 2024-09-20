import {
  SmartContract,
  State,
  state,
  Bool,
  DeployArgs,
  Field,
  Provable,
  method,
  PublicKey,
} from 'o1js'

import { Manager } from './Manager.js';

export class ValidatorManager extends SmartContract {
  @state(PublicKey) validator1 = State<PublicKey>();
  @state(PublicKey) validator2 = State<PublicKey>();
  @state(PublicKey) validator3 = State<PublicKey>();
  @state(PublicKey) manager = State<PublicKey>();

  async deploy(args: DeployArgs & { 
    _validator1: PublicKey,
    _validator2: PublicKey,
    _validator3: PublicKey,
    _manager: PublicKey,
  }) {
    await super.deploy(args)
    this.validator1.set(args._validator1);
    this.validator2.set(args._validator2);
    this.validator3.set(args._validator3);
    this.manager.set(args._manager);
  }

  public isValidator(p: PublicKey): Bool {
    return this.getValidatorIndex(p).greaterThan(Field(0));
  }

  public getValidatorIndex(p: PublicKey): Field {
    if (this.compareValidators(p, this.validator1.getAndRequireEquals())) return Field.from(1);
    if (this.compareValidators(p, this.validator2.getAndRequireEquals())) return Field.from(2);
    if (this.compareValidators(p, this.validator3.getAndRequireEquals())) return Field.from(3);
    return Field.from(0);
  }

  public compareValidators(p1: PublicKey, p2: PublicKey): Bool {
    return p1.equals(p2)
  }

  @method async changeValidator(
    validator1: PublicKey,
    validator2: PublicKey,
    validator3: PublicKey,
  ) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    this.validator1.set(validator1);
    this.validator2.set(validator2);
    this.validator3.set(validator3);
  }

}