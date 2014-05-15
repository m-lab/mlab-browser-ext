/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Connection = require("./tests/NDT/Connection.js");
var Message = require("./tests/NDT/Message.js");
var Constants = require("./tests/NDT/Constants.js");
var ReaderConnection = require("./tests/NDT/ReaderConnection.js");
var UnitTests = require("./tests/NDT//UnitTests.js");
var NDT = require("./tests/NDT//NDT.js");
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
    var mTests, ndtTests, c2sTests;
    var ndt;

    ndt = new NDT.NDT();
    ndt.init("ndt.iupui.mlab4.nuq0t.measurement-lab.org", 3001);
    ndt.runTest();

/*
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
    c2sTests = new UnitTests.C2STests(
      "ndt.iupui.mlab4.nuq0t.measurement-lab.org", 
      3001);
    c2sTests.runTests();
    metaTests = new UnitTests.MetaTests(
      "ndt.iupui.mlab4.nuq0t.measurement-lab.org", 
      3001);
    metaTests.runTests();
    s2cTests = new UnitTests.S2CTests(
      "ndt.iupui.mlab4.nuq0t.measurement-lab.org", 
      3001);
    s2cTests.runTests();
*/
  }
});
