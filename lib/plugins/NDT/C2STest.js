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

/**
 * A client-to-server NDT test.
 * @constructor
 * @extends NDTTest
 */
function C2STest(ndt, ioThread) {
  this.ndt = ndt;
  this.ioThread = ioThread;
  this.outputBuffer = new Uint8Array(new ArrayBuffer(8192));
  for (i in MessageUtils.range(0, 8192)) {
    this.outputBuffer[i] = "x".charCodeAt(0);
  }
}

C2STest.prototype = new NDTTest.NDTTest();
C2STest.prototype.constructor = C2STest;

/**
 * Return a string name for ourselves.
 */
C2STest.prototype.toString = function () {
  return "C2S Test.";
}

/**
 * Run the C2S test.
 * @param {dictionary} results The results object to stuff.
 */
C2STest.prototype.runTest = function (results) {
  console.error("We are here.");
  this.state = Constants.C2STestStates.prepare;
  this.results = results;
  this.results[this.toString()] = {};
  this.ndt.setControlTransportSink(this);
}

C2STest.prototype.onTransportStatus = function(transport,status,progress,progressMax) {
  console.error("C2STest state: " + this.state);
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    if (this.state == Constants.C2STestStates.prepare) {
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

      this.testTransport = socketTransportService.createTransport(null, 
        0, 
        this.ndt.getServerName(), 
        port,
        null);
      this.testConnection = new Connection.Connection(this.testTransport);
      this.testConnection.connect();

      this.state = Constants.C2STestStates.start;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == Constants.C2STestStates.start) {
      /*
       * receive a TEST_START message.
       */
      if (MessageReceivers.receiveTestStart(this.ndt.getInputStream()) == -1) {
        /* 
         * error.
         */
      }

      console.error("Starting the c2s test.");
      /*
       * send 10s of data in 8k buffer
       * blasts.
       */
      var start = Date.now();
      var current = Date.now();
      while ((current - start) < 10000) {
        this.testConnection.boutput.writeByteArray(this.outputBuffer, 8192);
        this.testConnection.flush();
        current = Date.now();
      }
      console.error("test lasted " + (current - start) + " ms");
        
      this.state = Constants.C2STestStates.msg;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == Constants.C2STestStates.msg) {
      /*
       * receive TEST_MSG with calculated 
       * throughput.
       */

      testMessageMsg = MessageReceivers.receiveTestMsg(this.ndt.getInputStream());
      console.error("throughput: " + testMessageMsg.value);
      this.results[this.toString()]["throughput"] = testMessageMsg.value;

      this.state = Constants.C2STestStates.finalize;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == Constants.C2STestStates.finalize) {
      /*
       * receive TEST_FINALIZE message.
       */
      MessageReceivers.receiveTestFinalize(this.ndt.getInputStream());

      this.testConnection.flush();
      this.testTransport.close(1);
      this.state++;
      this.ndt.controlTransport.setEventSink(null, null);
      this.ndt.nextTest();
    }
  }
}

exports.C2STest = C2STest;
