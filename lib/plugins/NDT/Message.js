/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var MessageUtils = require("./MessageUtils.js");

/**
 * NDT Protocol Message.
 *
 * @constructor
 * @param {number} type Message type.
 */
function Message(type) {
  this.type = type;
}

/**
 * Stringify a message.
 *
 * @returns {String} Message type plus value
 * as a string.
 */
Message.prototype.toString = function () {
  return "type: " + this.type + "\n" + "value: " + this.value;
}

/**
 * Write the message type to a stream.
 *
 * @param {nsIOutputStream} stream The stream to
 * write to.
 */
Message.prototype.writeType = function (stream) {
  stream.write8(this.type);
}

/**
 * Write a message to a stream.
 *
 * @param {nsIOutputStream} stream The stream to 
 * write to.
 */
Message.prototype.write = function (stream) {
  var length = this.value.length;
  this.writeType(stream);
  stream.write16(length);
  stream.writeBytes(this.value, length);
}

/**
 * Parse raw bytes into a Message.
 *
 * @abstract
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
Message.prototype.parseBytes = function (b) {
}
exports.Message = Message;

/**
 * An NDT login message.
 * @extends Message
 * @constructor
 *
 * @param {number[]} tests The tests to include 
 * in the login message.
 */
function LoginMessage(tests) {
  Message.prototype.constructor.call(this, Constants.Messages.MSG_LOGIN);
  this.tests = tests;
}
LoginMessage.prototype = new Message();
LoginMessage.prototype.constructor = LoginMessage;

/**
 * Write a login message to a stream.
 *
 * @param {nsIOutputStream} stream The stream to 
 * write to.
 */
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

/**
 * An NDT test suite message.
 * @extends Message
 * @constructor
 *
 */
function TestSuiteMessage() {
}
TestSuiteMessage.prototype = new Message();
TestSuiteMessage.prototype.constructor = TestSuiteMessage;

/**
 * Parse raw bytes into a test suite message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
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

/**
 * An NDT server version message.
 * @extends Message
 * @constructor
 *
 */
function ServerVersionMessage() {
}
ServerVersionMessage.prototype = new Message();
ServerVersionMessage.prototype.constructor = ServerVersionMessage;

/**
 * Parse raw bytes into a server version message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
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

/**
 * An NDT kickoff message.
 * @extends Message
 * @constructor
 *
 */
function KickoffMessage() {
}
KickoffMessage.prototype = new Message();
KickoffMessage.prototype.constructor = KickoffMessage;

/**
 * Parse raw bytes into a kickoff message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
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

/**
 * An NDT server queue message.
 * @extends Message
 * @constructor
 *
 */
function SrvQMessage() {
}
SrvQMessage.prototype = new Message();
SrvQMessage.prototype.constructor = SrvQMessage;

/**
 * Parse raw bytes into a server queue message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
SrvQMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }
  if (this.type != Constants.Messages.SRV_QUEUE) {
    console.error("Incorrect message type!");
    return -1;
  }

  if (this.value.length != 0 && !this.value.match("^[0-9]+$")) {
    console.error("Not a number:" + this.value + "-");
    return -1;
  }
  return 1;
}
exports.SrvQMessage = SrvQMessage;

/**
 * An NDT results retrieval message.
 * @extends Message
 * @constructor
 *
 */
function ResultsRetrievalMessage() {
}
ResultsRetrievalMessage.prototype = new Message();
ResultsRetrievalMessage.prototype.constructor = ResultsRetrievalMessage;

/**
 * Parse raw bytes into a results retrieval message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
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

/**
 * An NDT test prepare message.
 * @extends Message
 * @constructor
 *
 */
function TestPrepareMessage() {
}
TestPrepareMessage.prototype = new Message();
TestPrepareMessage.prototype.constructor = TestPrepareMessage;

/**
 * Parse raw bytes into a test prepare message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
TestPrepareMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.TEST_PREPARE) {
    console.error("Incorrect message type!");
    return -1;
  }

  if (this.value.length != 0 && !this.value.match("^[0-9]+$")) {
    console.error("Not a number:" + this.value + "-");
    return -1;
  }

  return 1;
}
exports.TestPrepareMessage = TestPrepareMessage;

/**
 * An NDT test finalize message.
 * @extends Message
 * @constructor
 *
 */
function TestFinalizeMessage() {
}
TestFinalizeMessage.prototype = new Message();
TestFinalizeMessage.prototype.constructor = TestFinalizeMessage;

/**
 * Parse raw bytes into a finalize message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
TestFinalizeMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.TEST_FINALIZE) {
    console.error("Incorrect message type!");
    return -1;
  }
  /*
   * TODO: Check that the value is empty!
   */
  return 1;
}
exports.TestFinalizeMessage = TestFinalizeMessage;

/**
 * An NDT test start message.
 * @extends Message
 * @constructor
 *
 */
function TestStartMessage() {
}
TestStartMessage.prototype = new Message();
TestStartMessage.prototype.constructor = TestStartMessage;

/**
 * Parse raw bytes into a test start message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
TestStartMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.TEST_START) {
    console.error("Incorrect message type!");
    return -1;
  }
  /*
   * TODO: Check that the value is empty!
   */
  return 1;
}
exports.TestStartMessage = TestStartMessage;

/**
 * An NDT test message message.
 * @extends Message
 * @constructor
 *
 */
function TestMsgMessage() {
  Message.prototype.constructor.call(this, Constants.Messages.TEST_MSG);
}
TestMsgMessage.prototype = new Message();
TestMsgMessage.prototype.constructor = TestMsgMessage

/**
 * Parse raw bytes into a test message message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
TestMsgMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.TEST_MSG) {
    console.error("Incorrect message type!");
    return -1;
  }
/*
  There is no consistent meaning for the value
  of a Test Msg message. So, this test is meaningless.

  if (this.value.length != 0 && !this.value.match("^([0-9]+(\.[0-9]+)* *)$")) {
    console.error("Not a float number:" + this.value + "-");
    return -1;
  }
*/
  return 1;
}
exports.TestMsgMessage = TestMsgMessage;

/**
 * An NDT results message.
 * @extends Message
 * @constructor
 *
 */
function ResultsMessage() {
  Message.prototype.constructor.call(this, Constants.Messages.MSG_RESULTS);
}
ResultsMessage.prototype = new Message();
ResultsMessage.prototype.constructor = ResultsMessage;

/**
 * Parse raw bytes into a results message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
ResultsMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.MSG_RESULTS) {
    console.error("Incorrect message type!");
    return -1;
  }
  return 1;
}
exports.ResultsMessage = ResultsMessage;

/**
 * An NDT logout message.
 * @extends Message
 * @constructor
 *
 */
function LogoutMessage() {
  Message.prototype.constructor.call(this, Constants.Messages.MSG_LOGOUT);
}
LogoutMessage.prototype = new Message();
LogoutMessage.prototype.constructor = LogoutMessage;

/**
 * Parse raw bytes into a logout message.
 *
 * @param {byte[]} b The raw bytes to parse.
 * @returns {number} -1 if the parse failed; 1 if
 * it succeeded.
 */
LogoutMessage.prototype.parseBytes = function (b) {
  if (MessageUtils.genericParseTLString.call(this, b) == -1) {
    return -1;
  }

  if (this.type != Constants.Messages.MSG_LOGOUT) {
    console.error("Incorrect message type!");
    return -1;
  }
  return 1;
}
exports.LogoutMessage = LogoutMessage;
