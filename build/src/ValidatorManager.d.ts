import { SmartContract, State, Bool, DeployArgs, Field, PublicKey } from 'o1js';
export declare class ValidatorManager extends SmartContract {
    validator1: State<PublicKey>;
    validator2: State<PublicKey>;
    validator3: State<PublicKey>;
    manager: State<PublicKey>;
    deploy(args: DeployArgs & {
        _validator1: PublicKey;
        _validator2: PublicKey;
        _validator3: PublicKey;
        _manager: PublicKey;
    }): Promise<void>;
    isValidator(p: PublicKey): Bool;
    getValidatorIndex(p: PublicKey): Field;
    compareValidators(p1: PublicKey, p2: PublicKey): Bool;
    changeValidator(validator1: PublicKey, validator2: PublicKey, validator3: PublicKey): Promise<void>;
}
