import {createLibp2p} from "libp2p";
import {WebSockets} from "@libp2p/websockets";
import {TCP} from "@libp2p/tcp";
import { Noise } from "@chainsafe/libp2p-noise";
import {Mplex} from "@libp2p/mplex";
import {KadDHT} from "@libp2p/kad-dht";
import {Bootstrap} from "@libp2p/bootstrap";
import {PubSubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import {createRSAPeerId, createEd25519PeerId, createSecp256k1PeerId, createFromJSON, exportToProtobuf} from "@libp2p/peer-id-factory";
import fs from "fs";
import disc from "./disc.js";
import onConnect from "./handler/onConnect.js"
import variables from "./misc/variables.js"

// VARIABLES
var node = {};
var connectedPeers = [];

setInterval(async () => {
  var mypeerstore = await node.peerStore.all();
  console.log("Peers: " + variables.connectedPeers.length);
  for(var i=0; i<mypeerstore.length; i++) {
    for(var j=0; j<mypeerstore[i].addresses.length; j++) {
      //console.log(mypeerstore[i].id.toString() + ": " + mypeerstore[i].addresses[j].multiaddr);
    }
  }
}, 10000);

async function init() {
  // Read the peerId.json file
  var mypeerId = JSON.parse(fs.readFileSync("./peer2Id.json", 'utf8'));
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
    pubsub: new GossipSub(),
    addresses: {
    //    listen: [
    //      '/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit',
    //    ],
      //announce: ["/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit/p2p/QmYihrGbk611GCs19qMx5fBUveSHLubcV51U6642NdiZ6i"]
    },
    connectionManager: {
      //dialTimeout: 1000000,
      autoDial: true
    },
    peerDiscovery: [
    //   new Bootstrap({
    //     list: bootstrapers
    //   })
      new PubSubPeerDiscovery({
        interval: 1000
      })
    ],
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

  console.log("Node ID: " + node.peerId.toString());

  // Add event listener
  node.addEventListener("peer:discovery", async (evt) => {
    const peer = evt.detail
    console.log(`Discovered: ${peer.id.toString()}`)
    //await node.dial("/ip4/127.0.0.1/tcp/15002/ws/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU");
  });

  //node.connectionManager.addEventListener("peer:connect", async (evt) => {onConnect.onConnect(evt, node)});
  node.connectionManager.addEventListener("peer:connect", async (evt) => {
    const peer = evt.detail;
    console.log("Connected: " + peer.remotePeer.toString());
  });

  node.connectionManager.addEventListener("peer:disconnect", (evt) => {
    const peer = evt.detail
    console.log("Disconnected: " + peer.remotePeer.toString())
    var index = variables.connectedPeers.indexOf(peer.remotePeer.toString());
    variables.connectedPeers.splice(index, 1);
  });

  // Add protocol handler
  await node.handle("/disc", async ({connection, stream, protocol}) => {disc.handler({connection, stream, protocol}, node)});

  //await node.dial("/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU");
   await node.dial("/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit/p2p/QmcqgSkk4ohdifycnZYScNLyHohmAtFeiPCtv5GrbMyvk6")
  // console.log("debug3");

  // console.log("debug1");
  // await node.dial("/ip4/127.0.0.1/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU");
  // console.log("debug2");
  // await node.dial("/ip4/127.0.0.1/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit/p2p/QmcqgSkk4ohdifycnZYScNLyHohmAtFeiPCtv5GrbMyvk6")
  // console.log("debug3");


}

init();
