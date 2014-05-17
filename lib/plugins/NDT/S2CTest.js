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

function S2CTest(ndt, ioThread) {
  this.ndt = ndt;
  this.ioThread = ioThread;
}

var S2CTestStates = {};
S2CTestStates.prepare = 1;
S2CTestStates.start = 2;
S2CTestStates.msg = 3;
S2CTestStates.finalize = 4;

S2CTest.prototype = new NDTTest.NDTTest();
S2CTest.prototype.constructor = S2CTest;
S2CTest.prototype.toString = function () {
  return "S2C Test";
}
S2CTest.prototype.runTest = function () {
  this.state = S2CTestStates.prepare;
  this.ndt.controlTransport.setEventSink(this, this.ioThread);
  this.onTransportStatus(this.ndt.controlTransport, 
    Ci.nsISocketTransport.STATUS_RECEIVING_FROM,
    0, 0);
}

S2CTest.prototype.onTransportStatus = function(transport,status,progress,progressMax) {
  console.error("S2CTest state: " + this.state);
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    if (this.state == S2CTestStates.prepare) {
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

      this.testTransport = socketTransportService.createTransport(null, 
        0, 
        this.ndt.getServerName(), 
        port,
        null);
      this.testConnection = new Connection.Connection(this.testTransport);
      this.testConnection.connect();

      this.state = S2CTestStates.start;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == S2CTestStates.start) {
      /*
       * receive a TEST_START message.
       */
      var testInputStream, testOutputStream;
      var testPrepareMsg, testMessageMsg;
      var totalBytes = 0;
      var testCurrentTime, testStartTime; 

      if (MessageReceivers.receiveTestStart(this.ndt.getInputStream()) == -1) {
        /* 
         * error.
         */
      }

      console.error("Starting the s2c test.");
      
      testStartTime = Date.now();
      testCurrentTime = Date.now();
      while ((testCurrentTime - testStartTime) < 10000) {
        var bytesRead = this.testConnection.binput.readByteArray(8192);
        totalBytes += bytesRead.length;
        testCurrentTime = Date.now();
      }
      console.error("test lasted " + (testCurrentTime - testStartTime) + " ms");
      console.error("got " + totalBytes + " bytes");

      calculatedThroughput = 8 * totalBytes / 1000.0 / ((testCurrentTime - testStartTime) / 1000.0);

      this.state = S2CTestStates.msg;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == S2CTestStates.msg) {
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

      this.state = S2CTestStates.finalize;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == S2CTestStates.finalize) {
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
      this.testConnection.flush();
      this.testTransport.close(1);
      this.state++;
      this.ndt.controlTransport.setEventSink(null, null);
      this.ndt.nextTest();
    }
  }
}

exports.S2CTest = S2CTest;
