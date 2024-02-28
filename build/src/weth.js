var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Bool, method, AccountUpdate, PublicKey, SmartContract, UInt64, Permissions, Mina, Int64, VerificationKey } from 'o1js';
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
    deployZkapp(address, verificationKey) {
        let tokenId = this.token.id;
        let zkapp = AccountUpdate.create(address, tokenId);
        zkapp.account.permissions.set(Permissions.default());
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();
    }
    approveUpdate(zkappUpdate) {
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
    transfer(from, to, amount) {
        if (to instanceof PublicKey)
            return this.transferToAddress(from, to, amount);
        if (to instanceof AccountUpdate)
            return this.transferToUpdate(from, to, amount);
    }
    transferToAddress(from, to, value) {
        this.token.send({ from, to, amount: value });
    }
    transferToUpdate(from, to, value) {
        this.token.send({ from, to, amount: value });
    }
    getBalance(publicKey) {
        let accountUpdate = AccountUpdate.create(publicKey, this.token.id);
        let balance = accountUpdate.account.balance.get();
        accountUpdate.account.balance.requireEquals(accountUpdate.account.balance.get());
        return balance;
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, VerificationKey]),
    __metadata("design:returntype", void 0)
], TokenContract.prototype, "deployZkapp", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AccountUpdate]),
    __metadata("design:returntype", void 0)
], TokenContract.prototype, "approveUpdate", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, PublicKey, UInt64]),
    __metadata("design:returntype", void 0)
], TokenContract.prototype, "transferToAddress", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, AccountUpdate, UInt64]),
    __metadata("design:returntype", void 0)
], TokenContract.prototype, "transferToUpdate", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey]),
    __metadata("design:returntype", UInt64)
], TokenContract.prototype, "getBalance", null);
//# sourceMappingURL=weth.js.map