import { AccountUpdate, Bool, SmartContract, PublicKey, UInt64, Account, State, VerificationKey, Field, Experimental, DeployArgs } from 'o1js';
import type Approvable from './interfaces/token/approvable.js';
import type Transferable from './interfaces/token/transferable.js';
import { type FromToTransferReturn, FromTransferReturn, MayUseToken, ToTransferReturn, TransferFromToOptions, TransferOptions, TransferReturn } from './interfaces/token/transferable.js';
import { type Pausable, type Burnable, type Mintable, type Upgradable } from './interfaces/token/adminable.js';
import type Viewable from './interfaces/token/viewable.js';
import type { ViewableOptions } from './interfaces/token/viewable.js';
import Hooks from './Hooks.js';
import type Hookable from './interfaces/token/hookable.js';
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
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    from: PublicKey;
    to: PublicKey;
    amount: UInt64;
}> & {
    toInput: (x: {
        from: PublicKey;
        to: PublicKey;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
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
    receipt: import("o1js/dist/node/lib/field.js").Field;
    amount: UInt64;
}) => {
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/field.js").Field;
    amount: UInt64;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    locker: PublicKey;
    receipt: import("o1js/dist/node/lib/field.js").Field;
    amount: UInt64;
}> & {
    toInput: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field.js").Field;
        amount: UInt64;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field.js").Field;
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
        receipt: import("o1js/dist/node/lib/field.js").Field;
        amount: UInt64;
    };
    empty: () => {
        locker: PublicKey;
        receipt: import("o1js/dist/node/lib/field.js").Field;
        amount: UInt64;
    };
};
declare class Lock extends Lock_base {
    constructor(locker: PublicKey, receipt: Field, amount: UInt64);
}
declare class Token extends SmartContract implements Hookable, Mintable, Burnable, Approvable, Transferable, Viewable, Pausable, Upgradable {
    static defaultViewableOptions: ViewableOptions;
    static defaultDecimals: number;
    hooks: State<PublicKey>;
    totalSupply: State<UInt64>;
    circulatingSupply: State<UInt64>;
    paused: State<import("o1js/dist/node/lib/bool.js").Bool>;
    decimals: UInt64;
    events: {
        Transfer: typeof Transfer;
        Lock: typeof Lock;
    };
    getHooksContract(): Hooks;
    deploy(args?: DeployArgs): void;
    initialize(hooks: PublicKey, totalSupply: UInt64): void;
    /**
     * Mintable
     */
    mint(to: PublicKey, amount: UInt64): AccountUpdate;
    setTotalSupply(amount: UInt64): void;
    /**
     * Burnable
     */
    burn(from: PublicKey, amount: UInt64): AccountUpdate;
    /**
     * Upgradable
     */
    setVerificationKey(verificationKey: VerificationKey): void;
    /**
     * Pausable
     */
    setPaused(paused: Bool): void;
    /**
     * Approvable
     */
    hasNoBalanceChange(accountUpdates: AccountUpdate[]): Bool;
    assertHasNoBalanceChange(accountUpdates: AccountUpdate[]): void;
    approveTransfer(from: AccountUpdate, to: AccountUpdate): void;
    approveDeploy(deploy: AccountUpdate): void;
    lock(receipt: Field, bridgeAddress: PublicKey, amount: UInt64): void;
    approveCallbackAndTransfer(sender: PublicKey, receiver: PublicKey, amount: UInt64, callback: Experimental.Callback<any>): void;
    approveUpdateAndTransfer(zkappUpdate: AccountUpdate, receiver: PublicKey, amount: UInt64): void;
    approveUpdate(zkappUpdate: AccountUpdate): void;
    /**
     * 'sendTokens()' sends tokens from `senderAddress` to `receiverAddress`.
     *
     * It does so by deducting the amount of tokens from `senderAddress` by
     * authorizing the deduction with a proof. It then creates the receiver
     * from `receiverAddress` and sends the amount.
     */
    sendTokensFromZkApp(receiverAddress: PublicKey, amount: UInt64, callback: Experimental.Callback<any>): void;
    mintToken(receiverAddress: PublicKey, amount: UInt64, callback: Experimental.Callback<any>): void;
    /**
     * Transferable
     */
    transferFromTo({ from, to, amount, }: TransferFromToOptions): FromToTransferReturn;
    transferFrom(from: PublicKey, amount: UInt64, mayUseToken: MayUseToken): FromTransferReturn;
    transferTo(to: PublicKey, amount: UInt64, mayUseToken: MayUseToken): ToTransferReturn;
    transfer({ from, to, amount, mayUseToken, }: TransferOptions): TransferReturn;
    /**
     * Viewable
     */
    getAccountOf(address: PublicKey): ReturnType<typeof Account>;
    getBalanceOf(address: PublicKey, { preconditions }?: ViewableOptions): UInt64;
    getTotalSupply({ preconditions }?: ViewableOptions): UInt64;
    getCirculatingSupply({ preconditions }?: ViewableOptions): UInt64;
    getHooks({ preconditions }?: ViewableOptions): PublicKey;
    getPaused({ preconditions }?: ViewableOptions): Bool;
    getDecimals(): UInt64;
}
export default Token;
