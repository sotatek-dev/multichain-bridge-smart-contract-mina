import {
  ProvablePure,
  Bool,
  CircuitString,
  provablePure,
  DeployArgs,
  Field,
  method,
  AccountUpdate,
  PublicKey,
  SmartContract,
  UInt64,
  Account,
  Experimental,
  Permissions,
  Mina,
  Struct,
  Int64,
  VerificationKey,
  Poseidon,
  state,
  State
} from 'o1js';

// type Erc20 = {
//   // pure view functions which don't need @method
//   name?: () => CircuitString;
//   symbol?: () => CircuitString;
//   decimals?: () => Field; // TODO: should be UInt8 which doesn't exist yet
//   totalSupply(): UInt64;
//   balanceOf(owner: PublicKey): UInt64;
//   allowance(owner: PublicKey, spender: PublicKey): UInt64;
//
//   // mutations which need @method
//   transfer(to: PublicKey, value: UInt64): Bool; // emits "Transfer" event
//   transferFrom(from: PublicKey, to: PublicKey, value: UInt64): Bool; // emits "Transfer" event
//   approveSpend(spender: PublicKey, value: UInt64): Bool; // emits "Approve" event
//
//   // events
//   events: {
//     Transfer: ProvablePure<{
//       from: PublicKey;
//       to: PublicKey;
//       value: UInt64;
//     }>;
//     Approval: ProvablePure<{
//       owner: PublicKey;
//       spender: PublicKey;
//       value: UInt64;
//     }>;
//   };
// };
//
// class WETH extends SmartContract implements Erc20 {
//   // constant supply
//   SUPPLY = UInt64.from(10n ** 18n);
//
//   init() {
//     super.init();
//
//     this.account.tokenSymbol.set('WETH');
//     this.account.permissions.set({
//       ...Permissions.default(),
//       setPermissions: Permissions.proof(),
//     });
//
//     // mint the entire supply to the token account with the same address as this contract
//     let address = this.sender;
//     this.token.mint({
//       address,
//       amount: this.SUPPLY,
//     });
//
//     // pay fees for opened account
//     // this.balance.subInPlace(Mina.accountCreationFee());
//
//     // since this is the only method of this zkApp that resets the entire state, provedState: true implies
//     // that this function was run. Since it can be run only once, this implies it was run exactly once
//
//     // make account non-upgradable forever
//     // this.account.permissions.set({
//     //     ...Permissions.default(),
//     //     setVerificationKey: Permissions.impossible(),
//     //     setPermissions: Permissions.impossible(),
//     //     access: Permissions.proofOrSignature(),
//     // });
//   }
//
//   // ERC20 API
//   name(): CircuitString {
//     return CircuitString.fromString('WETH');
//   }
//   symbol(): CircuitString {
//     return CircuitString.fromString('WETH');
//   }
//   decimals(): Field {
//     return Field(9);
//   }
//   totalSupply(): UInt64 {
//     return this.SUPPLY;
//   }
//   balanceOf(owner: PublicKey): UInt64 {
//     let account = Account(owner, this.token.id);
//     let balance = account.balance.get();
//     account.balance.requireEquals(balance);
//     return balance;
//   }
//   allowance(owner: PublicKey, spender: PublicKey): UInt64 {
//     // TODO: implement allowances
//     return UInt64.zero;
//   }
//
//   @method transfer(to: PublicKey, value: UInt64): Bool {
//     this.token.send({ from: this.sender, to, amount: value });
//     this.emitEvent('Transfer', { from: this.sender, to, value });
//     // we don't have to check the balance of the sender -- this is done by the zkApp protocol
//     return Bool(true);
//   }
//   @method transferFrom(from: PublicKey, to: PublicKey, value: UInt64): Bool {
//     this.token.send({ from, to, amount: value });
//     this.emitEvent('Transfer', { from, to, value });
//     // we don't have to check the balance of the sender -- this is done by the zkApp protocol
//     return Bool(true);
//   }
//   @method approveSpend(spender: PublicKey, value: UInt64): Bool {
//     // TODO: implement allowances
//     return Bool(false);
//   }
//
//   events = {
//     Transfer: provablePure({
//       from: PublicKey,
//       to: PublicKey,
//       value: UInt64,
//     }),
//     Approval: provablePure({
//       owner: PublicKey,
//       spender: PublicKey,
//       value: UInt64,
//     }),
//   };
//
//   // additional API needed for zkApp token accounts
//
//   @method transferFromZkapp(
//       from: PublicKey,
//       to: PublicKey,
//       value: UInt64,
//       approve: Experimental.Callback<any>
//   ): Bool {
//     // TODO: need to be able to witness a certain layout of account updates, in this case
//     // tokenContract --> sender --> receiver
//     let fromUpdate = this.approve(approve, AccountUpdate.Layout.NoChildren);
//
//     let negativeAmount = Int64.fromObject(fromUpdate.body.balanceChange);
//     negativeAmount.assertEquals(Int64.from(value).neg());
//     let tokenId = this.token.id;
//     fromUpdate.body.tokenId.assertEquals(tokenId);
//     fromUpdate.body.publicKey.assertEquals(from);
//
//     let toUpdate = AccountUpdate.create(to, tokenId);
//     toUpdate.balance.addInPlace(value);
//     this.emitEvent('Transfer', { from, to, value });
//     return Bool(true);
//   }
//
//   // this is a very standardized deploy method. instead, we could also take the account update from a callback
//   @method deployZkapp(
//       zkappAddress: PublicKey,
//       verificationKey: VerificationKey
//   ) {
//     let tokenId = this.token.id;
//     let zkapp = Experimental.createChildAccountUpdate(
//         this.self,
//         zkappAddress,
//         tokenId
//     );
//     zkapp.account.permissions.set(Permissions.default());
//     zkapp.account.verificationKey.set(verificationKey);
//     zkapp.requireSignature();
//   }
//
//   // for letting a zkapp do whatever it wants, as long as no tokens are transferred
//   // TODO: atm, we have to restrict the zkapp to have no children
//   //       -> need to be able to witness a general layout of account updates
//   @method approveZkapp(callback: Experimental.Callback<any>) {
//     let zkappUpdate = this.approve(callback, AccountUpdate.Layout.NoChildren);
//     Int64.fromObject(zkappUpdate.body.balanceChange).assertEquals(UInt64.zero);
//   }
// }


//
// class Lock extends Struct({
//   locker: PublicKey,
//   receipt: PublicKey,
//   token: PublicKey,
//   amount: Field,
//   hash: CircuitString,
//   tokenName: CircuitString
//
// }) {
//   getHash(): Field {
//     return Poseidon.hash(Lock.toFields(this));
//   }
// }
//
// class Unlock extends Struct({
//   locker: PublicKey,
//   receipt: PublicKey,
//   token: PublicKey,
//   amount: Field,
//   hash: CircuitString,
//   tokenName: CircuitString
//
// }) {
//   getHash(): Field {
//     return Poseidon.hash(Lock.toFields(this));
//   }
// }

export class Bridge extends SmartContract {
  @state(PublicKey) minter = State<PublicKey>();
  @state(PublicKey) weth = State<PublicKey>();
  @state(Field) minAmout = State<Field>();
  @state(Field) maxAmount = State<Field>();

  events = {
    Lock: provablePure({
      locker: PublicKey,
      receipt: PublicKey,
      token: PublicKey,
      amount: Field,
      tokenName: CircuitString,
    }),
    Unlock: provablePure({
      user: PublicKey,
      token: PublicKey,
      amount: Field,
      hash: CircuitString,
      fee: Field,
    })
  };

  init() {
    super.init();
    this.account.permissions.set({
      ...Permissions.default(),
      // setPermissions: Permissions.proof(),
    });
  }

  @method
  isMinter() {
    this.minter.requireEquals(this.sender);
  }

  @method
  lock(token: PublicKey, receipt: PublicKey, amount: Field) {
    this.weth.assertEquals(this.weth.get());
    this.emitEvent("Lock", {
      locker: this.sender,
      receipt: receipt,
      token: token,
      amount: amount,
      tokenName: CircuitString.fromString("WETH"),
    })
  }

  @method
  unlock(token: PublicKey, amount: Field, user: PublicKey, hash: CircuitString, fee: Field) {
    this.emitEvent("Unlock", {
      user: user,
      token: token,
      amount: amount,
      hash: hash,
      fee: fee,
    })
  }



}
