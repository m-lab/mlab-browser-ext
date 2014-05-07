/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Connection = require("./Connection.js");
var Message = require("./Message.js");
var Constants = require("./Constants.js");
var ReaderConnection = require("./ReaderConnection.js");
var UnitTests = require("./UnitTests.js");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    var mTests, ndtTests;
    var transport = socketTransportService.createTransport(null, 
      0, 
      "localhost", 
      5001, 
      null);
    var connection = new Connection.Connection(transport);

    connection.connect();
    mTests = new UnitTests.MessageTests(connection);
    mTests.runTests();
    connection.flush();
    transport.close(1);

    ndtTests = new UnitTests.NDTTests(
      "ndt.iupui.mlab4.nuq0t.measurement-lab.org", 
      3001);
    ndtTests.runTests();

  }
});
