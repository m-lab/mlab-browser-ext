/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/*
 * User interface communication.
 * @constructor
 */
function UI() {
  this.sidebarOpen = false;
  this.sidebar = null;
  this.sidebarWorker = null;
}

UI.prototype.reportResult = function (test, time) {
  console.error("test done: " + test + " at time " + time);
  if (this.sidebarWorker) {
    this.sidebarWorker.port.emit("testDone", { test: test.toString(),
      time: time});
  }
}
exports.UI = UI;
