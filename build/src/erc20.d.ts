import { ProvablePure, Bool, CircuitString, Field, PublicKey, SmartContract, UInt64, Experimental, VerificationKey } from 'o1js';
/**
 * ERC-20 token standard.
 * https://ethereum.org/en/developers/docs/standards/tokens/erc-20/
 */
type Erc20 = {
    name?: () => CircuitString;
    symbol?: () => CircuitString;
    decimals?: () => Field;
    totalSupply(): UInt64;
    balanceOf(owner: PublicKey): UInt64;
    allowance(owner: PublicKey, spender: PublicKey): UInt64;
    transfer(to: PublicKey, value: UInt64): Bool;
    transferFrom(from: PublicKey, to: PublicKey, value: UInt64): Bool;
    approveSpend(spender: PublicKey, value: UInt64): Bool;
    events: {
        Transfer: ProvablePure<{
            from: PublicKey;
            to: PublicKey;
            value: UInt64;
        }>;
        Approval: ProvablePure<{
            owner: PublicKey;
            spender: PublicKey;
            value: UInt64;
        }>;
    };
};
/**
 * A simple ERC20 token
 *
 * Tokenomics:
 * The supply is constant and the entire supply is initially sent to an account controlled by the zkApp developer
 * After that, tokens can be sent around with authorization from their owner, but new ones can't be minted.
 *
 * Functionality:
 * Just enough to be swapped by the DEX contract, and be secure
 */
export declare class WETH extends SmartContract implements Erc20 {
    SUPPLY: UInt64;
    init(): void;
    name(): CircuitString;
    symbol(): CircuitString;
    decimals(): Field;
    totalSupply(): UInt64;
    balanceOf(owner: PublicKey): UInt64;
    allowance(owner: PublicKey, spender: PublicKey): UInt64;
    transfer(to: PublicKey, value: UInt64): Bool;
    transferFrom(from: PublicKey, to: PublicKey, value: UInt64): Bool;
    approveSpend(spender: PublicKey, value: UInt64): Bool;
    events: {
        Transfer: ProvablePure<{
            from: PublicKey;
            to: PublicKey;
            value: UInt64;
        }> & {
            toInput: (x: {
                from: PublicKey;
                to: PublicKey;
                value: UInt64;
            }) => {
                fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
                packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
            };
            toJSON: (x: {
                from: PublicKey;
                to: PublicKey;
                value: UInt64;
            }) => {
                from: string;
                to: string;
                value: string;
            };
            fromJSON: (x: {
                from: string;
                to: string;
                value: string;
            }) => {
                from: PublicKey;
                to: PublicKey;
                value: UInt64;
            };
            empty: () => {
                from: PublicKey;
                to: PublicKey;
                value: UInt64;
            };
        };
        Approval: ProvablePure<{
            owner: PublicKey;
            spender: PublicKey;
            value: UInt64;
        }> & {
            toInput: (x: {
                owner: PublicKey;
                spender: PublicKey;
                value: UInt64;
            }) => {
                fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
                packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
            };
            toJSON: (x: {
                owner: PublicKey;
                spender: PublicKey;
                value: UInt64;
            }) => {
                owner: string;
                spender: string;
                value: string;
            };
            fromJSON: (x: {
                owner: string;
                spender: string;
                value: string;
            }) => {
                owner: PublicKey;
                spender: PublicKey;
                value: UInt64;
            };
            empty: () => {
                owner: PublicKey;
                spender: PublicKey;
                value: UInt64;
            };
        };
    };
    transferFromZkapp(from: PublicKey, to: PublicKey, value: UInt64, approve: Experimental.Callback<any>): Bool;
    deployZkapp(zkappAddress: PublicKey, verificationKey: VerificationKey): void;
    approveZkapp(callback: Experimental.Callback<any>): void;
}
export {};
