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

function MetaTest(ndt, ioThread) {
  this.ndt = ndt;
  this.ioThread = ioThread;
}

var MetaTestStates = {};
MetaTestStates.prepare = 1;
MetaTestStates.start = 2;
MetaTestStates.finalize = 3;

MetaTest.prototype = new NDTTest.NDTTest();
MetaTest.prototype.constructor = MetaTest;
MetaTest.prototype.toString = function () {
  return "Meta Test.";
}

MetaTest.prototype.runTest = function (results) {
  this.state = MetaTestStates.prepare;
  this.results = results;
  this.results[this.toString()] = {};
  this.ndt.setControlTransportSink(this);
}

MetaTest.prototype.onTransportStatus = function(transport,status,progress,progressMax) {
  console.error("MetaTest state: " + this.state);
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    if (this.state == MetaTestStates.prepare) {
      if (MessageReceivers.receiveTestPrepare(this.ndt.getInputStream())==-1) {
        return -1;
      }
      this.state = MetaTestStates.start;
      if (!this.ndt.getInputStream().available()) return;
    }

    if (this.state == MetaTestStates.start) { 
      if (MessageReceivers.receiveTestStart(this.ndt.getInputStream()) == -1) {
        return -1;
      }
      
      var clientNameMsg, clientVersionMsg;
      var testMessageMsg;

      clientNameMsg = new Message.TestMsgMessage();
      clientNameMsg.value = "client.application:Firefox Ext";
      clientNameMsg.write(this.ndt.getOutputStream());

      clientVersionMsg = new Message.TestMsgMessage();
      clientVersionMsg.value = "client.version:1.0.0.0";
      clientVersionMsg.write(this.ndt.getOutputStream());

      emptyTestMsg = new Message.TestMsgMessage();
      emptyTestMsg.value = "";
      emptyTestMsg.write(this.ndt.getOutputStream());

      this.state = MetaTestStates.finalize;
      if (!this.ndt.getInputStream().available()) return;
    }
  
    if (this.state == MetaTestStates.finalize) {
      if (MessageReceivers.receiveTestFinalize(this.ndt.getInputStream())==-1) {
        return -1;
      }
      this.ndt.controlTransport.setEventSink(null, null);
      this.state++;
      this.results[this.toString()]["pass"] = "1";
      this.ndt.nextTest();
    }
  }
}

exports.MetaTest = MetaTest;
