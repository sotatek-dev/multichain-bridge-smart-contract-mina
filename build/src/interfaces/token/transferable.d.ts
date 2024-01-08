import { PublicKey, UInt64, AccountUpdate } from 'o1js';
type MayUseToken = typeof AccountUpdate.MayUseToken.InheritFromParent | typeof AccountUpdate.MayUseToken.ParentsOwnToken;
interface TransferOptions {
    from?: PublicKey;
    to?: PublicKey;
    amount: UInt64;
    mayUseToken?: MayUseToken;
}
declare const TransferFromToOptions_base: (new (value: {
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
declare class TransferFromToOptions extends TransferFromToOptions_base {
}
type FromTransferReturn = [AccountUpdate, undefined];
type ToTransferReturn = [undefined, AccountUpdate];
type FromToTransferReturn = [AccountUpdate, AccountUpdate];
type TransferReturn = FromToTransferReturn | FromTransferReturn | ToTransferReturn;
interface Transferable {
    transferFromTo: (options: TransferFromToOptions) => FromToTransferReturn;
    transfer: (options: TransferOptions) => TransferReturn;
    transferFrom: (from: PublicKey, amount: UInt64, mayUseToken: MayUseToken) => FromTransferReturn;
    transferTo: (to: PublicKey, amount: UInt64, mayUseToken: MayUseToken) => ToTransferReturn;
}
export default Transferable;
export { TransferFromToOptions };
export type { TransferOptions, TransferReturn, FromTransferReturn, ToTransferReturn, FromToTransferReturn, MayUseToken, };
