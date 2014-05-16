/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");
var Connection = require("./Connection.js");
var ControlConnection = require("./ControlConnection.js");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;

function NDT() {
  this.serverName = "";
  this.controlTransport = null;
  this.controlConnection = null;
}

NDT.prototype.init = function (params) {
  this.serverName = params[0];
  this.serverPort = params[1];
}

NDT.prototype.open = function () {
  this.controlTransport = socketTransportService.createTransport(null, 
    0, 
    this.serverName, 
    this.serverPort, 
    null);
  this.controlConnection = new ControlConnection.ControlConnection(
    this.controlTransport);

  this.controlConnection.connect();
}

NDT.prototype.close = function () {
  this.controlConnection.flush();
  this.controlTransport.close(1);
}

NDT.prototype.getServerName = function () {
  return this.serverName;
}

NDT.prototype.getServerPort = function () {
  return this.serverPort;
}

NDT.prototype.getInputStream = function () {
  return this.controlConnection.binput;
}

NDT.prototype.getOutputStream = function () {
  return this.controlConnection.boutput;
}

NDT.prototype.runTest = function () {
  var success = 1;

  this.open();
  /*
   * Check for kickoff message.
   */
  var koMessage = new Message.KickoffMessage();
  if (koMessage.parseBytes(
    MessageUtils.readRawBytes(this.getInputStream(),
    13))
    ) {
    if (!koMessage.isValidKickoffMessage()) {
      success = -1;
    }
  } else {
    success = -1;
  }

  console.error("Proper kickoff message.");

  /*
   * send login message and
   * check for SRV_QUEUE response.
   */
  if (success == 1) {
    var svqMessage;
    var b;
    var loginMsg = new Message.LoginMessage([
      Constants.Tests.TEST_C2S,
      Constants.Tests.TEST_S2C,
      Constants.Tests.TEST_META,
      ]);

    loginMsg.write(this.getOutputStream());

    b = MessageUtils.readRawBytesTlv(this.getInputStream());
    svqMessage = new Message.SrvQMessage();
    if (svqMessage.parseBytes(b) == -1) {
      success = -1;
    } else {
      console.error("Server queue: " + svqMessage.value);
    }
  }
  /*
   * check for server version message.
   */
  if (success == 1) {
    var b;
    var svMessage = new Message.ServerVersionMessage();

    b = MessageUtils.readRawBytesTlv(this.getInputStream());

    if (svMessage.parseBytes(b) == -1) {
      success = -1;
    } else {
      console.error("Server version: " + svMessage.value);
    }
  }
  /*
   * check for test suite message.
   */
  var tsMessage = null;
  if (success == 1) {
    var b;
    tsMessage = new Message.TestSuiteMessage();

    b = MessageUtils.readRawBytesTlv(this.getInputStream());
    if (tsMessage.parseBytes(b) == -1) {
      success = -1;
    } else {
      console.error("Server test suite: " + tsMessage.value);
    }
  }

  var serverTests = tsMessage.value.split(" ");
  for (i in serverTests) {
    if (serverTests[i].length == 0)
      continue;
    var testInt = parseInt(serverTests[i], 10);
    var testConstructor = Constants.TestsMap[testInt];
    console.error("Running " + testInt);
    var test = new testConstructor(this);
    console.error("Running " + test.toString());
    test.runTest();
    console.error("Done running " + test.toString());
  }

  while (true) {
    var resultsMsg = new Message.ResultsMessage();
    var logoutMsg = new Message.LogoutMessage();
    var rawbytes = MessageUtils.readRawBytesTlv(this.getInputStream());
    if (resultsMsg.parseBytes(rawbytes) != -1) {
      console.error("value: " + resultsMsg.value);
    } else if (logoutMsg.parseBytes(rawbytes) != -1) {
      console.error("Got a logout message -- quitting.");
      break;
    } else {
      console.error("Got a unknown message -- quitting.");
      break;
    }
  }
  return success;
}

exports.NDT = NDT;
exports.Test = NDT;
