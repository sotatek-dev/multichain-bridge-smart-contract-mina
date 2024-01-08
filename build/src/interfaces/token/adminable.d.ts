import { type PublicKey, type UInt64, type AccountUpdate, type State, Bool, VerificationKey } from 'o1js';
declare const AdminAction_base: (new (value: {
    type: import("o1js/dist/node/lib/field").Field;
}) => {
    type: import("o1js/dist/node/lib/field").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky").ProvablePure<{
    type: import("o1js/dist/node/lib/field").Field;
}> & {
    toInput: (x: {
        type: import("o1js/dist/node/lib/field").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field").Field, number][] | undefined;
    };
    toJSON: (x: {
        type: import("o1js/dist/node/lib/field").Field;
    }) => {
        type: string;
    };
    fromJSON: (x: {
        type: string;
    }) => {
        type: import("o1js/dist/node/lib/field").Field;
    };
    empty: () => {
        type: import("o1js/dist/node/lib/field").Field;
    };
};
declare class AdminAction extends AdminAction_base {
    static types: {
        mint: number;
        burn: number;
        setTotalSupply: number;
        setPaused: number;
        setVerificationKey: number;
    };
    static fromType(type: number): AdminAction;
}
interface Mintable {
    totalSupply: State<UInt64>;
    circulatingSupply: State<UInt64>;
    mint: (to: PublicKey, amount: UInt64) => AccountUpdate;
    setTotalSupply: (amount: UInt64) => void;
}
interface Burnable {
    burn: (from: PublicKey, amount: UInt64) => AccountUpdate;
}
interface Pausable {
    paused: State<Bool>;
    setPaused: (paused: Bool) => void;
}
interface Upgradable {
    setVerificationKey: (verificationKey: VerificationKey) => void;
}
export type { Mintable, Burnable, Pausable, Upgradable };
export { AdminAction };
