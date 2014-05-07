/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");
var Message = require("./Message.js");
var MessageUtils = require("./MessageUtils.js");
var Connection = require("./Connection.js");
var ControlConnection = require("./ControlConnection.js");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;

function NDT() {
  this.serverName = "";
  this.controlTransport = null;
  this.controlConnection = null;
}

NDT.prototype.init = function (server, port) {
  this.serverName = server;
  this.serverPort = port;
}

NDT.prototype.open = function () {
  this.controlTransport = socketTransportService.createTransport(null, 
    0, 
    this.serverName, 
    this.serverPort, 
    null);
  this.controlConnection = new ControlConnection.ControlConnection(
    this.controlTransport);

  this.controlTransport.setEventSink(this.controlConnection, mainThread);
  this.controlConnection.connect();
}

NDT.prototype.close = function () {
  this.controlConnection.flush();
  this.controlTransport.close(1);
}

NDT.prototype.getServerName = function () {
  return this.serverName;
}

NDT.prototype.getServerPort = function () {
  return this.serverPort;
}

NDT.prototype.getInputStream = function () {
  return this.controlConnection.binput;
}

NDT.prototype.getOutputStream = function () {
  return this.controlConnection.boutput;
}

exports.NDT = NDT;
