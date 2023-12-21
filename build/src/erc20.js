var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Bool, CircuitString, provablePure, Field, method, AccountUpdate, PublicKey, SmartContract, UInt64, Account, Experimental, Permissions, Int64, VerificationKey, } from 'o1js';
/**
 * A simple ERC20 token
 *
 * Tokenomics:
 * The supply is constant and the entire supply is initially sent to an account controlled by the zkApp developer
 * After that, tokens can be sent around with authorization from their owner, but new ones can't be minted.
 *
 * Functionality:
 * Just enough to be swapped by the DEX contract, and be secure
 */
export class WETH extends SmartContract {
    constructor() {
        super(...arguments);
        // constant supply
        this.SUPPLY = UInt64.from(10n ** 18n);
        this.events = {
            Transfer: provablePure({
                from: PublicKey,
                to: PublicKey,
                value: UInt64,
            }),
            Approval: provablePure({
                owner: PublicKey,
                spender: PublicKey,
                value: UInt64,
            }),
        };
    }
    init() {
        super.init();
        this.account.tokenSymbol.set('WETH');
        this.account.permissions.set({
            ...Permissions.default(),
            setPermissions: Permissions.proof(),
        });
        // mint the entire supply to the token account with the same address as this contract
        let address = this.sender;
        this.token.mint({
            address,
            amount: this.SUPPLY,
        });
        // pay fees for opened account
        // this.balance.subInPlace(Mina.accountCreationFee());
        // since this is the only method of this zkApp that resets the entire state, provedState: true implies
        // that this function was run. Since it can be run only once, this implies it was run exactly once
        // make account non-upgradable forever
        // this.account.permissions.set({
        //     ...Permissions.default(),
        //     setVerificationKey: Permissions.impossible(),
        //     setPermissions: Permissions.impossible(),
        //     access: Permissions.proofOrSignature(),
        // });
    }
    // ERC20 API
    name() {
        return CircuitString.fromString('WETH');
    }
    symbol() {
        return CircuitString.fromString('WETH');
    }
    decimals() {
        return Field(9);
    }
    totalSupply() {
        return this.SUPPLY;
    }
    balanceOf(owner) {
        let account = Account(owner, this.token.id);
        let balance = account.balance.get();
        account.balance.requireEquals(balance);
        return balance;
    }
    allowance(owner, spender) {
        // TODO: implement allowances
        return UInt64.zero;
    }
    transfer(to, value) {
        this.token.send({ from: this.sender, to, amount: value });
        this.emitEvent('Transfer', { from: this.sender, to, value });
        // we don't have to check the balance of the sender -- this is done by the zkApp protocol
        return Bool(true);
    }
    transferFrom(from, to, value) {
        this.token.send({ from, to, amount: value });
        this.emitEvent('Transfer', { from, to, value });
        // we don't have to check the balance of the sender -- this is done by the zkApp protocol
        return Bool(true);
    }
    approveSpend(spender, value) {
        // TODO: implement allowances
        return Bool(false);
    }
    // additional API needed for zkApp token accounts
    transferFromZkapp(from, to, value, approve) {
        // TODO: need to be able to witness a certain layout of account updates, in this case
        // tokenContract --> sender --> receiver
        let fromUpdate = this.approve(approve, AccountUpdate.Layout.NoChildren);
        let negativeAmount = Int64.fromObject(fromUpdate.body.balanceChange);
        negativeAmount.assertEquals(Int64.from(value).neg());
        let tokenId = this.token.id;
        fromUpdate.body.tokenId.assertEquals(tokenId);
        fromUpdate.body.publicKey.assertEquals(from);
        let toUpdate = AccountUpdate.create(to, tokenId);
        toUpdate.balance.addInPlace(value);
        this.emitEvent('Transfer', { from, to, value });
        return Bool(true);
    }
    // this is a very standardized deploy method. instead, we could also take the account update from a callback
    deployZkapp(zkappAddress, verificationKey) {
        let tokenId = this.token.id;
        let zkapp = Experimental.createChildAccountUpdate(this.self, zkappAddress, tokenId);
        zkapp.account.permissions.set(Permissions.default());
        zkapp.account.verificationKey.set(verificationKey);
        zkapp.requireSignature();
    }
    // for letting a zkapp do whatever it wants, as long as no tokens are transferred
    // TODO: atm, we have to restrict the zkapp to have no children
    //       -> need to be able to witness a general layout of account updates
    approveZkapp(callback) {
        let zkappUpdate = this.approve(callback, AccountUpdate.Layout.NoChildren);
        Int64.fromObject(zkappUpdate.body.balanceChange).assertEquals(UInt64.zero);
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, UInt64]),
    __metadata("design:returntype", Bool)
], WETH.prototype, "transfer", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, PublicKey, UInt64]),
    __metadata("design:returntype", Bool)
], WETH.prototype, "transferFrom", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey, UInt64]),
    __metadata("design:returntype", Bool)
], WETH.prototype, "approveSpend", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey,
        PublicKey,
        UInt64, Experimental.Callback]),
    __metadata("design:returntype", Bool)
], WETH.prototype, "transferFromZkapp", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey,
        VerificationKey]),
    __metadata("design:returntype", void 0)
], WETH.prototype, "deployZkapp", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Experimental.Callback]),
    __metadata("design:returntype", void 0)
], WETH.prototype, "approveZkapp", null);
//# sourceMappingURL=erc20.js.map