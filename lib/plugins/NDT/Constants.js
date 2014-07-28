/* vim: set expandtab ts=2 sw=2: */
var MetaTest = require("./MetaTest.js");
var S2CTest = require("./S2CTest.js");
var C2STest = require("./C2STest.js");

var Tests = {};
Tests.TEST_MID = 1;
Tests.TEST_C2S = 2;
Tests.TEST_S2C = 4;
Tests.TEST_SFW = 8;
Tests.TEST_STATUS = 16;
Tests.TEST_META = 32;

var TestsMap = [];
TestsMap[Tests.TEST_C2S] = C2STest.C2STest;
TestsMap[Tests.TEST_S2C] = S2CTest.S2CTest;
TestsMap[Tests.TEST_META] = MetaTest.MetaTest;


var Messages = {};
Messages.COMM_FAILURE = 0;
Messages.SRV_QUEUE = 1;
Messages.MSG_LOGIN = 2;
Messages.TEST_PREPARE = 3;
Messages.TEST_START = 4;
Messages.TEST_MSG = 5;
Messages.TEST_FINALIZE = 6;
Messages.MSG_ERROR = 7;
Messages.MSG_RESULTS = 8;
Messages.MSG_LOGOUT = 9;
Messages.MSG_WAITING = 10;

var Qing = {};
Qing.NOW = "0";
Qing.SERVER_FAULT = "9977";
Qing.SERVER_BUSY = "9988";
Qing.CLIENT_ALIVE = "9990";

var NDTProtocolStates = {}
NDTProtocolStates.kickoff = 1;
NDTProtocolStates.login = 2;
NDTProtocolStates.queue = 3;
NDTProtocolStates.version = 4;
NDTProtocolStates.suite = 5;
NDTProtocolStates.tests = 6;
NDTProtocolStates.tests_running = 7;
NDTProtocolStates.results = 8;

var NDTProtocolConstants = {};
NDTProtocolConstants.TEST_TIMEOUT = 20000;
NDTProtocolConstants.CONNECT_TIMEOUT = 5000;

var S2CTestStates = {};
S2CTestStates.prepare = 1;
S2CTestStates.start = 2;
S2CTestStates.msg = 3;
S2CTestStates.finalize = 4;

var C2STestStates = {};
C2STestStates.prepare = 1;
C2STestStates.start = 2;
C2STestStates.msg = 3;
C2STestStates.finalize = 4;

exports.Tests = Tests;
exports.Messages = Messages;
exports.Qing = Qing;
exports.TestsMap = TestsMap;
exports.NDTProtocolStates = NDTProtocolStates;
exports.NDTProtocolConstants = NDTProtocolConstants;
exports.S2CTestStates = S2CTestStates;
exports.C2STestStates = C2STestStates;
