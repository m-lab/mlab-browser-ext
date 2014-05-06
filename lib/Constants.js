/* vim: set expandtab ts=2 sw=2: */

var Tests = {};
Tests.TEST_MID = 1;
Tests.TEST_C2S = 2;
Tests.TEST_S2C = 4;
Tests.TEST_SFW = 8;
Tests.TEST_STATUS = 16;
Tests.TEST_META = 32;

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

exports.Tests = Tests;
exports.Messages = Messages;
exports.Qing = Qing;
