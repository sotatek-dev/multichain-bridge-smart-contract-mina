import { SmartContract, State, DeployArgs, PublicKey } from 'o1js';
export declare class Manager extends SmartContract {
    admin: State<PublicKey>;
    minter_1: State<PublicKey>;
    minter_2: State<PublicKey>;
    minter_3: State<PublicKey>;
    deploy(args: DeployArgs & {
        _admin: PublicKey;
        _minter_1: PublicKey;
        _minter_2: PublicKey;
        _minter_3: PublicKey;
    }): Promise<void>;
    isAdmin(sender: PublicKey): void;
    isMinter(sender: PublicKey): void;
    changeAdmin(_admin: PublicKey): Promise<void>;
    changeMinter_1(_minter_1: PublicKey): Promise<void>;
    changeMinter_2(_minter_2: PublicKey): Promise<void>;
    changeMinter_3(_minter_3: PublicKey): Promise<void>;
}
