var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SmartContract, State, state, Bool, Field, Provable, method, PublicKey, } from 'o1js';
import { Manager } from './Manager.js';
export class ValidatorManager extends SmartContract {
    constructor() {
        super(...arguments);
        this.validator1X = State();
        this.validator1Y = State();
        this.validator2X = State();
        this.validator2Y = State();
        this.validator3X = State();
        this.validator3Y = State();
        this.manager = State();
    }
    // @state(Field) validator4Y = State<Field>();
    async deploy(args) {
        await super.deploy(args);
        this.validator1X.set(args._val1X);
        this.validator1Y.set(args._val1Y);
        this.validator2X.set(args._val2X);
        this.validator2Y.set(args._val2Y);
        this.validator3X.set(args._val3X);
        this.validator3Y.set(args._val3Y);
        this.manager.set(args._manager);
    }
    isValidator(xKey, yValue) {
        return this.getValidatorIndex(xKey, yValue).greaterThan(Field(0));
    }
    getValidatorIndex(xKey, yValue) {
        if (this.compareValidators(xKey, yValue, this.validator1X.getAndRequireEquals(), this.validator1Y.getAndRequireEquals()).toBoolean())
            return Field.from(1);
        if (this.compareValidators(xKey, yValue, this.validator2X.getAndRequireEquals(), this.validator2Y.getAndRequireEquals()).toBoolean())
            return Field.from(2);
        if (this.compareValidators(xKey, yValue, this.validator3X.getAndRequireEquals(), this.validator3Y.getAndRequireEquals()).toBoolean())
            return Field.from(3);
        // if (this.compareValidators(xKey, yValue, this.validator4X.getAndRequireEquals(), this.validator4Y.getAndRequireEquals()).toBoolean()) return Field.from(4);
        return Field.from(0);
    }
    compareValidators(x1, y1, x2, y2) {
        Provable.log(`Comparing ${x1.toString()} and ${x2.toString()} + ${y1.toString()} and ${y2.toString()}`, Bool(x1.equals(x2) && y1.equals(y2)));
        return Bool(x1.equals(x2) && y1.equals(y2));
    }
    async changeValidator(xKey1, yKey1, xKey2, yKey2, xKey3, yKey3) {
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
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator1X", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator1Y", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator2X", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator2Y", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator3X", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "validator3Y", void 0);
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], ValidatorManager.prototype, "manager", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field,
        Field,
        Field,
        Field,
        Field,
        Field]),
    __metadata("design:returntype", Promise)
], ValidatorManager.prototype, "changeValidator", null);
//# sourceMappingURL=ValidatorManager.js.map