/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/**
 * User interface communication.
 * @constructor
 */
function UI() {
  this.tabWorker = null;
}

/**
 * Report a new result to the UI.
 *
 * @param {Plugin} test The name of the just-completed test.
 * @param {number} time The time that the test completed.
 */
UI.prototype.reportResult = function (test, time) {
  console.error("test done: " + test + " at time " + time);
  if (this.tabWorker) {
    this.tabWorker.port.emit(test + ".testDone", { test: test.toString(),
      time: time});
  }
}

/**
 * Set the Tab worker.
 *
 * @param {Worker} A worker that represents 
 * the visible UI (which is a tab.)
 */
UI.prototype.setTabWorker = function (tabWorker) {
  this.tabWorker = tabWorker;
}

/**
 * Remove (unset) the Tab worker.
 *
 */
UI.prototype.removeTabWorker = function () {
  this.tabWorker = null;
}

exports.UI = UI;
