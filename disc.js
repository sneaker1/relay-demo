import {peerIdFromString} from "@libp2p/peer-id";
import {pipe} from "it-pipe";
import toBuffer from 'it-to-buffer';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import variables from "./misc/variables.js"

/////////////
// HANDLER //
/////////////
async function handler({connection, stream, protocol}, node) {
  console.log("handler");
  //console.log(stream);
  // for await (const msg1 of stream.source) {
  //   var msgJSON = JSON.parse(uint8ArrayToString(msg1));
  // }
  const result = await pipe(
      stream,
      async function * (source) {
        for await (const list of source) {
          yield list.subarray()
        }
      },
      toBuffer
  )
  console.log("debug");
  //console.log(result.toString())
  console.log(uint8ArrayToString(result))
  var msgJSON = JSON.parse(uint8ArrayToString(result));
  if(!msgJSON) {
    return
  }

  ///////////////////////////////
  // ANSWER REQUEST FOR getPeers //
  ///////////////////////////////
  if(msgJSON.request == "getPeers") {
    console.log("answering getPeers");
    var mypeerstore = await node.peerStore.all();
    var peers = [];
    for(var i=0; i<mypeerstore.length; i++) {
      peers.push(mypeerstore[i].id.toString());
    }
    var returnObj = {
      answer: variables.connectedPeers
    }
    //var answer = uint8ArrayFromString(JSON.stringify(returnObj));
    var answer = JSON.stringify(returnObj);
    await pipe(
      [answer].map(str => uint8ArrayFromString(str)),
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
  //try {
    var stream = await _node.dialProtocol(mypeerid, "/disc");
    var message = {
      request: "getPeers"
    }
    //var msgString = uint8ArrayFromString(JSON.stringify(message));
    var msgString = JSON.stringify(message);
    console.log("get peers debug");
    await pipe(
      [msgString].map(str => uint8ArrayFromString(str)),
      stream
    )
    console.log("getpeersdebug2");
    //for await (const msg of stream.source) {
    //  var msgText = JSON.parse(uint8ArrayToString(msg));
    //}
    //var answer = msgText;
    const result = await pipe(
        stream,
        async function * (source) {
          for await (const list of source) {
            yield list.subarray()
          }
        },
        toBuffer
    )
    console.log("debug");
    //console.log(result.toString())
    var answer = JSON.parse(uint8ArrayToString(result));
    return answer;
  //}
  // catch(err) {
  //   var answer = {error: err.code};
  //   return answer;
  // }
}

export default {
  handler,
  getPeers
}
