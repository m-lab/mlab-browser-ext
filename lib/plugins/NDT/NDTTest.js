/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/**
 * Superclass for all NDT tests.
 * @constructor NDTTest
 * @param {NDT} ndt The controlling NDT test.
 * @param {nsIThread} ioThread The i/o thread to be used
 * for doing the test.
 */
function NDTTest(ndt, ioThread) {
  this.ndt = ndt;
  this.ioThread = ioThread;
}

/**
 * Generic toString()
 * @abstract
 */
NDTTest.prototype.toString = function () {
  return "NDT Test";
}

/**
 * Cancel this test.
 *
 */
NDTTest.prototype.cancel = function () {
  if (this.testTransport != null) {
    this.testTransport.close(1);
  }
}

/**
 * Run the test.
 * @abstract
 * @param {dictionary} results A place to store
 * this test's results.
 */
NDTTest.prototype.runTest = function (results) {
  console.error("Must implement runTest()");
}

exports.NDTTest = NDTTest;
