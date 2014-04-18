/* vim: set expandtab ts=2 sw: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var ReaderConnection = require("./ReaderConnection.js");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var BinaryInputStream = Cc["@mozilla.org/binaryinputstream;1"];
var BinaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"];
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;
var File = components.utils.import("resource://gre/modules/FileUtils.jsm");

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    var transport = socketTransportService.createTransport(null, 0, "localhost", 5001, null);
    var connection = new ReaderConnection.ReaderConnection(transport);
    connection.setOutputFile("/tmp/output.o");
    transport.setEventSink(connection, mainThread);
    connection.connect();
  }
});
