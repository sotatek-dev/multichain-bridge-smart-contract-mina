import type { VerificationKey } from 'snarkyjs';
interface Upgradable {
    setVerificationKey: (verificationKey: VerificationKey) => void;
}
export default Upgradable;
