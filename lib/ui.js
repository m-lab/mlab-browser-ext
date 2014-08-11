/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/**
 * User interface communication.
 * @constructor
 */
function UI() {
  this.tabWorker = null;
  this.visibleTest = null;
}

/**
 * Report a new result to the UI.
 *
 * @param {Plugin} test The name of the just-completed test.
 * @param {number} time The time that the test completed.
 */
UI.prototype.reportResult = function (test, time) {
  console.error("test done: " + test + " at time " + time);
  console.error("visibleTest: " + this.visibleTest);
  if (this.tabWorker && this.visibleTest == test) {
    this.tabWorker.port.emit(test + ".testDone", { test: test.toString(),
      time: time});
  }
  if (this.tabWorker) {
    this.tabWorker.port.emit("testStopped", test.toString());
  }
}

/**
 * Set the Tab worker.
 *
 * @param {Worker} tabWorker A worker that represents
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

UI.prototype.setVisibleTest = function (testName) {
  console.error("Setting visible test: " + testName);
  this.visibleTest = testName;
}

UI.prototype.getVisibleTest = function () {
  return this.visibleTest;
}

exports.UI = UI;
