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

var NDTProtocolStates = {}
NDTProtocolStates.kickoff = 1;
NDTProtocolStates.login = 2;
NDTProtocolStates.queue = 3;
NDTProtocolStates.version = 4;
NDTProtocolStates.suite = 5;
NDTProtocolStates.tests = 6;
NDTProtocolStates.tests_running = 7;
NDTProtocolStates.results = 8;

NDT.prototype.init = function (params) {
  this.serverName = params[0];
  this.serverPort = params[1];
  this.state = NDTProtocolStates.kickoff;
}

NDT.prototype.open = function () {
  this.controlTransport = socketTransportService.createTransport(null, 
    0, 
    this.serverName, 
    this.serverPort, 
    null);
  this.controlTransport.setEventSink(this, mainThread);
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
}

NDT.prototype.nextTest = function () {
  console.error("nextTest()");
  if (this.test >= this.serverTests.length) {
    this.state = NDTProtocolStates.results;
    this.controlTransport.setEventSink(this, mainThread);
//    this.onTransportStatus(this.controlTransport, Ci.nsISocketTransport.STATUS_RECEIVING_FROM, 0, 0);
    return;
  }

  var testInt = this.serverTests[this.test];
  var testConstructor = Constants.TestsMap[testInt];
  var test = new testConstructor(this, mainThread);

  console.error("Running " + test.toString());
  this.test++;
  test.runTest();
  console.error("Started to run " + test.toString());
}
NDT.prototype.onTransportStatus = function(transport,status,progress,progressMax) {
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    if (this.state == NDTProtocolStates.kickoff) {
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

      this.state = NDTProtocolStates.login;

      /*
       * send login message and
       * check for SRV_QUEUE response.
       */
      var svqMessage;
      var b;
      var loginMsg = new Message.LoginMessage([
        Constants.Tests.TEST_C2S,
        Constants.Tests.TEST_S2C,
        Constants.Tests.TEST_META,
        ]);

      loginMsg.write(this.getOutputStream());

      this.state = NDTProtocolStates.queue;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == NDTProtocolStates.queue) {
      b = MessageUtils.readRawBytesTlv(this.getInputStream());
      svqMessage = new Message.SrvQMessage();
      if (svqMessage.parseBytes(b) == -1) {
        success = -1;
      } else {
        console.error("Server queue: " + svqMessage.value);
      }

      this.state = NDTProtocolStates.version;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == NDTProtocolStates.version) {
      /*
       * check for server version message.
       */
      console.error("Reading version."); 
      var b;
      var svMessage = new Message.ServerVersionMessage();

      b = MessageUtils.readRawBytesTlv(this.getInputStream());

      if (svMessage.parseBytes(b) == -1) {
        success = -1;
      } else {
        console.error("Server version: " + svMessage.value);
      }
      console.error("Done reading version."); 

      this.state = NDTProtocolStates.suite;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == NDTProtocolStates.suite) {
      /*
       * check for test suite message.
       */
      var tsMessage = null;
      var b;
      tsMessage = new Message.TestSuiteMessage();

      b = MessageUtils.readRawBytesTlv(this.getInputStream());
      if (tsMessage.parseBytes(b) == -1) {
        success = -1;
      } else {
        console.error("Server test suite: " + tsMessage.value);
      }

      this.state = NDTProtocolStates.tests;

      this.test = 0;
      this.serverTests = tsMessage.value.split(" ");
      /*
       * sometimes the first string is a ' '.
       * we have to handle that.
       */
      if (this.serverTests[0] == "") {
        this.serverTests = this.serverTests.slice(1);
      }
      this.controlTransport.setEventSink(null, null);
      this.nextTest();

      this.states = NDTProtocolStates.tests_running;
    }

    if (this.state == NDTProtocolStates.results) {
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

      this.state++;
      if (!this.getInputStream().available()) return;
    }
  } else {
    console.error("status: " + status.toString());
  }
  return success;
}

exports.NDT = NDT;
exports.Test = NDT;
