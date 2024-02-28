import { DeployArgs, Field, PublicKey, SmartContract, State, UInt64 } from 'o1js';
declare const Transfer_base: (new (value: {
    from: PublicKey;
    to: PublicKey;
    amount: UInt64;
}) => {
    from: PublicKey;
    to: PublicKey;
    amount: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    from: PublicKey;
    to: PublicKey;
    amount: UInt64;
}> & {
    toInput: (x: {
        from: PublicKey;
        to: PublicKey;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        from: PublicKey;
        to: PublicKey;
        amount: UInt64;
    }) => {
        from: string;
        to: string;
        amount: string;
    };
    fromJSON: (x: {
        from: string;
        to: string;
        amount: string;
    }) => {
        from: PublicKey;
        to: PublicKey;
        amount: UInt64;
    };
    empty: () => {
        from: PublicKey;
        to: PublicKey;
        amount: UInt64;
    };
};
declare class Transfer extends Transfer_base {
    constructor(from: PublicKey, to: PublicKey, amount: UInt64);
}
declare const Lock_base: (new (value: {
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/field").Field;
    amount: UInt64;
}) => {
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/field").Field;
    amount: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/field").Field;
    amount: UInt64;
}> & {
    toInput: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field").Field;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field").Field;
        amount: UInt64;
    }) => {
        locker: string;
        receipt: string;
        amount: string;
    };
    fromJSON: (x: {
        locker: string;
        receipt: string;
        amount: string;
    }) => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field").Field;
        amount: UInt64;
    };
    empty: () => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field").Field;
        amount: UInt64;
    };
};
declare class Lock extends Lock_base {
    constructor(locker: PublicKey, receipt: Field, amount: UInt64);
}
export declare class Token extends SmartContract {
    decimals: State<UInt64>;
    maxSupply: State<UInt64>;
    circulatingSupply: State<UInt64>;
    owner: State<PublicKey>;
    events: {
        Transfer: typeof Transfer;
        Lock: typeof Lock;
    };
    deploy(args?: DeployArgs): void;
    mint(receiver: PublicKey, amount: UInt64): void;
    burn(burner: PublicKey, amount: UInt64): void;
    transfer(sender: PublicKey, receiver: PublicKey, amount: UInt64): void;
    lock(receipt: Field, bridgeAddress: PublicKey, amount: UInt64): void;
}
export {};
