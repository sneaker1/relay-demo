import variables from "../misc/variables.js"
import disc from "../disc.js";

async function onConnect(evt, node) {
  const conn = evt.detail
  console.log("Connected: " + conn.remotePeer.toString())
  variables.connectedPeers.push(conn.remotePeer.toString());
  var peerInfo = await node.peerStore.get(conn.remotePeer);
  var answer = await disc.getPeers(node, conn.remotePeer.toString());
  //console.log(answer);
  for(var i=0; i<answer.answer.length; i++) {
    if(answer.answer[i] !== node.peerId.toString()) {
      //console.log("Dialing: " + answer.answer[i]);
      await node.dial("/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit/p2p/" + answer.answer[i]);
    }
  }
}

export default {
  onConnect
}
