import type { Bool } from 'o1js';
import type { AdminAction } from '../token/adminable';
interface Hooks {
    canAdmin: (action: AdminAction) => Bool;
}
export default Hooks;
