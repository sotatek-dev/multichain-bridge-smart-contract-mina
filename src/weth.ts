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
export class TokenContract extends SmartContract {
    // deploy(args?: DeployArgs) {
    //     super.deploy(args);
    //     this.account.permissions.set({
    //         ...Permissions.default(),
    //         access: Permissions.proofOrSignature(),
    //     });
    // }
    init() {
        super.init();
        this.account.permissions.set({
            ...Permissions.default(),
            access: Permissions.proofOrSignature(),
        });
        // mint the entire supply to the token account with the same address as this contract
        /**
         * DUMB STUFF FOR TESTING (change in real app)
         *
         * we mint the max uint64 of tokens here, so that we can overflow it in tests if we just mint a bit more
         */
        let receiver = this.token.mint({
            address: this.address,
            amount: UInt64.MAXINT(),
        });
        // assert that the receiving account is new, so this can be only done once
        receiver.account.isNew.requireEquals(Bool(true));
        // pay fees for opened account
        this.balance.subInPlace(Mina.accountCreationFee());
    }

    // this is a very standardized deploy method. instead, we could also take the account update from a callback
    // => need callbacks for signatures
    @method deployZkapp(address: PublicKey, verificationKey: VerificationKey) {
        let tokenId = this.token.id;
        let zkapp = AccountUpdate.create(address, tokenId);
        zkapp.account.permissions.set(Permissions.default());
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();
    }

    @method approveUpdate(zkappUpdate: AccountUpdate) {
        this.approve(zkappUpdate);
        let balanceChange = Int64.fromObject(zkappUpdate.body.balanceChange);
        balanceChange.assertEquals(Int64.from(0));
    }

    // FIXME: remove this
    // @method approveAny(zkappUpdate: AccountUpdate) {
    //     this.approve(zkappUpdate, AccountUpdate.Layout.AnyChildren);
    // }

    // // let a zkapp send tokens to someone, provided the token supply stays constant
    // @method approveUpdateAndSend(
    //     zkappUpdate: AccountUpdate,
    //     to: PublicKey,
    //     amount: UInt64
    // ) {
    //     // TODO: THIS IS INSECURE. The proper version has a prover error (compile != prove) that must be fixed
    //     this.approve(zkappUpdate, AccountUpdate.Layout.AnyChildren);

    //     // THIS IS HOW IT SHOULD BE DONE:
    //     // // approve a layout of two grandchildren, both of which can't inherit the token permission
    //     // let { StaticChildren, AnyChildren } = AccountUpdate.Layout;
    //     // this.approve(zkappUpdate, StaticChildren(AnyChildren, AnyChildren));
    //     // zkappUpdate.body.mayUseToken.parentsOwnToken.assertTrue();
    //     // let [grandchild1, grandchild2] = zkappUpdate.children.accountUpdates;
    //     // grandchild1.body.mayUseToken.inheritFromParent.assertFalse();
    //     // grandchild2.body.mayUseToken.inheritFromParent.assertFalse();

    //     // see if balance change cancels the amount sent
    //     let balanceChange = Int64.fromObject(zkappUpdate.body.balanceChange);
    //     balanceChange.assertEquals(Int64.from(amount).neg());
    //     // add same amount of tokens to the receiving address
    //     this.token.mint({ address: to, amount });
    // }

    transfer(from: PublicKey, to: PublicKey | AccountUpdate, amount: UInt64) {
        if (to instanceof PublicKey)
            return this.transferToAddress(from, to, amount);
        if (to instanceof AccountUpdate)
            return this.transferToUpdate(from, to, amount);
    }
    @method transferToAddress(from: PublicKey, to: PublicKey, value: UInt64) {
        this.token.send({ from, to, amount: value });
    }
    @method transferToUpdate(from: PublicKey, to: AccountUpdate, value: UInt64) {
        this.token.send({ from, to, amount: value });
    }

    @method getBalance(publicKey: PublicKey): UInt64 {
        let accountUpdate = AccountUpdate.create(publicKey, this.token.id);
        let balance = accountUpdate.account.balance.get();
        accountUpdate.account.balance.requireEquals(
            accountUpdate.account.balance.get()
        );
        return balance;
    }
}