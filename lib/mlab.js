/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var NDT = require("plugins/NDT/NDT.js");
var Done = require("./done.js");

/*
 * User interface communication.
 * @constructor
 */
function Mlab(ui) {
  this.worker = null;
  this.ui = ui;
  this.done = new Done.Done(this.ui);
  this.tests = [
    {
      name: "NDT",
      parameters: ["ndt.iupui.mlab4.nuq0t.measurement-lab.org", 3001],
    }
  ];
}

Mlab.prototype.removeWorker = function () {
  if (this.worker) {
  }
  this.worker = null;
}

Mlab.prototype.setWorker = function (worker) {
  this.worker = worker;
  this.worker.port.on("startTest", this.startTest.bind(this));
}

Mlab.prototype.startTest = function (testName) {
  /*
   * Look for a test with the matching name.
   */
  for (i in this.tests) {
    if (this.tests[i].name === testName) {
      /*
       * Launch test.
       */
      console.error("Found " + testName);
      var testClass = require("plugins/" +
        this.tests[i].name + "/" + this.tests[i].name + ".js");
      var test = new testClass.Test();

      test.init(this.tests[i].parameters);
      test.runTest(this.done);
    }
  }
}

exports.Mlab = Mlab;
