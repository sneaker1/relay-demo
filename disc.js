import {peerIdFromString} from "@libp2p/peer-id";
import {pipe} from "it-pipe";
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/////////////
// HANDLER //
/////////////
async function handler({connection, stream, protocol}, node) {
  for await (const msg1 of stream.source) {
    var msgJSON = JSON.parse(uint8ArrayToString(msg1));
  }
  if(!msgJSON) {
    return
  }

  ///////////////////////////////
  // ANSWER REQUEST FOR getPeers //
  ///////////////////////////////
  if(msgJSON.request == "getPeers") {
    var mypeerstore = await node.peerStore.all();
    var peers = [];
    for(var i=0; i<mypeerstore.length; i++) {
      peers.push(mypeerstore[i].id.toString());
    }
    var returnObj = {
      answer: peers
    }
    var answer = uint8ArrayFromString(JSON.stringify(returnObj));
    pipe(
      [answer],
      stream.sink
    )
  } // END answer offers
  ///////////////////////////////
} // END handler


///////////////
// Functions //
///////////////
async function getPeers(_node, _nodeId) {
  var mypeerid = peerIdFromString(_nodeId);
  try {
    console.log("debug1")
    var {stream} = await _node.dialProtocol(mypeerid, ["/disc"]);
    console.log("debug2")
    var message = {
      request: "getPeers"
    }
    var msgString = uint8ArrayFromString(JSON.stringify(message));
    pipe(
      [msgString],
      stream
    )
    for await (const msg of stream.source) {
      var msgText = JSON.parse(uint8ArrayToString(msg));
    }
    var answer = msgText;
    return answer;
  }
  catch(err) {
    var answer = {error: err.code};
    return answer;
  }
}

export default {
  handler,
  getPeers
}
