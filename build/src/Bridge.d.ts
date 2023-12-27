import { PublicKey, SmartContract, UInt64 } from 'o1js';
declare const UnlockEvent_base: (new (value: {
    tokenAddress: PublicKey;
    receiver: PublicKey;
    amount: UInt64;
}) => {
    tokenAddress: PublicKey;
    receiver: PublicKey;
    amount: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    tokenAddress: PublicKey;
    receiver: PublicKey;
    amount: UInt64;
}> & {
    toInput: (x: {
        tokenAddress: PublicKey;
        receiver: PublicKey;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        tokenAddress: PublicKey;
        receiver: PublicKey;
        amount: UInt64;
    }) => {
        tokenAddress: string;
        receiver: string;
        amount: string;
    };
    fromJSON: (x: {
        tokenAddress: string;
        receiver: string;
        amount: string;
    }) => {
        tokenAddress: PublicKey;
        receiver: PublicKey;
        amount: UInt64;
    };
    empty: () => {
        tokenAddress: PublicKey;
        receiver: PublicKey;
        amount: UInt64;
    };
};
declare class UnlockEvent extends UnlockEvent_base {
    constructor(tokenAddress: PublicKey, receiver: PublicKey, amount: UInt64);
}
export declare class Bridge extends SmartContract {
    events: {
        Unlock: typeof UnlockEvent;
    };
    decrementBalance(amount: UInt64): void;
    unlock(tokenAddress: PublicKey, receiver: PublicKey, amount: UInt64): void;
}
export {};
