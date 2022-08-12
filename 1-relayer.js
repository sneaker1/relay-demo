import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {TCP} from "@libp2p/tcp";
import { Noise } from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {Bootstrap} from "@libp2p/bootstrap";
import {createRSAPeerId, createEd25519PeerId, createSecp256k1PeerId, createFromJSON, exportToProtobuf} from "@libp2p/peer-id-factory";
import fs from "fs";
import { EventEmitter, CustomEvent } from '@libp2p/interfaces/events'

// VARIABLES
var node = {};
var test = "test"

// FUNCTIONS
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
  for(var i=0; i<mypeerstore.length; i++) {
    for(var j=0; j<mypeerstore[i].addresses.length; j++) {
      console.log(mypeerstore[i].id.toString() + ": " + mypeerstore[i].addresses[j].multiaddr);
    }
  }
  //console.log(mypeerstore);
}, 5000);

async function init() {
  // Read the peerId.json file
  var mypeerId = JSON.parse(fs.readFileSync("./relayerId.json", 'utf8'));
  var id = await createFromJSON(mypeerId);

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
    addresses: {
      listen: [
        //'/ip4/89.58.0.139/tcp/15002',
        "/ip4/0.0.0.0/tcp/15002"
      ],
      //announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
      //announce: ['/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU']
    },
    //peerDiscovery: [
      // new Bootstrap({
      //   //list: bootstrapers
      // })
    //],
    connectionManager: {
      //dialTimeout: 1000000,
      autoDial: true
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true,
        maxListeners: 10
      },
      autoRelay: {
        enabled: true,
        maxListeners: 10
      },
      advertise: {
        enabled: true,
      },
    }
  }) // END libp2p.create

  // Start the node
  await node.start();

  // Add event listener
  node.addEventListener("peer:discovery", (evt) => {
    const peer = evt.detail
    console.log("Discovered: " + peer.id);
  });

  node.connectionManager.addEventListener("peer:connect", (evt) => {
    const peer = evt.detail
    console.log("Connected: " + peer.remotePeer.toString());
    //node.peerStore.dispatchEvent(new CustomEvent<PeerInfo>('peer', { detail: peer.remotePeer.toString() }))
    //node.onDiscoveryPeer(evt);
  });

  node.connectionManager.addEventListener("peer:disconnect", (evt) => {
    const peer = evt.detail
    console.log("Disconnected: " + peer.remotePeer.toString());
  });

  // node.peerStore.addEventListener('peer', evt => {
  //     console.log("peers");
  // });

  //console.log(node.components.getTransportManager().transports);

  console.log(`Node started with id ${node.peerId.toString()}`)
  console.log('Listening on:')
  //node.multiaddrs.forEach((ma) => console.log(`${ma.toString()}/p2p/${node.peerId.toString()}`))
}

init();
