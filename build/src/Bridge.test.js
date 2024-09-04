import { AccountUpdate, Encoding, Field, Mina, PrivateKey, UInt64 } from 'o1js';
import { Bridge } from './Bridge';
import { FungibleToken } from 'mina-fungible-token';
const proofsEnabled = false;
describe('token bridge test', () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    const userPrivkey = Local.testAccounts[0].privateKey;
    const userPubkey = Local.testAccounts[0].publicKey;
    const configuratorPrivkey = Local.testAccounts[1].privateKey;
    const configuratorPubkey = Local.testAccounts[1].publicKey;
    const normalUserPrivkey = Local.testAccounts[2].privateKey;
    const normalUserPubkey = Local.testAccounts[2].publicKey;
    const tokenPrivkey = PrivateKey.random();
    const tokenPubkey = tokenPrivkey.toPublicKey();
    const token = new FungibleToken(tokenPubkey);
    const symbol = 'WETH';
    const src = "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts";
    const supply = UInt64.from(21000000000000);
    const bridgePrivkey = PrivateKey.random();
    const bridgePubkey = bridgePrivkey.toPublicKey();
    const bridgeZkapp = new Bridge(bridgePubkey);
    const SYMBOL = Encoding.stringToFields('BTC')[0];
    const DECIMALS = UInt64.from(9);
    const SUPPLY_MAX = UInt64.from(21000000000000000n);
    const AMOUNT_MINT = UInt64.from(20000000000000000n);
    const AMOUNT_DEPOSIT = UInt64.from(5000000000000000n);
    const AMOUNT_SEND = UInt64.from(1000000000n);
    const AMOUNT_WITHDRAW = UInt64.from(3000000000000000n);
    const totalSupply = UInt64.from(5000000000000000n);
    beforeAll(async () => {
        if (proofsEnabled) {
            await FungibleToken.compile();
            await Bridge.compile();
        }
        let tx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            await token.deploy({ owner: userPubkey, supply, symbol, src });
        });
        await tx.prove();
        tx.sign([userPrivkey, tokenPrivkey]);
        await tx.send();
        let bridgeTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            await bridgeZkapp.deploy({ tokenAddress: tokenPubkey });
        });
        await bridgeTx.prove();
        bridgeTx.sign([userPrivkey, bridgePrivkey]);
        await bridgeTx.send();
        let mintTx = await Mina.transaction(userPubkey, async () => {
            AccountUpdate.fundNewAccount(userPubkey, 1);
            await token.mint(normalUserPubkey, supply);
        });
        await mintTx.prove();
        mintTx.sign([userPrivkey]);
        await mintTx.send();
    });
    it('lock from normal user ', async () => {
        const sym = await token.getSupply();
        console.log("🚀 ~ it ~ sym:", sym.toString());
        const min = await bridgeZkapp.minAmount;
        console.log("🚀 ~ it ~ min:", min.get().toString());
        // Kiểm tra số dư của người dùng bình thường trước khi khóa
        const balanceBefore = await token.getBalanceOf(normalUserPubkey);
        console.log("Số dư trước khi khóa:", balanceBefore.toString());
        // Số tiền cần khóa
        const lockAmount = UInt64.from(1000);
        // Thực hiện giao dịch khóa token
        const lockTx = await Mina.transaction(normalUserPubkey, async () => {
            AccountUpdate.fundNewAccount(normalUserPubkey, 1);
            // Chuyển token từ người dùng bình thường vào hợp đồng Bridge
            await bridgeZkapp.lock(lockAmount, Field(123)); // 123 là ví dụ cho địa chỉ nhận
        });
        await lockTx.prove();
        lockTx.sign([normalUserPrivkey]);
        await lockTx.send();
        // Kiểm tra số dư sau khi khóa
        const balanceAfter = await token.getBalanceOf(normalUserPubkey);
        console.log("Số dư sau khi khóa:", balanceAfter.toString());
        // Kiểm tra số dư của hợp đồng Bridge
        const bridgeBalance = await token.getBalanceOf(bridgePubkey);
        console.log("Số dư của Bridge:", bridgeBalance.toString());
        // Xác minh rằng số dư đã thay đổi đúng
        expect(balanceAfter.toString()).toBe(balanceBefore.sub(lockAmount).toString());
        expect(bridgeBalance.toString()).toBe(lockAmount.toString());
    });
    it('unlock from owner ', async () => {
        // const unlockAmount = UInt64.from(1000001);
        // const tx = await Mina.transaction(userPubkey, async () => {
        //     await tokenZkapp.mintToken(userPubkey, unlockAmount, bridgePubkey, UInt64.from(1))
        // })
        // await tx.prove()
        // tx.sign([userPrivkey])
        // await tx.send()
    });
});
//# sourceMappingURL=Bridge.test.js.map