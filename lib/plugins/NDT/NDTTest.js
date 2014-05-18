/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

function NDTTest(ndt, ioThread) {
  this.ndt = ndt;
  this.ioThread = ioThread;
}

NDTTest.prototype.toString = function () {
  return "NDT Test";
}

NDTTest.prototype.cancel = function () {
  if (this.testTransport != null) {
    this.testTransport.close(1);
  }
}

NDTTest.prototype.runTest = function (results) {
  console.error("Must implement runTest()");
}

exports.NDTTest = NDTTest;
