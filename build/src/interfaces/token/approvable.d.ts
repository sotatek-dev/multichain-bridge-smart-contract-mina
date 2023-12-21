import { AccountUpdate } from 'snarkyjs';
interface Approvable {
    approveTransfer: (from: AccountUpdate, to: AccountUpdate) => void;
    approveDeploy: (deploy: AccountUpdate) => void;
}
export default Approvable;
