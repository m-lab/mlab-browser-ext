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

function S2CTest(ndt) {
  this.ndt = ndt;
}

S2CTest.prototype = new NDTTest.NDTTest();
S2CTest.prototype.constructor = S2CTest;
S2CTest.prototype.toString = function () {
  return "S2C Test";
}
S2CTest.prototype.runTest = function () {
  var testTransport;
  var testConnection;
  var testInputStream, testOutputStream;
  var testPrepareMsg, testMessageMsg;
  var totalBytes = 0;
  var testCurrentTime, testStartTime; 
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

  console.error("Starting the s2c test.");
  
  testStartTime = Date.now();
  testCurrentTime = Date.now();
  while ((testCurrentTime - testStartTime) < 10000) {
    var bytesRead = testConnection.binput.readByteArray(8192);
    totalBytes += bytesRead.length;
    testCurrentTime = Date.now();
  }
  console.error("test lasted " + (testCurrentTime - testStartTime) + " ms");
  console.error("got " + totalBytes + " bytes");

  calculatedThroughput = 8 * (totalBytes / 1000.0 / (testCurrentTime - testStartTime));

  /*
   * receive TEST_MSG with calculated 
   * throughput.
   */

  testMessageMsg = MessageReceivers.receiveTestMsg(this.ndt.getInputStream());
  console.error("throughput: " + testMessageMsg.value);
  console.error("calculated throughput: " + calculatedThroughput);

  calculatedThroughputTestMsg = new Message.TestMsgMessage();
  calculatedThroughputTestMsg.value = calculatedThroughput.toString();
  calculatedThroughputTestMsg.write(this.ndt.getOutputStream());

  while (true) {
    var testMessageMsg = new Message.TestMsgMessage();
    var testFinalizeMsg = new Message.TestFinalizeMessage();
    var rawbytes = MessageUtils.readRawBytesTlv(this.ndt.getInputStream());
    if (testMessageMsg.parseBytes(rawbytes) != -1) {
      console.error("value: " + testMessageMsg.value);
    } else if (testFinalizeMsg.parseBytes(rawbytes) != -1) {
      console.error("Got a finalize message -- quitting.");
      break;
    } else {
      console.error("Got a unknown message -- quitting.");
      break;
    }
  }

  testConnection.flush();
  testTransport.close(1);
}

exports.S2CTest = S2CTest;
