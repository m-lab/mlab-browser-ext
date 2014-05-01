/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Connection = require("./Connection.js");
var Message = require("./Message.js");
var Constants = require("./Constants.js");

function MessageTests(connection) {
  this.connection = connection;
}

MessageTests.prototype.runTests = function () {
  var testMsg = new Message.Message(1);
  testMsg.message = "testing";
  testMsg.write(this.connection.boutput);

  var loginMsg = new Message.LoginMessage([Constants.Tests.TEST_S2C]);
  loginMsg.write(this.connection.boutput);

  this.connection.flush();
}

exports.MessageTests = MessageTests;
