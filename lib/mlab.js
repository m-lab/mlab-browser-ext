/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var NDT = require("plugins/NDT/NDT.js");
var Done = require("./done.js");
var Storage = require("./storage.js");
var TestPrefs = require("./testprefs.js");

/**
 * Basic controller for the entire
 * browser extension.
 * @constructor
 *
 * @param {UI} ui The ui that this extension should
 * talk to.
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

/**
 * Remove the worker.
 */
Mlab.prototype.removeWorker = function () {
  if (this.worker) {
  }
  this.worker = null;
}

/**
 * Set the worker.
 *
 * @param {Worker} worker The worker to use to communicate
 * with the sidebar.
 */
Mlab.prototype.setWorker = function (worker) {
  this.worker = worker;
  this.worker.port.on("startTest", this.startTest.bind(this));
  this.worker.port.on("listTestResults", this.listTestResults.bind(this));
  this.worker.port.on("listTestPreferences", this.listTestPreferences.bind(this));
  this.worker.port.on("getTestResult", this.getTestResult.bind(this));
  this.worker.port.on("getTestResults", this.getTestResults.bind(this));
  this.worker.port.on("getTestPreference", this.getTestPreference.bind(this));
  this.worker.port.on("setTestPreference", this.setTestPreference.bind(this));
}

/**
 * Get a particular test result.
 *
 * @param {Object{}} test The object to use
 * to describe what test to fetch. Set .test
 * as the name of the test; set .time as the
 * time of the test to retrieve.
 *
 * @return {Object{}} An object that has the
 * results. Get .test as the name of the test;
 * get .time as the time; get .result as the result.
 */
Mlab.prototype.getTestResult = function (test) {
  console.error("asking for " + test.test + " at time " + test.time);
  this.worker.port.emit(test.test + ".testResult",
    {
      test: test.test,
      time: test.time,
      result:Storage.getStorage().getResult(test.test, test.time)
    });
}

/**
 * Get a list of test results.
 *
 * @param {Object{}} test The object to use
 * to describe what test results to fetch.
 * Set .test as the name of the test;
 *
 * @return {string[]} Same as Storage#listResults.
 */
Mlab.prototype.listTestResults = function (testName) {
  this.worker.port.emit(testName + ".testResultsList",
    {
      test: testName,
      results: Storage.getStorage().listResults(testName)
    });
}

/**
 * Get all the test results for a test.
 *
 * @param {string} testName The name of the test.
 *
 * @return {Object{}} With .test as the test name;
 * with .results as an array of result objects that
 * have .time as the result time and .results as
 * the results from the storage.
 */
Mlab.prototype.getTestResults = function (testName) {
  this.worker.port.emit(testName + ".testResults",
    {
      test: testName,
      results: Storage.getStorage().getResults(testName)
    });
}

/**
 * Start running a test.
 *
 * @param {string} testName The name of the
 * test to start.
 */
Mlab.prototype.startTest = function (testName) {
  /*
   * Look for a test with the matching name.
   */
  for (i in this.tests) {
    if (this.tests[i].name === testName) {
      /*
       * Launch test.
       */
      var testClass = require("plugins/" +
        this.tests[i].name + "/" + this.tests[i].name + ".js");
      var test = new testClass.Test();

      test.init(this.tests[i].parameters);
      test.runTest(this.done);
    }
  }
}

/**
 * List preferences for a test.
 *
 * @param {string} testName The name of the
 * test for which to gather the preference list.
 *
 * @return {Object[]} An array of test preferences.
 * Each test preference object has a
 * .type: the type (boolean, string, int)
 * .key: the 'name' of the preference
 * .defaultValue: the default value
 * .description: a user-centric description
 */
Mlab.prototype.listTestPreferences = function (testName) {
  var test = null;
  for (i in this.tests) {
    if (this.tests[i].name === testName) {
      var testClass = require("plugins/" +
        this.tests[i].name + "/" + this.tests[i].name + ".js");
      test = new testClass.Test();
    }
  }
  if (test == null) {
    return null;
  }
  if (this.worker != null) {
    this.worker.port.emit(testName + ".testPreferences", test.getPreferences());
  }
  return test.getPreferences();
}

/**
 * Set a preference for a particular test.
 *
 * @param {Object} testPreference An object that describes
 * the test preference and its default value. The contains a
 * .test: the test associated with this preference.
 * .type: the preference's type.
 * .key: the preference's 'name'.
 * .value: the preference's value.
 */
Mlab.prototype.setTestPreference = function (testPreference) {
  var testPrefs = new TestPrefs.TestPrefs();
  var value = null;
  if (testPreference.type == "boolean") {
    value = (testPreference.value == "true");
  } else if (testPreference.type == "int") {
    value = parseInt(testPreference.value, 10);
  } else if (testPreference.type == "string") {
    value = testPreference.value;
  }
  if (value != null) {
    testPrefs.setPreference(testPreference.test,
                            testPreference.key,
                            value);
  }
}

/**
 * Get a preference value for a particular test.
 *
 * @param {Object} testPreference An object that describes
 * the test preference whose value the caller wants.
 * .test: the test associated with this preference.
 * .type: the preference's type.
 * .key: the preference's 'name'.
 * .defaultValue: the preference's value.
 * .description: the preference's description.
 *
 * @return {Object} An object that represents the
 * test preference and its actual value. The object
 * contains
 * .test: the test associated with this preference.
 * .type: the preference's type.
 * .key: the preference's 'name'.
 * .defaultValue: the preference's value.
 * .description: the preference's description.
 * .value: the preference's value.
 */
Mlab.prototype.getTestPreference = function (testPreference) {
  var testPrefs = new TestPrefs.TestPrefs();
  var result = {
    test: testPreference.test,
    key: testPreference.key,
    type: testPreference.type,
    description: testPreference.description,
    defaultValue: testPreference.defaultValue,
    value: testPrefs.getPreference(testPreference.test, testPreference.key)
  };
  if (this.worker != null) {
    this.worker.port.emit(testPreference.test + ".testPreference", result);
  }
  return testPrefs.getPreference(testPreference.test, testPreference.key);
}

Mlab.prototype.forEachTest = function (f) {
  for (i in this.tests) {
    var testClass = require("plugins/" +
      this.tests[i].name + "/" + this.tests[i].name + ".js");
    f(new testClass.Test());
  }
}

exports.Mlab = Mlab;
