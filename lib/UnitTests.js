/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Connection = require("./Connection.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");
var NDT = require("./NDT.js");
var C2STest = require("./C2STest.js");
var MetaTest = require("./MetaTest.js");
var Constants = require("./Constants.js");

function MessageTests(connection) {
  this.connection = connection;
}

function NDTTests(name, port) {
  this.serverName = name;
  this.serverPort = port;
}

function C2STests(name, port) {
  this.serverName = name;
  this.serverPort = port;
}

function MetaTests(name, port) {
  this.serverName = name;
  this.serverPort = port;
}

function writeMessageTests(connection) {
  var testMsg = new Message.Message(1);
  testMsg.value = "testing";
  testMsg.write(connection.boutput);

  var loginMsg = new Message.LoginMessage([Constants.Tests.TEST_S2C]);
  loginMsg.write(connection.boutput);

  connection.flush();
}

function TestSuiteMessageParseBytesTest() {
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
    console.error("Failed to parse tsMessageP bytes.");
    return -1;
  } else if (tsMessage.type != Constants.Messages.MSG_LOGIN) {
    console.error("Failed to set the proper type.");
    return -1;
  } else if (tsMessage.value != "test") {
    console.error("Failed to set the proper value: " + tsMessage.value + "-");
    return -1;
  }
  return 1;
}

function KickoffMessageParseBytesTest() {
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
    console.error("Failed to parse kickoff message bytes.");
    return -1;
  }
  if (koMessage.isValidKickoffMessage() == -1) {
    console.error("Invalid Kickoff message.");
    return -1;
  }
  return 1;
}

function ServerVersionMessageParseBytesTest() {
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
    console.error("Failed to parse svMessageP bytes.");
    return -1;
  } else if (svMessage.type != Constants.Messages.MSG_LOGIN) {
    console.error("Failed to set the proper type.");
    return -1;
  } else if (svMessage.value != "v3.6") {
    console.error("Failed to set the proper value: " + svMessage.value + "-");
    return -1;
  }
  return 1;
}

function SrvQMessageParseBytesTest() {
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
    console.error("Failed to parse svqMessageP bytes.");
    return -1;
  } else if (svqMessage.type != Constants.Messages.SRV_QUEUE) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function ResultsRetrievalMessageParseBytesTest() {
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
    console.error("Failed to parse ResultsRetrievalMessageP bytes.");
    return -1;
  } else if (ResultsRetrievalMessage.type != Constants.Messages.MSG_RESULTS) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function TestMsgMessageParseBytesTest() {
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
    console.error("Failed to parse TestMsgMessageP bytes.");
    return -1;
  } else if (TestMsgMessage.type != Constants.Messages.TEST_MSG) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function TestFinalizeMessageParseBytesTest() {
  var TestFinalizeMessageP = new Uint8Array(new ArrayBuffer(3));
  TestFinalizeMessageP[0] = Constants.Messages.TEST_FINALIZE;
  TestFinalizeMessageP[1] = 0;
  TestFinalizeMessageP[2] = 0;

  var TestFinalizeMessage = new Message.TestFinalizeMessage();

  if (TestFinalizeMessage.parseBytes(TestFinalizeMessageP) == -1) {
    console.error("Failed to parse TestFinalizeMessageP bytes.");
    return -1;
  } else if (TestFinalizeMessage.type != Constants.Messages.TEST_FINALIZE) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function TestPrepareMessageParseBytesTest() {
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
    console.error("Failed to parse TestPrepareMessageP bytes.");
    return -1;
  } else if (TestPrepareMessage.type != Constants.Messages.TEST_PREPARE) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function TestStartMessageParseBytesTest() {
  var TestStartMessageP = new Uint8Array(new ArrayBuffer(3));
  TestStartMessageP[0] = Constants.Messages.TEST_START;
  TestStartMessageP[1] = 0;
  TestStartMessageP[2] = 0;

  var TestStartMessage = new Message.TestStartMessage();

  if (TestStartMessage.parseBytes(TestStartMessageP) == -1) {
    console.error("Failed to parse TestStartMessageP bytes.");
    return -1;
  } else if (TestStartMessage.type != Constants.Messages.TEST_START) {
    console.error("Failed to set the proper type.");
    return -1;
  }
  return 1;
}

function NDTInitTest() {
  var ndt = new NDT.NDT();

  ndt.init(this.serverName, this.serverPort);

  if (ndt.getServerName() != this.serverName ||
      ndt.getServerPort() != this.serverPort) {
    console.error("init() did not succeed!");
    return -1;
  }
  return 1;
}

function NDTControlProtocolTest() {
  var ndt = new NDT.NDT();
  var success = 1;

  ndt.init(this.serverName, this.serverPort);

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
    var loginMsg = new Message.LoginMessage([Constants.Tests.TEST_S2C,
      Constants.Tests.TEST_C2S,
      Constants.Tests.TEST_MID,
      Constants.Tests.TEST_SFW,
      Constants.Tests.TEST_META,
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

  ndt.close();
  return success;
}

function C2STestBasicTest() {
  var c2s = null;
  var ndt = new NDT.NDT();
  var success = 1;

  ndt.init(this.serverName, this.serverPort);

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
      Constants.Tests.TEST_C2S,
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

  console.error("Starting to run a c2s test.");
  c2s = new C2STest.C2STest(ndt);
  c2s.runTest();

  ndt.close();
  return success;
}

function MetaTestBasicTest() {
  var meta = null;
  var ndt = new NDT.NDT();
  var success = 1;

  ndt.init(this.serverName, this.serverPort);

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
      Constants.Tests.TEST_META,
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

  console.error("Starting to run a meta test.");
  meta = new MetaTest.MetaTest(ndt);
  meta.runTest();

  ndt.close();
  return success;
}

MessageTests.prototype.runTests = function () {
  testRunner("Message tests", this, [TestSuiteMessageParseBytesTest, 
    ServerVersionMessageParseBytesTest,
    KickoffMessageParseBytesTest,
    SrvQMessageParseBytesTest,
    ResultsRetrievalMessageParseBytesTest,
    TestMsgMessageParseBytesTest,
    TestFinalizeMessageParseBytesTest,
    TestPrepareMessageParseBytesTest,
    TestStartMessageParseBytesTest,
    ]);
}

NDTTests.prototype.runTests = function () {
  return 1;
  testRunner("NDT tests", this, [NDTControlProtocolTest,
    ]);
}

C2STests.prototype.runTests = function () {
  testRunner("C2S tests", this, [C2STestBasicTest,
    ]);
}

MetaTests.prototype.runTests = function () {
  testRunner("Meta tests", this, [MetaTestBasicTest,
    ]);
}

function testRunner(testName, ths, tests) {
  var failedTests = "";
  var succeededTests = "";
  var failures = 0;
  var successes = 0;

  for (i in tests) {
    if (tests[i].call(ths) != 1) {
      failures++;
      if (failedTests != "") failedTests += ", ";
      failedTests += tests[i].name;
    } else {
      successes++;
      if (succeededTests != "") succeededTests += ", ";
      succeededTests += tests[i].name;
    }
  }
  console.error(testName + " results:");
  if (failures) {
    console.error("" + failures + " tests failed:\n" + failedTests);
  }
  console.error("" + successes + " tests succeeded:\n" + succeededTests);
}

exports.MessageTests = MessageTests;
exports.NDTTests = NDTTests;
exports.C2STests = C2STests;
exports.MetaTests = MetaTests;
