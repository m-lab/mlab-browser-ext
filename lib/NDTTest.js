/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

function NDTTest() {
}

NDTTest.prototype.toString = function () {
  return "NDT Test";
}

exports.NDTTest = NDTTest;
