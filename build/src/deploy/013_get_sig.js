import { Mina, PrivateKey, Signature } from 'o1js';
let feepayerKey = PrivateKey.fromBase58("");
// set up Mina instance and contract we interact with
const MINAURL = 'https://proxy.devnet.minaexplorer.com/graphql';
const ARCHIVEURL = 'https://api.minascan.io/archive/devnet/v1/graphql/';
const network = Mina.Network({
    mina: MINAURL,
    archive: ARCHIVEURL,
});
Mina.setActiveInstance(network);
const msg = `{"id":"y96qmT865fCMGGHdKAQ448uUwqs7dEfqnGBGVrv3tiRKTC2hxE","address":"B62qpN6sE9Bg9vzYVfs4ZBajgnv2sobb8fy76wZPB5vWM27s9GgtUTA","name":"Httpz","symbol":"Httpz","decimal":"9","description":"Httpz Token in Mainnet","website":"https://claim.httpz.link/","fungibleTokenVersion":"1.1.0"}`;
const signature = await Signature.create(feepayerKey, msg);
console.log("🚀 ~ signature:", signature.toJSON());
//# sourceMappingURL=013_get_sig.js.map