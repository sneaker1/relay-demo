import variables from "../misc/variables.js"
import disc from "../disc.js";
import colors from "colors";

async function onConnect(evt, node) {
  const conn = evt.detail
  if(!variables.connectedPeers.includes(conn.remotePeer.toString())) {
    if(conn.stat.direction == "outbound") {
      console.log(("[OUTBOUND] ") .yellow + conn.remotePeer.toString())
    }
    else {
      console.log(("[INBOUND] ") .green + conn.remotePeer.toString())
    }
    variables.connectedPeers.push(conn.remotePeer.toString());
    var answer = await disc.getPeers(node, conn.remotePeer.toString());
    console.log("received answer:");
    console.log(answer);
    for(var i=0; i<answer.answer.length; i++) {
      if(answer.answer[i] !== node.peerId.toString()) {
        //console.log("Dialing: " + answer.answer[i]);
        await node.dial("/ip4/89.58.0.139/tcp/15002/p2p/QmSaT2NnWddF4e2WVWSPz22mp2dYXFnESF4vRqGuBB4SFU/p2p-circuit/p2p/" + answer.answer[i]);
      }
    }
  }
}

export default {
  onConnect
}
