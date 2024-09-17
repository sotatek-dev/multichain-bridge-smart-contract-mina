var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PublicKey, SmartContract, State, UInt64, method, state, Struct, Bool, Provable, Field, MerkleMap } from 'o1js';
import { FungibleToken } from "mina-fungible-token";
import { Secp256k1, Ecdsa, Bytes256 } from './ecdsa/ecdsa.js';
import { ValidatorManager } from './ValidatorManager.js';
import { Manager } from './Manager.js';
class UnlockEvent extends Struct({
    receiver: PublicKey,
    tokenAddress: PublicKey,
    amount: UInt64,
    id: UInt64,
}) {
    constructor(receiver, tokenAddress, amount, id) {
        super({ receiver, tokenAddress, amount, id });
    }
}
class LockEvent extends Struct({
    locker: PublicKey,
    receipt: Field,
    amount: UInt64,
    tokenAddress: PublicKey
}) {
    constructor(locker, receipt, amount, tokenAddress) {
        super({ locker, receipt, amount, tokenAddress });
    }
}
export class Bridge extends SmartContract {
    constructor() {
        super(...arguments);
        this.minAmount = State();
        this.maxAmount = State();
        this.threshold = State();
        this.validatorManager = State();
        this.manager = State();
        this.events = { "Unlock": UnlockEvent, "Lock": LockEvent };
    }
    async deploy(args) {
        await super.deploy(args);
        this.minAmount.set(args.minAmount);
        this.maxAmount.set(args.maxAmount);
        this.validatorManager.set(args.validatorPub);
        this.threshold.set(args.threshold);
        this.manager.set(args.manager);
    }
    async setAmountLimits(newMinAmount, newMaxAmount) {
        // Ensure the caller is the manager
        const managerZkapp = new Manager(this.manager.getAndRequireEquals());
        managerZkapp.isAdmin(this.sender.getAndRequireSignature());
        // Set the new minimum and maximum amounts
        this.minAmount.set(newMinAmount);
        this.maxAmount.set(newMaxAmount);
        // Ensure the new minimum is less than or equal to the new maximum
        newMinAmount.assertLessThanOrEqual(newMaxAmount);
    }
    async changeManager(newManager) {
        // Ensure the caller is the current manager
        const managerZkapp = new Manager(this.manager.getAndRequireEquals());
        managerZkapp.isAdmin(this.sender.getAndRequireSignature());
        // Change the manager
        this.manager.set(newManager);
    }
    async changeValidatorManager(validatorManager) {
        const managerZkapp = new Manager(this.manager.getAndRequireEquals());
        managerZkapp.isAdmin(this.sender.getAndRequireSignature());
        // Change the validator manager
        this.validatorManager.set(validatorManager);
    }
    async lock(amount, address, tokenAddr) {
        // Check if the amount is within the allowed range
        const minAmount = this.minAmount.getAndRequireEquals();
        const maxAmount = this.maxAmount.getAndRequireEquals();
        amount.assertGreaterThanOrEqual(minAmount, "Amount is less than minimum allowed");
        amount.assertLessThanOrEqual(maxAmount, "Amount exceeds maximum allowed");
        const token = new FungibleToken(tokenAddr);
        await token.burn(this.sender.getAndRequireSignature(), amount);
        this.emitEvent("Lock", new LockEvent(this.sender.getAndRequireSignature(), address, amount, tokenAddr));
    }
    async unlock(amount, receiver, id, tokenAddr, useSig1, signature_1, validator_1, useSig2, signature_2, validator_2, useSig3, signature_3, validator_3) {
        const managerZkapp = new Manager(this.manager.getAndRequireEquals());
        managerZkapp.isAdmin(this.sender.getAndRequireSignature());
        let msg = Bytes256.fromString(`unlock receiver = ${receiver.toFields} amount = ${amount.toFields} tokenAddr = ${tokenAddr.toFields}`);
        this.validateValidator(useSig1, validator_1, useSig2, validator_2, useSig3, validator_3);
        this.validateSig(msg, signature_1, validator_1, useSig1);
        this.validateSig(msg, signature_2, validator_2, useSig2);
        this.validateSig(msg, signature_3, validator_3, useSig3);
        const token = new FungibleToken(tokenAddr);
        await token.mint(receiver, amount);
        this.emitEvent("Unlock", new UnlockEvent(receiver, tokenAddr, amount, id));
    }
    isValidator(validator, useSig) {
        const validatorManager = new ValidatorManager(this.validatorManager.getAndRequireEquals());
        let isValid = Bool(false);
        Provable.asProver(() => {
            const x = Field.from(validator.x.toBigInt());
            const y = Field.from(validator.y.toBigInt());
            isValid = useSig.toBoolean() ? validatorManager.isValidator(x, y) : Bool(false);
            Provable.log("isValid", isValid);
        });
        return isValid;
    }
    validateValidator(useSig1, validator_1, useSig2, validator_2, useSig3, validator_3) {
        let count = UInt64.from(0);
        Provable.asProver(async () => {
            const map = new MerkleMap();
            const checkValidator = (useSig, validator) => {
                if (useSig.toBoolean()) {
                    const x = Field.from(validator.x.toBigInt());
                    const y = Field.from(validator.y.toBigInt());
                    let yMap = map.get(x);
                    yMap.assertNotEquals(y);
                    map.set(x, y);
                }
            };
            checkValidator(useSig1, validator_1);
            checkValidator(useSig2, validator_2);
            checkValidator(useSig3, validator_3);
        });
        if (this.isValidator(validator_1, useSig1).toBoolean()) {
            count = count.add(1);
        }
        if (this.isValidator(validator_2, useSig2).toBoolean()) {
            count = count.add(1);
        }
        if (this.isValidator(validator_3, useSig3).toBoolean()) {
            count = count.add(1);
        }
        Provable.log("count", count);
        count.assertGreaterThanOrEqual(this.threshold.getAndRequireEquals(), "Not enough validators");
    }
    async validateSig(msg, signature, validator, useSig) {
        let isValid = Bool(false);
        Provable.asProver(async () => {
            if (useSig.toBoolean()) {
                isValid = await this.validateMsg(msg, signature, validator);
                Provable.log("validateMsg isValid", isValid);
                isValid.assertTrue("Invalid signature for validator");
            }
        });
    }
    async validateMsg(message, signature, publicKey) {
        let proof = await signature.verifyV2(message, publicKey);
        Provable.log("proof", proof);
        return proof;
    }
}
__decorate([
    state(UInt64),
    __metadata("design:type", Object)
], Bridge.prototype, "minAmount", void 0);
__decorate([
    state(UInt64),
    __metadata("design:type", Object)
], Bridge.prototype, "maxAmount", void 0);
__decorate([
    state(UInt64),
    __metadata("design:type", Object)
], Bridge.prototype, "threshold", void 0);
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], Bridge.prototype, "validatorManager", void 0);
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], Bridge.prototype, "manager", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64, UInt64]),
    __metadata("design:returntype", Promise)
], Bridge.prototype, "setAmountLimits", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey]),
    __metadata("design:returntype", Promise)
], Bridge.prototype, "changeManager", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PublicKey]),
    __metadata("design:returntype", Promise)
], Bridge.prototype, "changeValidatorManager", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64, Field, PublicKey]),
    __metadata("design:returntype", Promise)
], Bridge.prototype, "lock", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UInt64,
        PublicKey,
        UInt64,
        PublicKey,
        Bool,
        Ecdsa,
        Secp256k1,
        Bool,
        Ecdsa,
        Secp256k1,
        Bool,
        Ecdsa,
        Secp256k1]),
    __metadata("design:returntype", Promise)
], Bridge.prototype, "unlock", null);
//# sourceMappingURL=Bridge.js.map