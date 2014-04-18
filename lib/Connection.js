/* vim: set expandtab ts=2 sw: */

function Connection(transport) {
  this.transport = transport;
  this.bytesRead = 0;
};

exports.Connection = Connection;
