import { PublicKey, Account, UInt64, Bool } from 'snarkyjs';
interface ViewableOptions {
    preconditions: {
        shouldAssertEquals: boolean;
    };
}
interface Viewable {
    getAccountOf: (address: PublicKey) => ReturnType<typeof Account>;
    getBalanceOf: (address: PublicKey, options: ViewableOptions) => UInt64;
    getTotalSupply: (options: ViewableOptions) => UInt64;
    getCirculatingSupply: (options: ViewableOptions) => UInt64;
    getDecimals: () => UInt64;
    getPaused: (options: ViewableOptions) => Bool;
    getHooks: (options: ViewableOptions) => PublicKey;
}
export default Viewable;
export type { ViewableOptions };
