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

NDTTest.prototype.dataAvailable = function () {
}

NDTTest.prototype.onTransportStatus =
  function (transport, status, progress, progressMax) {
  console.error("NDTTest state: " + this.state);
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    this.dataAvailable();
  }
}

exports.NDTTest = NDTTest;
