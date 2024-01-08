import { Bool, PublicKey, State, SmartContract } from 'o1js';
import type _Hooks from './interfaces/hookHandler/hooks';
import { AdminAction } from './interfaces/token/adminable';
import type { ViewableOptions } from './interfaces/token/viewable';
declare class Hooks extends SmartContract implements _Hooks {
    static defaultViewableOptions: ViewableOptions;
    admin: State<PublicKey>;
    initialize(admin: PublicKey): void;
    getAdmin({ preconditions }?: ViewableOptions): PublicKey;
    canAdmin(action: AdminAction): Bool;
}
export default Hooks;
