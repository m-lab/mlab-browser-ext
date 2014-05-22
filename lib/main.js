/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
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

var widget = widgets.Widget({
  id: "mlab-plugin",
  label: "Measurement Lab Test Suite",
  contentURL: require("sdk/self").data.url("img/m-lab-32x32.png"),
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
          mlab.setWorker(worker);
       },
      onDetach: function () {
          ui.sidebar.dispose();
          ui.sidebarOpen = false;
          ui.sidebarWorker = null;
          mlab.removeWorker();
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
