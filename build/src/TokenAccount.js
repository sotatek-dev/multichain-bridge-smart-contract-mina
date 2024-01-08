var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { AccountUpdate, SmartContract, UInt64, method, PrivateKey, } from 'o1js';
import Token from './token';
class TokenAccount extends SmartContract {
    constructor() {
        super(...arguments);
        // eslint-disable-next-line no-warning-comments
        // TODO: replace with a getter/setter or some other way
        // of keeping it consistent across the smart contract lifecycle
        this.tokenAddress = PrivateKey.random().toPublicKey();
    }
    withdraw(amount) {
        const token = new Token(this.tokenAddress);
        const [fromAccountUpdate] = token.transferFrom(this.address, amount, AccountUpdate.MayUseToken.InheritFromParent);
        return fromAccountUpdate;
    }
    deposit(amount) {
        const token = new Token(this.tokenAddress);
        const [, toAccountUpdate] = token.transferTo(this.address, amount, AccountUpdate.MayUseToken.InheritFromParent);
        return toAccountUpdate;
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64]),
    __metadata("design:returntype", AccountUpdate)
], TokenAccount.prototype, "withdraw", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64]),
    __metadata("design:returntype", AccountUpdate)
], TokenAccount.prototype, "deposit", null);
export default TokenAccount;
//# sourceMappingURL=TokenAccount.js.map