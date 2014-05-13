/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");
var Connection = require("./Connection.js");
var ControlConnection = require("./ControlConnection.js");
var NDTTest = require("./NDTTest.js");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);

function C2STest(ndt) {
  this.ndt = ndt;
}

function receiveTestPrepare(stream) {
  var tstPrepareMsg = new Message.TestPrepareMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstPrepareMsg.parseBytes(b) != 1) {
    return "0";
  }
  return tstPrepareMsg.value;
}

function receiveTestStart(stream) {
  var tstStartMsg = new Message.TestStartMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstStartMsg.parseBytes(b) != 1) {
    return -1;
  }
  return 1;
}

function receiveTestMsg(stream) {
  var tstMsgMsg = new Message.TestMsgMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstMsgMsg.parseBytes(b) == -1) {
    return "0";
  }
  return tstMsgMsg.value;
}

function receiveTestFinalize(stream) {
  var tstFinalizeMsg = new Message.TestFinalizeMessage();
  var b = MessageUtils.readRawBytesTlv(stream);

  if (tstFinalizeMsg.parseBytes(b) == -1) {
    return -1;
  }
  return 1;
}


C2STest.prototype = new NDTTest.NDTTest();
C2STest.prototype.constructor = C2STest;
C2STest.prototype.runTest = function () {
  var testTransport;
  var testConnection;
  var testInputStream, testOutputStream;

  var portString = "";
  var port = 0;

  /*
   * receive a TEST_PREPARE message.
   */
  portString = receiveTestPrepare(this.ndt.getInputStream());

  if (portString === "0") { 
    /*
     * error.
     */
    return -1;
  }
  console.error("we will attempt to connect to: " + portString);
  port = parseInt(portString, 10);

  /*
   * connect to the port.
   */

  testTransport = socketTransportService.createTransport(null, 
    0, 
    this.ndt.getServerName(), 
    port,
    null);
  testConnection = new Connection.Connection(testTransport);
  testConnection.connect();

  /*
   * receive a TEST_START message.
   */
  if (receiveTestStart(this.ndt.getInputStream()) == -1) {
    /* 
     * error.
     */
  }

  var bufferView = new Uint8Array(new ArrayBuffer(8192));
  for (i in MessageUtils.range(0, 8192)) {
    bufferView[i] = "x".charCodeAt(0);
  }

  console.error("Starting the c2s test.");
  /*
   * send 10s of data in 8k buffer
   * blasts.
   */
  var start = Date.now();
  var current = Date.now();
  while ((current - start) < 10000) {
    testConnection.boutput.writeByteArray(bufferView, 8192);
    testConnection.flush();
    current = Date.now();
  }
  console.error("test lasted " + (current - start) + " ms");

  /*
   * receive TEST_MSG with calculated 
   * throughput.
   */
  var throughput = receiveTestMsg(this.ndt.getInputStream());

  /*
   * receive TEST_FINALIZE message.
   */
  receiveTestFinalize(this.ndt.getInputStream());

  testConnection.flush();
  testTransport.close(1);
}

exports.C2STest = C2STest;
