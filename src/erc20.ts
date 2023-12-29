import {
  AccountUpdate,
  DeployArgs,
  Experimental,
  Field,
  Int64,
  Permissions,
  PublicKey,
  SmartContract,
  State,
  UInt64,
  method,
  state,
  CircuitString, Struct,
} from 'o1js'

class Transfer extends Struct({
  from: PublicKey,
  to: PublicKey,
  amount: UInt64
}){
  constructor(from: PublicKey, to: PublicKey, amount: UInt64) {
    super({ from, to, amount });
  }
}

class Lock extends Struct({
  locker: PublicKey,
  receipt: Field,
  amount: UInt64
}){
  constructor(locker: PublicKey, receipt: Field, amount: UInt64) {
    super({ locker, receipt, amount });
  }
}

export class Token extends SmartContract {
  @state(UInt64) decimals = State<UInt64>()
  @state(UInt64) maxSupply = State<UInt64>()
  @state(UInt64) circulatingSupply = State<UInt64>()
  @state(PublicKey) owner = State<PublicKey>()


  events = {"Transfer": Transfer, "Lock": Lock};

  deploy(args?: DeployArgs) {
    super.deploy(args)

    this.account.permissions.set({
      ...Permissions.default(),
      access: Permissions.proofOrSignature(),
    })

    this.decimals.set(UInt64.from(18))
    this.maxSupply.set(UInt64.from(10000000000000000000))
    this.owner.set(this.sender)
    this.account.tokenSymbol.set('WETH');
  }

  @method mint(receiver: PublicKey, amount: UInt64) {
    this.owner.getAndRequireEquals().assertEquals(this.sender)
    const maxSupply = this.maxSupply.getAndRequireEquals()
    const circulatingSupply = this.circulatingSupply.getAndRequireEquals()

    const newCirculatingSupply = circulatingSupply.add(amount)

    newCirculatingSupply.assertLessThanOrEqual(maxSupply)

    this.token.mint({
      address: receiver,
      amount,
    })

    this.circulatingSupply.set(newCirculatingSupply)
  }

  @method burn(burner: PublicKey, amount: UInt64) {
    const circulatingSupply = this.circulatingSupply.getAndRequireEquals()

    const newCirculatingSupply = circulatingSupply.sub(amount)

    this.token.burn({
      address: burner,
      amount,
    })

    this.circulatingSupply.set(newCirculatingSupply)
  }

  @method transfer(sender: PublicKey, receiver: PublicKey, amount: UInt64) {
    this.token.send({ from: sender, to: receiver, amount })
    this.emitEvent("Transfer", {
      from: sender,
      to: receiver,
      amount,
    })
  }

  @method lock(receipt: Field, bridgeAddress: PublicKey, amount: UInt64) {
    this.token.send({ from: this.sender, to: bridgeAddress, amount })
    this.emitEvent("Lock", {
      locker: this.sender,
      receipt,
      amount,
    })
  }

  @method approveCallbackAndTransfer(
      sender: PublicKey,
      receiver: PublicKey,
      amount: UInt64,
      callback: Experimental.Callback<any>
  ) {
    const tokenId = this.token.id

    const senderAccountUpdate = this.approve(callback, AccountUpdate.Layout.AnyChildren)

    senderAccountUpdate.body.tokenId.assertEquals(tokenId)
    senderAccountUpdate.body.publicKey.assertEquals(sender)

    const negativeAmount = Int64.fromObject(senderAccountUpdate.body.balanceChange)
    negativeAmount.assertEquals(Int64.from(amount).neg())

    const receiverAccountUpdate = Experimental.createChildAccountUpdate(this.self, receiver, tokenId)
    receiverAccountUpdate.balance.addInPlace(amount)
  }

  @method approveUpdateAndTransfer(zkappUpdate: AccountUpdate, receiver: PublicKey, amount: UInt64) {
    // TODO: THIS IS INSECURE. The proper version has a prover error (compile != prove) that must be fixed
    this.approve(zkappUpdate, AccountUpdate.Layout.AnyChildren)

    // THIS IS HOW IT SHOULD BE DONE:
    // // approve a layout of two grandchildren, both of which can't inherit the token permission
    // let { StaticChildren, AnyChildren } = AccountUpdate.Layout;
    // this.approve(zkappUpdate, StaticChildren(AnyChildren, AnyChildren));
    // zkappUpdate.body.mayUseToken.parentsOwnToken.assertTrue();
    // let [grandchild1, grandchild2] = zkappUpdate.children.accountUpdates;
    // grandchild1.body.mayUseToken.inheritFromParent.assertFalse();
    // grandchild2.body.mayUseToken.inheritFromParent.assertFalse();

    // see if balance change cancels the amount sent
    const balanceChange = Int64.fromObject(zkappUpdate.body.balanceChange)
    balanceChange.assertEquals(Int64.from(amount).neg())

    const receiverAccountUpdate = Experimental.createChildAccountUpdate(this.self, receiver, this.token.id)
    receiverAccountUpdate.balance.addInPlace(amount)
  }

  @method approveUpdate(zkappUpdate: AccountUpdate) {
    this.approve(zkappUpdate)
    const balanceChange = Int64.fromObject(zkappUpdate.body.balanceChange)
    balanceChange.assertEquals(Int64.from(0))
  }

  // Instead, use `approveUpdate` method.
  // @method deployZkapp(address: PublicKey, verificationKey: VerificationKey) {
  //     let tokenId = this.token.id
  //     let zkapp = AccountUpdate.create(address, tokenId)
  //     zkapp.account.permissions.set(Permissions.default())
  //     zkapp.account.verificationKey.set(verificationKey)
  //     zkapp.requireSignature()
  // }

  /**
   * 'sendTokens()' sends tokens from `senderAddress` to `receiverAddress`.
   *
   * It does so by deducting the amount of tokens from `senderAddress` by
   * authorizing the deduction with a proof. It then creates the receiver
   * from `receiverAddress` and sends the amount.
   */
  @method sendTokensFromZkApp(
      receiverAddress: PublicKey,
      amount: UInt64,
      callback: Experimental.Callback<any>
  ) {
    // approves the callback which deductes the amount of tokens from the sender
    let senderAccountUpdate = this.approve(callback);

    // Create constraints for the sender account update and amount
    let negativeAmount = Int64.fromObject(
        senderAccountUpdate.body.balanceChange
    );
    negativeAmount.assertEquals(Int64.from(amount).neg());
    let tokenId = this.token.id;

    // Create receiver accountUpdate
    let receiverAccountUpdate = Experimental.createChildAccountUpdate(
        this.self,
        receiverAddress,
        tokenId
    );
    receiverAccountUpdate.balance.addInPlace(amount);
  }
}
