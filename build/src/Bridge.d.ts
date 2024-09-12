import { PublicKey, SmartContract, State, UInt64, Bool, DeployArgs, Field } from 'o1js';
import { Secp256k1, Ecdsa, Bytes32 } from './ecdsa/ecdsa.js';
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
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf.js").Provable<{
    receiver: PublicKey;
    tokenAddress: PublicKey;
    amount: UInt64;
    id: UInt64;
}, {
    receiver: {
        x: bigint;
        isOdd: boolean;
    };
    tokenAddress: {
        x: bigint;
        isOdd: boolean;
    };
    amount: bigint;
    id: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field.js").Field[]) => {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    };
} & {
    fromValue: (value: {
        receiver: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field.js").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool.js").Bool;
        };
        tokenAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field.js").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool.js").Bool;
        };
        amount: bigint | UInt64;
        id: bigint | UInt64;
    }) => {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    };
    toInput: (x: {
        receiver: PublicKey;
        tokenAddress: PublicKey;
        amount: UInt64;
        id: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field.js").Field, number][] | undefined;
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
    receipt: import("o1js/dist/node/lib/provable/field.js").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}) => {
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/provable/field.js").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf.js").Provable<{
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/provable/field.js").Field;
    amount: UInt64;
    tokenAddress: PublicKey;
}, {
    locker: {
        x: bigint;
        isOdd: boolean;
    };
    receipt: bigint;
    amount: bigint;
    tokenAddress: {
        x: bigint;
        isOdd: boolean;
    };
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field.js").Field[]) => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
} & {
    fromValue: (value: {
        locker: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field.js").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool.js").Bool;
        };
        receipt: string | number | bigint | import("o1js/dist/node/lib/provable/field.js").Field;
        amount: bigint | UInt64;
        tokenAddress: PublicKey | {
            x: bigint | import("o1js/dist/node/lib/provable/field.js").Field;
            isOdd: boolean | import("o1js/dist/node/lib/provable/bool.js").Bool;
        };
    }) => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
    toInput: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    }) => {
        fields?: import("o1js/dist/node/lib/provable/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
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
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
    empty: () => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/provable/field.js").Field;
        amount: UInt64;
        tokenAddress: PublicKey;
    };
};
declare class LockEvent extends LockEvent_base {
    constructor(locker: PublicKey, receipt: Field, amount: UInt64, tokenAddress: PublicKey);
}
export declare class Bridge extends SmartContract {
    minter: State<PublicKey>;
    admin: State<PublicKey>;
    events: {
        Unlock: typeof UnlockEvent;
        Lock: typeof LockEvent;
    };
    decrementBalance(amount: UInt64): Promise<void>;
    deploy(args: DeployArgs & {
        validatorsMapRoot: Field;
        minAmount: UInt64;
        maxAmount: UInt64;
        threshold: UInt64;
    }): Promise<void>;
    changeAdmin(_admin: PublicKey): Promise<void>;
    setValidator(xKey: Field, yKey: Field, isOk: Bool): Promise<void>;
    lock(amount: UInt64, address: Field, tokenAddr: PublicKey): Promise<void>;
    unlock(amount: UInt64, receiver: PublicKey, id: UInt64, tokenAddr: PublicKey, signatures: Ecdsa[], validators: Secp256k1[]): Promise<void>;
    checkProof(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1): Promise<Bool>;
    validateMsg(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1): Promise<Bool>;
    secp256k1ToPublicKey(secp256k1Key: Secp256k1): void;
    validateValidator(validator: Secp256k1): void;
    isValidator(validator: Secp256k1): Bool;
}
export {};
