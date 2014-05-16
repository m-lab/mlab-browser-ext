/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;

/*
 * Even though we load these dynamically,
 * they must be required()d statically
 * so that the sdk includes them in the .xpi.
 */
var NDT = require("plugins/NDT/NDT.js");

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {

    var tests = [
      {
        name: "NDT",
        parameters: ["ndt.iupui.mlab4.nuq0t.measurement-lab.org", 3001],
      }
    ];
    var ndt;
    for (i in tests) {
      var testClass = require("plugins/"+tests[i].name+"/"+tests[i].name+".js");
      var test = new testClass.Test();
      test.init(tests[i].parameters);
      test.runTest();
    }
  }
});
