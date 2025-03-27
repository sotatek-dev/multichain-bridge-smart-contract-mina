import { FungibleToken } from "./FungibleToken.js"
import { Bridge } from "./Bridge.js"
import {
  AccountUpdate,
  assert,
  Bool,
  DeployArgs,
  method,
  Permissions,
  Provable,
  PublicKey,
  SmartContract,
  State,
  state,
  UInt64,
  VerificationKey,
} from "o1js"

export type FungibleTokenAdminBase = SmartContract & {
  canMint(accountUpdate: AccountUpdate): Promise<Bool>
  canChangeAdmin(admin: PublicKey): Promise<Bool>
  canPause(): Promise<Bool>
  canResume(): Promise<Bool>
  canChangeVerificationKey(vk: VerificationKey): Promise<Bool>
}

export interface FungibleTokenAdminDeployProps extends Exclude<DeployArgs, undefined> {
  adminPublicKey: PublicKey
}

/** A contract that grants permissions for administrative actions on a token.
 *
 * We separate this out into a dedicated contract. That way, when issuing a token, a user can
 * specify their own rules for administrative actions, without changing the token contract itself.
 *
 * The advantage is that third party applications that only use the token in a non-privileged way
 * can integrate against the unchanged token contract.
 */
export class FungibleTokenAdmin extends SmartContract implements FungibleTokenAdminBase {
  @state(PublicKey)
  private adminPublicKey = State<PublicKey>()

  @state(PublicKey)
  public bridgePublicKey = State<PublicKey>()
  @state(Bool)
  private mintState = State<Bool>()

  async deploy(props: FungibleTokenAdminDeployProps) {
    await super.deploy(props)
    this.adminPublicKey.set(props.adminPublicKey)
    this.mintState.set(Bool(false))
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.signature(),
    })
  }

  async mint(recipient: PublicKey, amount: UInt64, token: PublicKey) {
    const bridgeSc = new Bridge(this.bridgePublicKey.getAndRequireEquals());
    await bridgeSc.assertInsideUpdate();
    await this.mintState.requireEquals(Bool(true))
    await this.mintState.set(Bool(true));
    const tokenSc = new FungibleToken(token);
    await tokenSc.mint(recipient, amount);
    await this.mintState.set(Bool(false));
  }

  /** Update the verification key.
   * Note that because we have set the permissions for setting the verification key to `impossibleDuringCurrentVersion()`, this will only be possible in case of a protocol update that requires an update.
   */
  @method
  async updateVerificationKey(vk: VerificationKey) {
    await this.ensureAdminSignature()
    this.account.verificationKey.set(vk)
  }

  @method
  async setBridgePublicKey(_bridgePublicKey: PublicKey) {
    await this.ensureAdminSignature()
    this.bridgePublicKey.set(_bridgePublicKey);
  }

  private async ensureAdminSignature() {
    const admin = await Provable.witnessAsync(PublicKey, async () => {
      let pk = await this.adminPublicKey.fetch()
      assert(pk !== undefined, "could not fetch admin public key")
      return pk
    })
    this.adminPublicKey.requireEquals(admin)
    return AccountUpdate.createSigned(admin)
  }

  @method.returns(Bool)
  public async canMint(_accountUpdate: AccountUpdate) {
    await this.ensureAdminSignature();
    await this.mintState.requireEquals(Bool(true))
    return Bool(true);
  }

  @method.returns(Bool)
  public async canChangeAdmin(_admin: PublicKey) {
    await this.ensureAdminSignature()
    return Bool(true)
  }

  @method.returns(Bool)
  public async canPause(): Promise<Bool> {
    await this.ensureAdminSignature()
    return Bool(true)
  }

  @method.returns(Bool)
  public async canResume(): Promise<Bool> {
    await this.ensureAdminSignature()
    return Bool(true)
  }

  @method.returns(Bool)
  public async canChangeVerificationKey(
    _vk: VerificationKey,
  ): Promise<Bool> {
    await this.ensureAdminSignature()
    return Bool(true)
  }
}
