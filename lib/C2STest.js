/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");
var Connection = require("./Connection.js");
var ControlConnection = require("./ControlConnection.js");
var NDTTest = require("./NDTTest.js");
var MessageReceivers = require("./MessageReceivers.js");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);

function C2STest(ndt) {
  this.ndt = ndt;
}

C2STest.prototype = new NDTTest.NDTTest();
C2STest.prototype.constructor = C2STest;
C2STest.prototype.toString = function () {
  return "C2S Test.";
}
C2STest.prototype.runTest = function () {
  var testTransport;
  var testConnection;
  var testInputStream, testOutputStream;
  var testPrepareMsg, testMessageMsg;

  var portString = "";
  var port = 0;

  /*
   * receive a TEST_PREPARE message.
   */
  testPrepareMsg=MessageReceivers.receiveTestPrepare(this.ndt.getInputStream());
  if (testPrepareMsg.value === "0") {
    /*
     * error.
     */
    return -1;
  }
  portString = testPrepareMsg.value;
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
  if (MessageReceivers.receiveTestStart(this.ndt.getInputStream()) == -1) {
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

  testMessageMsg = MessageReceivers.receiveTestMsg(this.ndt.getInputStream());
  console.error("throughput: " + testMessageMsg.value);

  /*
   * receive TEST_FINALIZE message.
   */
  MessageReceivers.receiveTestFinalize(this.ndt.getInputStream());

  testConnection.flush();
  testTransport.close(1);
}

exports.C2STest = C2STest;
