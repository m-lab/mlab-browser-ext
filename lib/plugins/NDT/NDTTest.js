/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

function NDTTest() {
}

NDTTest.prototype.toString = function () {
  return "NDT Test";
}

NDTTest.prototype.cancel = function () {
  if (this.testTransport != null) {
    this.testTransport.close(1);
  }
}

exports.NDTTest = NDTTest;
