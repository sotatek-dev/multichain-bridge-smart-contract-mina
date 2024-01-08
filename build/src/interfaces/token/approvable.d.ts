import { AccountUpdate } from 'o1js';
interface Approvable {
    approveTransfer: (from: AccountUpdate, to: AccountUpdate) => void;
    approveDeploy: (deploy: AccountUpdate) => void;
}
export default Approvable;
