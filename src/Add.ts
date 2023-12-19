import { 
  Field,
  SmartContract,
  state,
  State,
  method,
  Struct,
  PublicKey,
  CircuitString,
  Poseidon,
  MerkleTree,
  DeployArgs,
} from 'o1js';

const theFirstMinter: PublicKey = new PublicKey('');

class Lock extends Struct({ receiver: PublicKey, token: PublicKey, amount: Field }) { }
class Unlock extends Struct({ user: PublicKey, token: PublicKey, amount: Field, hash: CircuitString }) { }

class UnlockTx extends Struct({
  receiver: PublicKey,
  amount: Field,
  hash: CircuitString

}) {
  getHash(): Field {
    return Poseidon.hash(UnlockTx.toFields(this));
  }
}

export class Bridge extends SmartContract {
  @state(PublicKey) minter = State<PublicKey>();
  @state(Field) commitment = State<Field>();

  @method
  init() {
    super.init();
    this.commitment.set(Field(0));
    // this.minter.set(theFirstMinter);
  }

  @method
  isMinter() {
    this.minter.requireEquals(this.sender);
  }

  @method
  mint(data: UnlockTx) {
    this.isMinter();


  }



}
