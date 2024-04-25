import { PublicKey, SmartContract, State, UInt64, DeployArgs, Field } from 'o1js';
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
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    receiver: PublicKey;
    tokenAddress: PublicKey;
    amount: UInt64;
    id: UInt64;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    };
} & {
    toInput: (x: {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
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
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/provable/field").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}) => {
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/provable/field").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/provable/field").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
} & {
    toInput: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    }) => {
        locker: string;
        receipt: string;
        amount: string;
        tokenAddress: string;
    };
    fromJSON: (x: {
        locker: string;
        receipt: string;
        amount: string;
        tokenAddress: string;
    }) => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
    empty: () => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
};
declare class LockEvent extends LockEvent_base {
    constructor(locker: PublicKey, receipt: Field, amount: UInt64, tokenAddress: PublicKey);
}
export declare class Bridge extends SmartContract {
    minter: State<PublicKey>;
    configurator: State<PublicKey>;
    minAmount: State<UInt64>;
    maxAmount: State<UInt64>;
    tokenAddress: State<PublicKey>;
    events: {
        Unlock: typeof UnlockEvent;
        Lock: typeof LockEvent;
    };
    decrementBalance(amount: UInt64): Promise<void>;
    deploy(args: DeployArgs & {
        tokenAddress: PublicKey;
    }): Promise<void>;
    config(_configurator: PublicKey, _min: UInt64, _max: UInt64): Promise<void>;
    private checkMinMax;
    lock(amount: UInt64, address: Field): Promise<void>;
    unlock(amount: UInt64, receiver: PublicKey, id: UInt64): Promise<void>;
}
export {};
