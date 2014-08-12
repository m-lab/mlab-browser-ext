/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var buttons = require("sdk/ui/button/action");
var Tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var UI = require("./ui.js");
var Mlab = require("./mlab.js");

/*
 * Even though we load these dynamically,
 * they must be required()d statically
 * so that the sdk includes them in the .xpi.
 */
var ui = new UI.UI();
var mlab = new Mlab.Mlab(ui);
var tabId = -1;

Tabs.on("pageshow", function (tab) {
  console.error("url: " + tab.url);
  console.error("data url: " + require("sdk/self").data.url());
  if (tab.url == require("sdk/self").data.url("tab.html")) {
    var worker = null;
    var contentScriptFiles = [ 
      require("sdk/self").data.url("tab.js"),
      require("sdk/self").data.url("viz.js")
      ];

    var tests = mlab.getPlugins();
    for (test in tests) {
      var files = mlab.getPluginVizScripts(tests[test].name);
      for (file in files) {
        contentScriptFiles.push(require("sdk/self").data.url("viz" + files[file]));
      }
    }
    console.error("files: " + contentScriptFiles);
    console.error("activating!");
    mlab.setWorker(worker = tab.attach({
      contentScriptFile: contentScriptFiles,
      }));

    worker.port.on("unload", function () {
      console.error("closing/deactivating: " + tab.url);
      mlab.removeWorker();
      mlab.setVisibleTest(null);
      tabId = -1;
    });
    worker.port.emit("initialize", null);
    tabId = tab.id;
  }
});

var button = buttons.ActionButton({
  id: "mlab-plugin",
  label: "Measurement Lab Test Suite",
  icon: {
    "32": "./img/m-lab-32x32.png",
    "64": "./img/m-lab-64x64.png",
  },
  onClick: function() {
    /*
     * Look for a matching tab.
     */
    if (tabId != -1) {
      for each (var tab in Tabs) {
        if (tab.id == tabId) {
          console.error("Found a matching tab. Activating.");
          tab.activate();
          break;
        }
      }
    } else {
      Tabs.open(require("sdk/self").data.url("tab.html"));
    }
  }
});
