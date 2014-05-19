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
var Timers = require("sdk/timers");
var Plugin = require("../../plugin.js");

/**
 * An NDT test. 
 * @constructor
 * @extends Plugin
 */
function NDT() {
  this.serverName = "";
  this.controlTransport = null;
  this.controlConnection = null;
  this.results = {};
  this.runningTest = null;
  this.testTimeout = 0;
}

NDT.prototype = new Plugin.Plugin();
NDT.prototype.constructor = NDT;

/**
 * Initialize an NDT test.
 *
 * @param {array} params An array of parameters for the 
 * NDT test. The first (0) is the servername and the second 
 * (1) is the port.
 */
NDT.prototype.init = function (params) {
  this.serverName = params[0];
  this.serverPort = params[1];
  this.state = Constants.NDTProtocolStates.kickoff;
}

/**
 * Return a string.
 */
NDT.prototype.toString = function () {
  return "NDT";
}

/**
 * Open the necessary connections to the 
 * NDT server.
 */
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

/**
 * Run the NDT test.
 *
 * @param {Done} done The way to alert the caller
 * that the test is done.
 */
NDT.prototype.runTest = function (done) {
  this.done = done;
  this.open();
}

/**
 * Close the connection to the server.
 */
NDT.prototype.close = function () {
  this.controlConnection.flush();
  this.controlTransport.close(1);
}

/**
 * Get the NDT server name.
 */
NDT.prototype.getServerName = function () {
  return this.serverName;
}

/**
 * Get the NDT server name.
 */
NDT.prototype.getServerPort = function () {
  return this.serverPort;
}

/**
 * Get the input stream for the NDT 
 * control connection.
 */
NDT.prototype.getInputStream = function () {
  return this.controlConnection.binput;
}

/**
 * Get the output stream for the NDT 
 * control connection.
 */
NDT.prototype.getOutputStream = function () {
  return this.controlConnection.boutput;
}

/**
 * Set the sink object for i/o events on the 
 * control connection.
 *
 * @param {nsITransportEventSink} sink The sink object.
 */
NDT.prototype.setControlTransportSink = function (sink) {
  this.controlTransport.setEventSink(sink, mainThread);
  if (this.controlConnection.binput.available()) {
    sink.onTransportStatus(this.controlTransport, 
      Ci.nsISocketTransport.STATUS_RECEIVING_FROM,
      0, 0);
  }
}

/**
 * Cancel a running NDT test.
 *
 * @param {NDT} state The NDT test to cancel.
 */
NDT.prototype.cancelRunningTest = function (state) {
  console.error("" + state.runningTest.toString() + " timed out.");
  state.testTimeout = 0;

  state.controlTransport.setEventSink(null, null);
  state.runningTest.cancel();
  state.runningTest = null;
  state.controlTransport.close(1);

  state.done.done(state.results);
}

/**
 * Start running the next test.
 *
 */
NDT.prototype.nextTest = function () {
  console.error("nextTest()");
  /*
   * Cancel existing timeouts.
   */
  if (this.testTimeout != 0) {
    Timers.clearTimeout(this.testTimeout);
    this.testTimeout = 0;
  }

  if (this.test >= this.serverTests.length) {
    this.state = Constants.NDTProtocolStates.results;
    this.setControlTransportSink(this);
    return;
  }


  var testInt = this.serverTests[this.test];
  var testConstructor = Constants.TestsMap[testInt];
  this.runningTest = new testConstructor(this, mainThread);

  console.error("Running " + this.runningTest.toString());
  this.test++;
  this.testTimeout = Timers.setTimeout(this.cancelRunningTest, 
    Constants.NDTProtocolConstants.TEST_TIMEOUT, 
    this);
  this.runningTest.runTest(this.results);
  console.error("Started to run " + test.toString());
}

/**
 * Handle i/o events on the control socket.
 * See {@link https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsITransportEventSink MDN} for information.
 *
 * @param {nsITransport} transport
 * @param {nsresult} status
 * @param {long long} progress
 * @param {long long} progressMax
 */
NDT.prototype.onTransportStatus = function(transport,status,progress,progressMax) {
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    if (this.state == Constants.NDTProtocolStates.kickoff) {
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

      this.state = Constants.NDTProtocolStates.login;

      /*
       * send login message and
       * check for SRV_QUEUE response.
       */
      var loginMsg = new Message.LoginMessage([
        Constants.Tests.TEST_C2S,
        Constants.Tests.TEST_S2C,
        Constants.Tests.TEST_META,
        ]);

      loginMsg.write(this.getOutputStream());

      this.state = Constants.NDTProtocolStates.queue;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == Constants.NDTProtocolStates.queue) {
      var b = MessageUtils.readRawBytesTlv(this.getInputStream());
      var svqMessage = new Message.SrvQMessage();
      if (svqMessage.parseBytes(b) == -1) {
        success = -1;
      } else {
        console.error("Server queue: " + svqMessage.value);
      }

      this.state = Constants.NDTProtocolStates.version;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == Constants.NDTProtocolStates.version) {
      /*
       * check for server version message.
       */
      console.error("Reading version."); 
      var b;
      var svMessage;

      svMessage = new Message.ServerVersionMessage();
      b = MessageUtils.readRawBytesTlv(this.getInputStream());

      if (svMessage.parseBytes(b) == -1) {
        success = -1;
      } else {
        console.error("Server version: " + svMessage.value);
      }
      console.error("Done reading version."); 

      this.state = Constants.NDTProtocolStates.suite;
      if (!this.getInputStream().available()) return;
    }

    if (this.state == Constants.NDTProtocolStates.suite) {
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

      this.state = Constants.NDTProtocolStates.tests;

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
      this.states = Constants.NDTProtocolStates.tests_running;

      this.nextTest();
    }

    if (this.state == Constants.NDTProtocolStates.results) {
      this.results["results"] = {};
      while (true) {
        var resultsMsg = new Message.ResultsMessage();
        var logoutMsg = new Message.LogoutMessage();
        var rawbytes = MessageUtils.readRawBytesTlv(this.getInputStream());
        if (resultsMsg.parseBytes(rawbytes) != -1) {
          var valueLines = resultsMsg.value.split("\n");
          for (i in valueLines) {
            var keyValue = valueLines[i].split(":");
            if (keyValue.length == 2) {
              this.results["results"][keyValue[0]] = 
                keyValue[1].trim().replace("\n", "");
            } else {
              this.results["results"][keyValue[0]] = "";
            }
          }
        } else if (logoutMsg.parseBytes(rawbytes) != -1) {
          console.error("Got a logout message -- quitting.");
          break;
        } else {
          console.error("Got a unknown message -- quitting.");
          break;
        }
      }

      this.state++;
      this.done.done(this);
    }
  } else {
    console.error("status: " + status.toString());
  }
  return success;
}

exports.NDT = NDT;
exports.Test = NDT;
