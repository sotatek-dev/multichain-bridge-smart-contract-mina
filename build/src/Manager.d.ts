import { SmartContract, State, DeployArgs, PublicKey } from 'o1js';
export declare class Manager extends SmartContract {
    admin: State<PublicKey>;
    minter: State<PublicKey>;
    deploy(args: DeployArgs & {
        _admin: PublicKey;
        _minter: PublicKey;
    }): Promise<void>;
    isAdmin(sender: PublicKey): void;
    isMinter(sender: PublicKey): void;
    changeAdmin(_admin: PublicKey): Promise<void>;
    changeMinter(_minter: PublicKey): Promise<void>;
}
