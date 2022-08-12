import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {TCP} from "@libp2p/tcp";
import { Noise } from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {Bootstrap} from "@libp2p/bootstrap";
import {createRSAPeerId, createEd25519PeerId, createSecp256k1PeerId, createFromJSON, exportToProtobuf} from "@libp2p/peer-id-factory";
import fs from "fs";

// VARIABLES
var node = {};

// FUCNTIONS
const replacerFunc = () => {
   const visited = new WeakSet();
   return (key, value) => {
     if (typeof value === "object" && value !== null) {
       if (visited.has(value)) {
         return;
       }
       visited.add(value);
     }
     return value;
   };
 };

setInterval(async () => {
  var mypeerstore = await node.peerStore.all();
  //console.log(mypeerstore.length);
  //console.log(JSON.stringify(node, replacerFunc(), 2));
}, 1000);

async function init() {
  // Read the peerId.json file
  var mypeerId = JSON.parse(fs.readFileSync("./peer1Id.json", 'utf8'));
  var id = await createFromJSON(mypeerId);

  const bootstrapers = [
    '/ip4/127.0.0.1/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU',
  ]

  node = await createLibp2p( {
    peerId: id,
    transports: [
      new WebSockets(),
      new TCP()
    ],
    connectionEncryption: [new Noise()],
    streamMuxers: [new Mplex()],
    dht: new KadDHT(),
    //pubsub: new GossipSub(),
    // addresses: {
    //   listen: [
    //     '/ip4/0.0.0.0/tcp/0',
    //   ],
    // },
    connectionManager: {
      //dialTimeout: 1000000,
      autoDial: true
    },
    // peerDiscovery: [
    //   new Bootstrap({
    //     list: bootstrapers
    //   })
    // ],
    relay: {
      enabled: true,
      autoRelay: {
        enabled: true,
        maxListeners: 10
      }
    }
  }) // END libp2p.create

  // Start the node
  await node.start();

  // Add event listener
  node.addEventListener("peer:discovery", async (evt) => {
    const peer = evt.detail
    //console.log(peer);
    console.log(`Discovered: ${peer.id.toString()}`)
    //await node.dial("/ip4/127.0.0.1/tcp/15002/ws/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU");
  });

  node.connectionManager.addEventListener("peer:connect", (evt) => {
    const peer = evt.detail
    console.log("Connected: " + peer.remotePeer.toString())
  });

  node.connectionManager.addEventListener("peer:disconnect", (evt) => {
    const peer = evt.detail
    console.log("Disconnected: " + peer.remotePeer.toString())
  });

  // node.peerStore.addEventListener('peer', evt => {
  //     console.log("peers");
  // });

  await node.dial("/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU");

  console.log(node.peerId.toString());
}

init();
