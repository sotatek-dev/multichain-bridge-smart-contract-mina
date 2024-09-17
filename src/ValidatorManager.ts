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


import { Secp256k1, Ecdsa, keccakAndEcdsa, ecdsa, Bytes32, Bytes256 } from './ecdsa/ecdsa.js';
import { Manager } from './Manager.js';

export class ValidatorManager extends SmartContract {
  @state(Field) validator1X = State<Field>();
  @state(Field) validator1Y = State<Field>();
  @state(Field) validator2X = State<Field>();
  @state(Field) validator2Y = State<Field>();
  @state(Field) validator3X = State<Field>();
  @state(Field) validator3Y = State<Field>();
  @state(PublicKey) manager = State<PublicKey>();
  // @state(Field) validator4Y = State<Field>();

  async deploy(args: DeployArgs & { 
    _val1X: Field,
    _val1Y: Field,
    _val2X: Field,
    _val2Y: Field,
    _val3X: Field,
    _val3Y: Field,
    _manager: PublicKey,
  }) {
    await super.deploy(args)
    this.validator1X.set(args._val1X);
    this.validator1Y.set(args._val1Y);
    this.validator2X.set(args._val2X);
    this.validator2Y.set(args._val2Y);
    this.validator3X.set(args._val3X);
    this.validator3Y.set(args._val3Y);
    this.manager.set(args._manager);
  }

  public isValidator(xKey: Field, yValue: Field): Bool {
    return this.getValidatorIndex(xKey, yValue).greaterThan(Field(0));
  }

  public getValidatorIndex(xKey: Field, yValue: Field): Field {
    if (this.compareValidators(xKey, yValue, this.validator1X.getAndRequireEquals(), this.validator1Y.getAndRequireEquals()).toBoolean()) return Field.from(1);
    if (this.compareValidators(xKey, yValue, this.validator2X.getAndRequireEquals(), this.validator2Y.getAndRequireEquals()).toBoolean()) return Field.from(2);
    if (this.compareValidators(xKey, yValue, this.validator3X.getAndRequireEquals(), this.validator3Y.getAndRequireEquals()).toBoolean()) return Field.from(3);
    // if (this.compareValidators(xKey, yValue, this.validator4X.getAndRequireEquals(), this.validator4Y.getAndRequireEquals()).toBoolean()) return Field.from(4);
    return Field.from(0);
  }

  public compareValidators(x1: Field, y1: Field, x2: Field, y2: Field): Bool {
    Provable.log(`Comparing ${x1.toString()} and ${x2.toString()} + ${y1.toString()} and ${y2.toString()}`, Bool(x1.equals(x2) && y1.equals(y2)));
    return Bool(x1.equals(x2) && y1.equals(y2));
  }

  @method async changeValidator(
    xKey1: Field,
    yKey1: Field,
    xKey2: Field,
    yKey2: Field,
    xKey3: Field,
    yKey3: Field,
  ) {
    const managerZkapp = new Manager(this.manager.getAndRequireEquals());
    managerZkapp.isAdmin(this.sender.getAndRequireSignature());
    // Change the manager
    this.validator1X.set(xKey1);
    this.validator1Y.set(yKey1);
    this.validator2X.set(xKey2);
    this.validator2Y.set(yKey2);
    this.validator3X.set(xKey3);
    this.validator3Y.set(yKey3);
  }

}