/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);

/*
 * Even though we load these dynamically,
 * they must be required()d statically
 * so that the sdk includes them in the .xpi.
 */
var NDT = require("plugins/NDT/NDT.js");
var sidebarOpen = false;
var sidebar = null;

var tests = [
    {
      name: "NDT",
      parameters: ["ndt.iupui.mlab4.nuq0t.measurement-lab.org", 3001],
    }
  ];

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    if (!sidebarOpen) {
      /*
       * open the sidebar.
       */
     sidebar = require("sdk/ui/sidebar").Sidebar({
        id: 'mlab-sidebar',
        title: 'MLab Test Control Center',
        url: require("sdk/self").data.url("sidebar.html"),
        onAttach: function (worker) {
            console.error("Attaching!");
            worker.port.on("startTest", function(testName) {
              for (i in tests) {
                if (tests[i].name == testName) {
                  var testClass = require("plugins/" +
                    tests[i].name + "/" + tests[i].name + ".js");
                  var test = new testClass.Test();
                  test.init(tests[i].parameters);
                  test.runTest();
                }
              }
            });
          },
        onDetach: function () {
          sidebar.dispose();
          sidebarOpen = false;
          },
        });

      sidebar.show();
      sidebarOpen = true;
    } else {
      /*
       * close the sidebar.
       */
      sidebar.hide();
      sidebar.dispose();
      sidebar = null;
      sidebarOpen = false;
    }
  }
});
