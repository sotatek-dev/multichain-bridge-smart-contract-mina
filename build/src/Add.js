var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, SmartContract, state, State, method, Struct, PublicKey, CircuitString, Poseidon, } from 'o1js';
const theFirstMinter = new PublicKey('');
class Lock extends Struct({ receiver: PublicKey, token: PublicKey, amount: Field }) {
}
class Unlock extends Struct({ user: PublicKey, token: PublicKey, amount: Field, hash: CircuitString }) {
}
class UnlockTx extends Struct({
    receiver: PublicKey,
    amount: Field,
    hash: CircuitString
}) {
    getHash() {
        return Poseidon.hash(UnlockTx.toFields(this));
    }
}
export class Bridge extends SmartContract {
    constructor() {
        super(...arguments);
        this.minter = State();
        this.commitment = State();
    }
    init() {
        super.init();
        this.commitment.set(Field(0));
        // this.minter.set(theFirstMinter);
    }
    isMinter() {
        this.minter.requireEquals(this.sender);
    }
    mint(data) {
        this.isMinter();
    }
}
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], Bridge.prototype, "minter", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], Bridge.prototype, "commitment", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Bridge.prototype, "init", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Bridge.prototype, "isMinter", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UnlockTx]),
    __metadata("design:returntype", void 0)
], Bridge.prototype, "mint", null);
//# sourceMappingURL=Add.js.map