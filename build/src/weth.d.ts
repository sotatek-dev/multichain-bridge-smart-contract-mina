import { AccountUpdate, PublicKey, SmartContract, UInt64, VerificationKey } from 'o1js';
export declare class TokenContract extends SmartContract {
    init(): void;
    deployZkapp(address: PublicKey, verificationKey: VerificationKey): void;
    approveUpdate(zkappUpdate: AccountUpdate): void;
    approveAny(zkappUpdate: AccountUpdate): void;
    approveUpdateAndSend(zkappUpdate: AccountUpdate, to: PublicKey, amount: UInt64): void;
    transfer(from: PublicKey, to: PublicKey | AccountUpdate, amount: UInt64): void;
    transferToAddress(from: PublicKey, to: PublicKey, value: UInt64): void;
    transferToUpdate(from: PublicKey, to: AccountUpdate, value: UInt64): void;
    getBalance(publicKey: PublicKey): UInt64;
}
