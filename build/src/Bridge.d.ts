import { ProvablePure, CircuitString, Field, PublicKey, SmartContract, State } from 'o1js';
export declare class Bridge extends SmartContract {
    minter: State<PublicKey>;
    weth: State<PublicKey>;
    minAmout: State<import("o1js/dist/node/lib/field").Field>;
    maxAmount: State<import("o1js/dist/node/lib/field").Field>;
    events: {
        Lock: ProvablePure<{
            locker: PublicKey;
            receipt: PublicKey;
            token: PublicKey;
            amount: import("o1js/dist/node/lib/field").Field;
            tokenName: any;
        }> & {
            toInput: (x: {
                locker: PublicKey;
                receipt: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                tokenName: any;
            }) => {
                fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
                packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
            };
            toJSON: (x: {
                locker: PublicKey;
                receipt: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                tokenName: any;
            }) => {
                locker: string;
                receipt: string;
                token: string;
                amount: string;
                tokenName: any;
            };
            fromJSON: (x: {
                locker: string;
                receipt: string;
                token: string;
                amount: string;
                tokenName: any;
            }) => {
                locker: PublicKey;
                receipt: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                tokenName: any;
            };
            empty: () => {
                locker: PublicKey;
                receipt: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                tokenName: any;
            };
        };
        Unlock: ProvablePure<{
            user: PublicKey;
            token: PublicKey;
            amount: import("o1js/dist/node/lib/field").Field;
            hash: any;
            fee: import("o1js/dist/node/lib/field").Field;
        }> & {
            toInput: (x: {
                user: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                hash: any;
                fee: import("o1js/dist/node/lib/field").Field;
            }) => {
                fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
                packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
            };
            toJSON: (x: {
                user: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                hash: any;
                fee: import("o1js/dist/node/lib/field").Field;
            }) => {
                user: string;
                token: string;
                amount: string;
                hash: any;
                fee: string;
            };
            fromJSON: (x: {
                user: string;
                token: string;
                amount: string;
                hash: any;
                fee: string;
            }) => {
                user: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                hash: any;
                fee: import("o1js/dist/node/lib/field").Field;
            };
            empty: () => {
                user: PublicKey;
                token: PublicKey;
                amount: import("o1js/dist/node/lib/field").Field;
                hash: any;
                fee: import("o1js/dist/node/lib/field").Field;
            };
        };
    };
    init(): void;
    isMinter(): void;
    lock(token: PublicKey, receipt: PublicKey, amount: Field): void;
    unlock(token: PublicKey, amount: Field, user: PublicKey, hash: CircuitString, fee: Field): void;
}
