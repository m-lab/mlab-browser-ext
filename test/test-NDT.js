/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Connection = require("./plugins/NDT/Connection.js");
var Message = require("./plugins/NDT/Message.js");
var MessageUtils = require("./plugins/NDT/MessageUtils.js");
var NDT = require("./plugins/NDT/NDT.js");
var C2STest = require("./plugins/NDT/C2STest.js");
var MetaTest = require("./plugins/NDT/MetaTest.js");
var S2CTest = require("./plugins/NDT/S2CTest.js");
var Constants = require("./plugins/NDT/Constants.js");
var MlabNS = require("./plugins/NDT/MlabNS.js");

var serverName = "ndt.iupui.mlab4.nuq0t.measurement-lab.org";
var serverPort = 3001;

var e = [];

function writeMessageTests(connection) {
  var testMsg = new Message.Message(1);
  testMsg.value = "testing";
  testMsg.write(connection.boutput);

  var loginMsg = new Message.LoginMessage([Constants.Tests.TEST_S2C]);
  loginMsg.write(connection.boutput);

  connection.flush();
}

exports["test SuiteMessageParseBytesTest"] = function(assert) {
  var tsMessageP = new Uint8Array(new ArrayBuffer(16));
  tsMessageP[0] = Constants.Messages.MSG_LOGIN;
  tsMessageP[1] = 0;
  tsMessageP[2] = 4;
  tsMessageP[3] = "t".charCodeAt(0);
  tsMessageP[4] = "e".charCodeAt(0);
  tsMessageP[5] = "s".charCodeAt(0);
  tsMessageP[6] = "t".charCodeAt(0);

  var tsMessage = new Message.TestSuiteMessage();

  if (tsMessage.parseBytes(tsMessageP) == -1) {
    assert.ok(false, "SuiteMessageParseBytesTest failed.");
  } else if (tsMessage.type != Constants.Messages.MSG_LOGIN) {
    assert.ok(false, "SuiteMessageParseBytesTest failed.");
  } else if (tsMessage.value != "test") {
    assert.ok(false, "SuiteMessageParseBytesTest failed.");
  }
  assert.ok(true, "SuiteMessageParseBytesTest passed.");
}

exports["test KickoffMessageParseBytesTest"] = function(assert) {
  var koMessageP = new Uint8Array(new ArrayBuffer(13));
  koMessageP[0] = "1".charCodeAt(0);
  koMessageP[1] = "2".charCodeAt(0);
  koMessageP[2] = "3".charCodeAt(0);
  koMessageP[3] = "4".charCodeAt(0);
  koMessageP[4] = "5".charCodeAt(0);
  koMessageP[5] = "6".charCodeAt(0);
  koMessageP[6] = " ".charCodeAt(0);
  koMessageP[7] = "6".charCodeAt(0);
  koMessageP[8] = "5".charCodeAt(0);
  koMessageP[9] = "4".charCodeAt(0);
  koMessageP[10] = "3".charCodeAt(0);
  koMessageP[11] = "2".charCodeAt(0);
  koMessageP[12] = "1".charCodeAt(0);

  var koMessage = new Message.KickoffMessage();
  if (koMessage.parseBytes(koMessageP) == -1) {
    assert.ok(false, "KickoffMessageParseBytesTest failed.");
  }
  if (koMessage.isValidKickoffMessage() == -1) {
    assert.ok(false, "KickoffMessageParseBytesTest failed.");
  }
  assert.ok(true, "KickoffMessageParseBytesTest passed.");
}

exports["test ServerVersionMessageParseBytesTest"] = function(assert) {
  var svMessageP = new Uint8Array(new ArrayBuffer(16));
  svMessageP[0] = Constants.Messages.MSG_LOGIN;
  svMessageP[1] = 0;
  svMessageP[2] = 4;
  svMessageP[3] = "v".charCodeAt(0);
  svMessageP[4] = "3".charCodeAt(0);
  svMessageP[5] = ".".charCodeAt(0);
  svMessageP[6] = "6".charCodeAt(0);

  var svMessage = new Message.ServerVersionMessage();

  if (svMessage.parseBytes(svMessageP) == -1) {
    assert.ok(false, "ServerVersionMessageParseBytesTest failed.");
  } else if (svMessage.type != Constants.Messages.MSG_LOGIN) {
    assert.ok(false, "ServerVersionMessageParseBytesTest failed.");
  } else if (svMessage.value != "v3.6") {
    assert.ok(false, "ServerVersionMessageParseBytesTest failed.");
  }
  assert.ok(true, "ServerVersionMessageParseBytesTest passed.");
}

exports["test SrvQMessageParseBytesTest"] = function(assert) {
  var svqMessageP = new Uint8Array(new ArrayBuffer(7));
  svqMessageP[0] = Constants.Messages.SRV_QUEUE;
  svqMessageP[1] = 0;
  svqMessageP[2] = 4;
  svqMessageP[3] = "9".charCodeAt(0);
  svqMessageP[4] = "9".charCodeAt(0);
  svqMessageP[5] = "0".charCodeAt(0);
  svqMessageP[6] = "0".charCodeAt(0);

  var svqMessage = new Message.SrvQMessage();

  if (svqMessage.parseBytes(svqMessageP) == -1) {
    assert.ok(false, "SrvQMessageParseBytesTest failed.");
  } else if (svqMessage.type != Constants.Messages.SRV_QUEUE) {
    assert.ok(false, "SrvQMessageParseBytesTest failed.");
  }
  assert.ok(true, "SrvQMessageParseBytesTest passed.");
}

exports["test ResultsRetrievalMessageParseBytesTest"] = function(assert) {
  var ResultsRetrievalMessageP = new Uint8Array(new ArrayBuffer(10));
  ResultsRetrievalMessageP[0] = Constants.Messages.MSG_RESULTS;
  ResultsRetrievalMessageP[1] = 0;
  ResultsRetrievalMessageP[2] = 7;
  ResultsRetrievalMessageP[3] = "r".charCodeAt(0);
  ResultsRetrievalMessageP[4] = "e".charCodeAt(0);
  ResultsRetrievalMessageP[5] = "s".charCodeAt(0);
  ResultsRetrievalMessageP[6] = "u".charCodeAt(0);
  ResultsRetrievalMessageP[7] = "l".charCodeAt(0);
  ResultsRetrievalMessageP[8] = "t".charCodeAt(0);
  ResultsRetrievalMessageP[9] = "s".charCodeAt(0);

  var ResultsRetrievalMessage = new Message.ResultsRetrievalMessage();

  if (ResultsRetrievalMessage.parseBytes(ResultsRetrievalMessageP) == -1) {
    assert.ok(false, "ResultsRetrievalMessageParseBytesTest failed.");
  } else if (ResultsRetrievalMessage.type != Constants.Messages.MSG_RESULTS) {
    assert.ok(false, "ResultsRetrievalMessageParseBytesTest failed.");
  }
  assert.ok(true, "ResultsRetrievalMessageParseBytesTest passed.");
}

exports["test MsgMessageParseBytesTest"] = function(assert) {
  var TestMsgMessageP = new Uint8Array(new ArrayBuffer(10));
  TestMsgMessageP[0] = Constants.Messages.TEST_MSG;
  TestMsgMessageP[1] = 0;
  TestMsgMessageP[2] = 7;
  TestMsgMessageP[3] = "3".charCodeAt(0);
  TestMsgMessageP[4] = "1".charCodeAt(0);
  TestMsgMessageP[5] = ".".charCodeAt(0);
  TestMsgMessageP[6] = "4".charCodeAt(0);
  TestMsgMessageP[7] = "5".charCodeAt(0);
  TestMsgMessageP[8] = "6".charCodeAt(0);
  TestMsgMessageP[9] = "7".charCodeAt(0);

  var TestMsgMessage = new Message.TestMsgMessage();

  if (TestMsgMessage.parseBytes(TestMsgMessageP) == -1) {
    assert.ok(false, "MsgMessageParseBytesTest failed.");
  } else if (TestMsgMessage.type != Constants.Messages.TEST_MSG) {
    assert.ok(false, "MsgMessageParseBytesTest failed.");
  }
  assert.ok(true, "MsgMessageParseBytesTest passed.");
}

exports["test FinalizeMessageParseBytesTest"] = function(assert) {
  var TestFinalizeMessageP = new Uint8Array(new ArrayBuffer(3));
  TestFinalizeMessageP[0] = Constants.Messages.TEST_FINALIZE;
  TestFinalizeMessageP[1] = 0;
  TestFinalizeMessageP[2] = 0;

  var TestFinalizeMessage = new Message.TestFinalizeMessage();

  if (TestFinalizeMessage.parseBytes(TestFinalizeMessageP) == -1) {
    assert.ok(false, "FinalizeMessageParseBytesTest failed.");
  } else if (TestFinalizeMessage.type != Constants.Messages.TEST_FINALIZE) {
    assert.ok(false, "FinalizeMessageParseBytesTest failed.");
  }
  assert.ok(true, "FinalizeMessageParseBytesTest passed.");
}

exports["test PrepareMessageParseBytesTest"] = function(assert) {
  var TestPrepareMessageP = new Uint8Array(new ArrayBuffer(7));
  TestPrepareMessageP[0] = Constants.Messages.TEST_PREPARE;
  TestPrepareMessageP[1] = 0;
  TestPrepareMessageP[2] = 4;
  TestPrepareMessageP[3] = "1".charCodeAt(0);
  TestPrepareMessageP[4] = "2".charCodeAt(0);
  TestPrepareMessageP[5] = "3".charCodeAt(0);
  TestPrepareMessageP[6] = "4".charCodeAt(0);

  var TestPrepareMessage = new Message.TestPrepareMessage();

  if (TestPrepareMessage.parseBytes(TestPrepareMessageP) == -1) {
    assert.ok(false, "PrepareMessageParseBytesTest failed.");
  } else if (TestPrepareMessage.type != Constants.Messages.TEST_PREPARE) {
    assert.ok(false, "PrepareMessageParseBytesTest failed.");
  }
  assert.ok(true, "PrepareMessageParseBytesTest passed.");
}

exports["test StartMessageParseBytesTest"] = function(assert) {
  var TestStartMessageP = new Uint8Array(new ArrayBuffer(3));
  TestStartMessageP[0] = Constants.Messages.TEST_START;
  TestStartMessageP[1] = 0;
  TestStartMessageP[2] = 0;

  var TestStartMessage = new Message.TestStartMessage();

  if (TestStartMessage.parseBytes(TestStartMessageP) == -1) {
    assert.ok(false, "StartMessageParseBytesTest failed.");
  } else if (TestStartMessage.type != Constants.Messages.TEST_START) {
    assert.ok(false, "StartMessageParseBytesTest failed.");
  }
  assert.ok(true, "StartMessageParseBytesTest passed.");
}

exports["test LogoutMessageParseBytesTest"] = function(assert) {
  var LogoutMessageP = new Uint8Array(new ArrayBuffer(3));
  LogoutMessageP[0] = Constants.Messages.MSG_LOGOUT;
  LogoutMessageP[1] = 0;
  LogoutMessageP[2] = 0;

  var LogoutMessage = new Message.LogoutMessage();

  if (LogoutMessage.parseBytes(LogoutMessageP) == -1) {
    assert.ok(false, "LogoutMessageParseBytesTest failed.");
  } else if (LogoutMessage.type != Constants.Messages.MSG_LOGOUT) {
    assert.ok(false, "LogoutMessageParseBytesTest failed.");
  }
  assert.ok(true, "LogoutMessageParseBytesTest passed.");
}

exports["test ResultsMessageParseBytesTest"] = function(assert) {
  var ResultsMessageP = new Uint8Array(new ArrayBuffer(3));
  ResultsMessageP[0] = Constants.Messages.MSG_RESULTS;
  ResultsMessageP[1] = 0;
  ResultsMessageP[2] = 0;

  var ResultsMessage = new Message.ResultsMessage();

  if (ResultsMessage.parseBytes(ResultsMessageP) == -1) {
    assert.ok(false, "ResultsMessageParseBytesTest failed.");
  } else if (ResultsMessage.type != Constants.Messages.MSG_RESULTS) {
    assert.ok(false, "ResultsMessageParseBytesTest failed.");
  }
  assert.ok(true, "ResultsMessageParseBytesTest passed.");
}

function InitializeNDTTestBasicTest(ndt, test) {
  var success = 1;

  ndt.open();
  /*
   * Check for kickoff message.
   */
  var koMessage = new Message.KickoffMessage();
  if (koMessage.parseBytes(
    MessageUtils.readRawBytes(ndt.getInputStream(),
    13))
    ) {
    if (!koMessage.isValidKickoffMessage()) {
      success = -1;
    }
  } else {
    success = -1;
  }
  /*
   * send login message and
   * check for SRV_QUEUE response.
   */
  if (success == 1) {
    var svqMessage;
    var b;
    var loginMsg = new Message.LoginMessage([
      test
      ]);

    loginMsg.write(ndt.getOutputStream());

    b = MessageUtils.readRawBytesTlv(ndt.getInputStream());
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

    b = MessageUtils.readRawBytesTlv(ndt.getInputStream());

    if (svMessage.parseBytes(b) == -1) {
      success = -1;
    } else {
      console.error("Server version: " + svMessage.value);
    }
  }
  /*
   * check for test suite message.
   */
  if (success == 1) {
    var b;
    var tsMessage = new Message.TestSuiteMessage();

    b = MessageUtils.readRawBytesTlv(ndt.getInputStream());
    if (tsMessage.parseBytes(b) == -1) {
      success = -1;
    } else {
      console.error("Server test suite: " + tsMessage.value);
    }
  }
  return 1;
}

function CompleteNDTTestBasicTest(ndt) {
  var success = 1;

  while (true) {
    var resultsMsg = new Message.ResultsMessage();
    var logoutMsg = new Message.LogoutMessage();
    var rawbytes = MessageUtils.readRawBytesTlv(ndt.getInputStream());
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
  return 1;
}

exports["test mlab-ns"] = function(assert) {
  var ns = new MlabNS.MlabNS();

  var result = ns.resolve();

  console.info("ns result: " + result);

  assert.ok(result, "mlab-ns test passed.");
}

exports["test timeout"] = function(assert) {
}

require("sdk/test").run(exports);
