import { Field, SmartContract, State, PublicKey } from 'o1js';
declare const UnlockTx_base: (new (value: {
    receiver: PublicKey;
    amount: import("o1js/dist/node/lib/field").Field;
    hash: any;
}) => {
    receiver: PublicKey;
    amount: import("o1js/dist/node/lib/field").Field;
    hash: any;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    receiver: PublicKey;
    amount: import("o1js/dist/node/lib/field").Field;
    hash: any;
}> & {
    toInput: (x: {
        receiver: PublicKey;
        amount: import("o1js/dist/node/lib/field").Field;
        hash: any;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        receiver: PublicKey;
        amount: import("o1js/dist/node/lib/field").Field;
        hash: any;
    }) => {
        receiver: string;
        amount: string;
        hash: any;
    };
    fromJSON: (x: {
        receiver: string;
        amount: string;
        hash: any;
    }) => {
        receiver: PublicKey;
        amount: import("o1js/dist/node/lib/field").Field;
        hash: any;
    };
    empty: () => {
        receiver: PublicKey;
        amount: import("o1js/dist/node/lib/field").Field;
        hash: any;
    };
};
declare class UnlockTx extends UnlockTx_base {
    getHash(): Field;
}
export declare class Bridge extends SmartContract {
    minter: State<PublicKey>;
    commitment: State<import("o1js/dist/node/lib/field").Field>;
    init(): void;
    isMinter(): void;
    mint(data: UnlockTx): void;
}
export {};
