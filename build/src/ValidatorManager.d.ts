import { SmartContract, State, Bool, DeployArgs, Field, PublicKey } from 'o1js';
export declare class ValidatorManager extends SmartContract {
    validator1X: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    validator1Y: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    validator2X: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    validator2Y: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    validator3X: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    validator3Y: State<import("o1js/dist/node/lib/provable/field.js").Field>;
    manager: State<PublicKey>;
    deploy(args: DeployArgs & {
        _val1X: Field;
        _val1Y: Field;
        _val2X: Field;
        _val2Y: Field;
        _val3X: Field;
        _val3Y: Field;
        _manager: PublicKey;
    }): Promise<void>;
    isValidator(xKey: Field, yValue: Field): Bool;
    getValidatorIndex(xKey: Field, yValue: Field): Field;
    compareValidators(x1: Field, y1: Field, x2: Field, y2: Field): Bool;
    changeValidator(xKey1: Field, yKey1: Field, xKey2: Field, yKey2: Field, xKey3: Field, yKey3: Field): Promise<void>;
}
