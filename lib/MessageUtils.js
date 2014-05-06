/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");

function range(begin, end) {
  for (let i = begin; i < end; ++i) {
    yield i;
  }
}

exports.range = range;

function genericParseTLString(b) {
  var type, length, value;
  if (!b.BYTES_PER_ELEMENT || b.BYTES_PER_ELEMENT != 1) {
    console.error("Incorrect parameter type!");
    return -1;
  }

  if (b[0] != Constants.Messages.MSG_LOGIN) {
    console.error("Incorrect message type!");
    return -1;
  }

  length = b[1];
  length = length << 8;
  length += b[2];

  this.type = b[0];
  this.value = [
    String.fromCharCode(b[i]) for (i in range(3, length))
    ].join("");
}

exports.genericParseTLString = genericParseTLString;
