import { PublicKey, SmartContract, State, UInt64, DeployArgs } from 'o1js';
declare const UnlockEvent_base: (new (value: {
    receiver: PublicKey;
    tokenAddress: PublicKey;
    amount: UInt64;
    id: UInt64;
}) => {
    receiver: PublicKey;
    tokenAddress: PublicKey;
    amount: UInt64;
    id: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    receiver: PublicKey;
    tokenAddress: PublicKey;
    amount: UInt64;
    id: UInt64;
}> & {
    toInput: (x: {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    }) => {
        receiver: string;
        tokenAddress: string;
        amount: string;
        id: string;
    };
    fromJSON: (x: {
        receiver: string;
        tokenAddress: string;
        amount: string;
        id: string;
    }) => {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    };
    empty: () => {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    };
};
declare class UnlockEvent extends UnlockEvent_base {
    constructor(receiver: PublicKey, tokenAddress: PublicKey, amount: UInt64, id: UInt64);
}
declare const LockEvent_base: (new (value: {
    tokenAddress: PublicKey;
    amount: UInt64;
}) => {
    tokenAddress: PublicKey;
    amount: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    tokenAddress: PublicKey;
    amount: UInt64;
}> & {
    toInput: (x: {
        tokenAddress: PublicKey;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        tokenAddress: PublicKey;
        amount: UInt64;
    }) => {
        tokenAddress: string;
        amount: string;
    };
    fromJSON: (x: {
        tokenAddress: string;
        amount: string;
    }) => {
        tokenAddress: PublicKey;
        amount: UInt64;
    };
    empty: () => {
        tokenAddress: PublicKey;
        amount: UInt64;
    };
};
declare class LockEvent extends LockEvent_base {
    constructor(tokenAddress: PublicKey, amount: UInt64);
}
export declare class Bridge extends SmartContract {
    minter: State<PublicKey>;
    configurator: State<PublicKey>;
    minAmount: State<UInt64>;
    maxAmount: State<UInt64>;
    events: {
        Unlock: typeof UnlockEvent;
        Lock: typeof LockEvent;
    };
    decrementBalance(amount: UInt64): void;
    deploy(args?: DeployArgs): void;
    config(_configurator: PublicKey, _min: UInt64, _max: UInt64): void;
    setConfigurator(_configurator: PublicKey): void;
    checkMinMax(amount: UInt64): void;
    unlock(tokenAddress: PublicKey, amount: UInt64, receiver: PublicKey, id: UInt64): void;
}
export {};
