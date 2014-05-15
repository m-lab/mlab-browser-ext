var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");

function receiveTestPrepare(stream) {
  var tstPrepareMsg = new Message.TestPrepareMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstPrepareMsg.parseBytes(b) != 1) {
    return -1;
  }
  return tstPrepareMsg;
}
exports.receiveTestPrepare = receiveTestPrepare;

function receiveTestStart(stream) {
  var tstStartMsg = new Message.TestStartMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstStartMsg.parseBytes(b) != 1) {
    return -1;
  }
  return tstStartMsg;
}
exports.receiveTestStart = receiveTestStart;

function receiveTestMsg(stream) {
  var tstMsgMsg = new Message.TestMsgMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstMsgMsg.parseBytes(b) == -1) {
    return -1;
  }
  return tstMsgMsg;
}
exports.receiveTestMsg = receiveTestMsg;

function receiveTestFinalize(stream) {
  var tstFinalizeMsg = new Message.TestFinalizeMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstFinalizeMsg.parseBytes(b) == -1) {
    return -1;
  }
  return tstFinalizeMsg;
}
exports.receiveTestFinalize = receiveTestFinalize;

