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

function MetaTest(ndt) {
  this.ndt = ndt;
}

MetaTest.prototype = new NDTTest.NDTTest();
MetaTest.prototype.constructor = MetaTest;
MetaTest.prototype.runTest = function () {
  var clientNameMsg, clientVersionMsg;
  var testMessageMsg;

  if (MessageReceivers.receiveTestPrepare(this.ndt.getInputStream()) == -1) {
    return -1;
  }
 
  if (MessageReceivers.receiveTestStart(this.ndt.getInputStream()) == -1) {
    return -1;
  }
  
  clientNameMsg = new Message.TestMsgMessage();
  clientNameMsg.value = "client.application:Firefox Ext";
  clientNameMsg.write(this.ndt.getOutputStream());

  clientVersionMsg = new Message.TestMsgMessage();
  clientVersionMsg.value = "client.version:1.0.0.0";
  clientVersionMsg.write(this.ndt.getOutputStream());

  emptyTestMsg = new Message.TestMsgMessage();
  emptyTestMsg.value = "";
  emptyTestMsg.write(this.ndt.getOutputStream());

  if (MessageReceivers.receiveTestFinalize(this.ndt.getInputStream()) == -1) {
    return -1;
  }

  return 1;
}

exports.MetaTest = MetaTest;
