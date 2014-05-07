/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var MessageUtils = require("./MessageUtils.js");

function Message(type) {
  this.type = type;
}

Message.prototype.toString = function () {
  return "type: " + this.type + "\n" + "value: " + this.value;
}

Message.prototype.writeType = function (stream) {
  stream.write8(this.type);
}

Message.prototype.write = function (stream) {
  var length = this.message.length;
  this.writeType(stream);
  stream.write16(length);
  stream.writeBytes(this.message, length);
}
exports.Message = Message;

function LoginMessage(tests) {
  Message.prototype.constructor.call(this, Constants.Messages.MSG_LOGIN);
  this.tests = tests;
}
LoginMessage.prototype = new Message();
LoginMessage.prototype.constructor = LoginMessage;
LoginMessage.prototype.write = function (stream) {
  var testsTotal = 0;
  var i = 0;
  Message.prototype.writeType.call(this, stream);
  stream.write16(1);
  for (i in this.tests) {
    testsTotal+=this.tests[i];
  }
  stream.write8(testsTotal);
}
exports.LoginMessage = LoginMessage;

function TestSuiteMessage() {
}
TestSuiteMessage.prototype = new Message();
TestSuiteMessage.prototype.constructor = TestSuiteMessage();
TestSuiteMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.MSG_LOGIN) {
    console.error("Incorrect message type!");
    return -1;
  }

  return 1;
}
exports.TestSuiteMessage = TestSuiteMessage;

function ServerVersionMessage() {
}
ServerVersionMessage.prototype = new Message();
ServerVersionMessage.prototype.constructor = ServerVersionMessage();
ServerVersionMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.MSG_LOGIN) {
    console.error("Incorrect message type!");
    return -1;
  }
  /*
   * check the response!
   */
  if (this.value.length <= 1 || this.value[0] != 'v') {
    return -1;
  }
  return 1;
}
exports.ServerVersionMessage = ServerVersionMessage;

function KickoffMessage() {
}
KickoffMessage.prototype = new Message();
KickoffMessage.prototype.constructor = KickoffMessage();
KickoffMessage.prototype.parseBytes = function (b) {
  var type, length, value;
  if (!b.BYTES_PER_ELEMENT || b.BYTES_PER_ELEMENT != 1) {
    console.error("Incorrect parameter type!");
    return -1;
  }
  if (b.length != 13) {
    console.error("Kickoff message is not 13 bytes.");
    return -1;
  }

  this.value = [
    String.fromCharCode(b[i]) for (i in MessageUtils.range(0, 13))
    ].join("");
  return 1;
}
KickoffMessage.prototype.isValidKickoffMessage = function () {
  if (this.value !== "123456 654321") {
    console.error("Kickoff message is not correct.");
    return -1;
  }
  return 1;
}
exports.KickoffMessage = KickoffMessage;

function SrvQMessage() {
}
SrvQMessage.prototype = new Message();
SrvQMessage.prototype.constructor = SrvQMessage();
SrvQMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }
  if (this.type != Constants.Messages.SRV_QUEUE) {
    console.error("Incorrect message type!");
    return -1;
  }

  if (!this.value.match("^[0-9]+$")) {
    console.error("Not a number:" + this.value + "-");
    return -1;
  }
  return 1;
}
exports.SrvQMessage = SrvQMessage;

function ResultsRetrievalMessage() {
}
ResultsRetrievalMessage.prototype = new Message();
ResultsRetrievalMessage.prototype.constructor = ResultsRetrievalMessage();
ResultsRetrievalMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.MSG_RESULTS) {
    console.error("Incorrect message type!");
    return -1;
  }
  return 1;
}
exports.ResultsRetrievalMessage = ResultsRetrievalMessage;
