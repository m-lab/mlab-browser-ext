/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var Done = require("./done.js");
var UI = require("./ui.js");

/*
 * Even though we load these dynamically,
 * they must be required()d statically
 * so that the sdk includes them in the .xpi.
 */
var NDT = require("plugins/NDT/NDT.js");
var ui = new UI.UI();

var done = new Done.Done(ui);

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
    if (!ui.sidebarOpen) {
      /*
       * open the sidebar.
       */
      ui.sidebar = require("sdk/ui/sidebar").Sidebar({
      id: 'mlab-sidebar',
      title: 'MLab Test Control Center',
      url: require("sdk/self").data.url("sidebar.html"),
      onAttach: function (worker) {
          console.error("Attaching!");
          ui.sidebarWorker = worker;
          worker.port.on("startTest", function(testName) {
            /*
             * Look for a test with the matching name.
             */
            for (i in tests) {
              if (tests[i].name == testName) {
                /*
                 * Launch test.
                 */
                var testClass = require("plugins/" +
                  tests[i].name + "/" + tests[i].name + ".js");
                var test = new testClass.Test();

                test.init(tests[i].parameters);
                test.runTest(done);
              }
            }
          });
        },
      onDetach: function () {
          ui.sidebar.dispose();
          ui.sidebarOpen = false;
          ui.sidebarWorker = null;
        },
      });

      ui.sidebar.show();
      ui.sidebarOpen = true;
    } else {
      /*
       * close the sidebar.
       */
      ui.sidebar.hide();
      ui.sidebar.dispose();
      ui.sidebar = null;
      ui.sidebarOpen = false;
    }
  }
});
