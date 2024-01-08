import { AccountUpdate, type PublicKey, SmartContract, UInt64 } from 'o1js';
import type Withdrawable from './interfaces/tokenAccount/withdrawable';
import Depositable from './interfaces/tokenAccount/depositable';
declare class TokenAccount extends SmartContract implements Withdrawable, Depositable {
    tokenAddress: PublicKey;
    withdraw(amount: UInt64): AccountUpdate;
    deposit(amount: UInt64): AccountUpdate;
}
export default TokenAccount;
