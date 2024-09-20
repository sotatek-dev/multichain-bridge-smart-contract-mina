import { PublicKey, SmartContract, State, UInt64, Bool, DeployArgs, Field, Signature } from 'o1js';
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
    minAmount: State<UInt64>;
    maxAmount: State<UInt64>;
    threshold: State<UInt64>;
    validatorManager: State<PublicKey>;
    manager: State<PublicKey>;
    events: {
        Unlock: typeof UnlockEvent;
        Lock: typeof LockEvent;
    };
    deploy(args: DeployArgs & {
        minAmount: UInt64;
        maxAmount: UInt64;
        threshold: UInt64;
        validatorPub: PublicKey;
        manager: PublicKey;
    }): Promise<void>;
    setAmountLimits(newMinAmount: UInt64, newMaxAmount: UInt64): Promise<void>;
    changeManager(newManager: PublicKey): Promise<void>;
    changeValidatorManager(validatorManager: PublicKey): Promise<void>;
    lock(amount: UInt64, address: Field, tokenAddr: PublicKey): Promise<void>;
    unlock(amount: UInt64, receiver: PublicKey, id: UInt64, tokenAddr: PublicKey, useSig1: Bool, validator1: PublicKey, sig1: Signature, useSig2: Bool, validator2: PublicKey, sig2: Signature, useSig3: Bool, validator3: PublicKey, sig3: Signature): Promise<void>;
    validateValidator(useSig1: Bool, validator1: PublicKey, useSig2: Bool, validator2: PublicKey, useSig3: Bool, validator3: PublicKey): Promise<void>;
    validateSig(msg: Field[], signature: Signature, validator: PublicKey, useSig: Bool): Promise<void>;
    verifyMsg(publicKey: PublicKey, msg: Field[], sig: Signature): Promise<void>;
}
export {};
