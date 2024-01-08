import { AccountUpdate, Bool, SmartContract, PublicKey, UInt64, Account, State, VerificationKey } from 'o1js';
import type Approvable from './interfaces/token/approvable';
import type Transferable from './interfaces/token/transferable';
import { type FromToTransferReturn, FromTransferReturn, MayUseToken, ToTransferReturn, TransferFromToOptions, TransferOptions, TransferReturn } from './interfaces/token/transferable';
import { type Pausable, type Burnable, type Mintable, type Upgradable } from './interfaces/token/adminable';
import type Viewable from './interfaces/token/viewable';
import type { ViewableOptions } from './interfaces/token/viewable';
import Hooks from './Hooks';
import type Hookable from './interfaces/token/hookable';
declare class Token extends SmartContract implements Hookable, Mintable, Burnable, Approvable, Transferable, Viewable, Pausable, Upgradable {
    static defaultViewableOptions: ViewableOptions;
    static defaultDecimals: number;
    hooks: State<PublicKey>;
    totalSupply: State<UInt64>;
    circulatingSupply: State<UInt64>;
    paused: State<import("o1js/dist/node/lib/bool").Bool>;
    decimals: UInt64;
    getHooksContract(): Hooks;
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
