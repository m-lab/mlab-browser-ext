/* vim: set expandtab ts=2 sw: */
var Constants = require("./Constants.js");

function Message(type) {
  this.type = type;
}

Message.prototype.writeType = function (stream) {
  stream.write8(this.type);
}

Message.prototype.write = function (stream) {
  var length = this.message.length;
  this.writeType(stream);
  stream.write16(length);
  stream.writeBytes(this.message, length);
}

exports.Message = Message;

function LoginMessage(tests) {
  Message.prototype.constructor.call(this, Constants.Messages.MSG_LOGIN);
  this.tests = tests;
}

LoginMessage.prototype = new Message();
LoginMessage.prototype.constructor = LoginMessage;
LoginMessage.prototype.write = function (stream) {
  var testsTotal = 0;
  var i = 0;
  Message.prototype.writeType.call(this, stream);
  stream.write16(1);
  for (i in this.tests) {
    testsTotal+=this.tests[i];
  }
  stream.write8(testsTotal);
}

exports.LoginMessage = LoginMessage;
