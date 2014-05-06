/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var BinaryInputStream = Cc["@mozilla.org/binaryinputstream;1"];
var BinaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"];
var Connection = require("./Connection.js");

function ControlConnection(transport) {
  this.transport = transport;
  this.bytesRead = 0;
};

ControlConnection.prototype = new Connection.Connection();
ControlConnection.prototype.constructor = ControlConnection;
