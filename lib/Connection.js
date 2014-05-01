/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var BinaryInputStream = Cc["@mozilla.org/binaryinputstream;1"];
var BinaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"];

function Connection(transport) {
  this.transport = transport;
  this.bytesRead = 0;
};

Connection.prototype.connect = function () {
  this.input = this.transport.openInputStream(Ci.nsITransport.OPEN_BLOCKING|Ci.nsITransport.OPEN_UNBUFFERED, 0, 0);
  this.output = this.transport.openOutputStream(Ci.nsITransport.OPEN_BLOCKING|Ci.nsITransport.OPEN_UNBUFFERED, 0, 0);

  this.binput = BinaryInputStream.createInstance(Ci.nsIBinaryInputStream);
  this.binput.setInputStream(this.input);

  this.boutput = BinaryOutputStream.createInstance(Ci.nsIBinaryOutputStream);
  this.boutput.setOutputStream(this.output);
}

Connection.prototype.flush = function () {
  if (this.boutput != null) this.boutput.flush();
  if (this.output != null) this.output.flush();
}

exports.Connection = Connection;
