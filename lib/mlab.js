/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var NDT = require("plugins/NDT/NDT.js");
var Done = require("./done.js");
var Storage = require("./storage.js");
var TestPrefs = require("./testprefs.js");
var Tabs = require("sdk/tabs");
var Self = require("sdk/self");

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
      parameters: ["ndt.iupui.mlab3.iad01.measurement-lab.org", 3001],
      vizContent: "/ndt/ndt.html",
      vizSidebar: "/ndt/ndt-sidebar.js",
      vizScripts: ["/ndt/d3.v3.js", "/ndt/ndt-tab.js"],
    }
  ];
}

/**
 * Get the array of plugins.
 *
 * @return {Plugin[]} An array of Plugins.
 */
Mlab.prototype.getPlugins = function () {
  return this.tests;
}

/**
 * Get the name of the test's visualizer.
 *
 * @param {String} testName The name of the test for
 * which to fetch the visualizer.
 *
 * @return {String} The name of the file that 
 * contains the visualizer code for testName.
 */
Mlab.prototype.getPluginVizContent = function (testName) {
  for (i in this.tests) {
    if (this.tests[i].name == testName) {
      return this.tests[i].vizContent;
    }
  }
  return null;
}

Mlab.prototype.getPluginVizSidebar = function (testName) {
  for (i in this.tests) {
    if (this.tests[i].name == testName) {
      return this.tests[i].vizSidebar;
    }
  }
  return null;
}

/**
 * Get a list of the scripts required to 
 * support this test's visualizer.
 *
 * @param {String} testName The name of the test
 * for which to fetch visualizer support scripts.
 *
 * @return {String[]} An array of filenames that
 * hold supporting code for testName's visualizer.
 */
Mlab.prototype.getPluginVizScripts = function (testName) {
  for (i in this.tests) {
    if (this.tests[i].name == testName) {
      return this.tests[i].vizScripts;
    }
  }
  return [];
}

/**
 * Remove the worker.
 */
Mlab.prototype.removeWorker = function () {
  if (this.worker) {
  }
  this.worker = null;
  this.ui.removeTabWorker();
}

/**
 * Set the tab worker.
 *
 * @param {Worker} worker The worker to use to communicate
 * with the sidebar.
 */
Mlab.prototype.setWorker = function (worker) {
  this.worker = worker;
  this.ui.setTabWorker(worker);
  this.worker.port.on("startTest", this.startTest.bind(this));
  this.worker.port.on("listTests", this.listTests.bind(this));
  this.worker.port.on("listTestPreferences", this.listTestPreferences.bind(this));
  this.worker.port.on("getTestPreference", this.getTestPreference.bind(this));
  this.worker.port.on("setTestPreference", this.setTestPreference.bind(this));
  this.worker.port.on("openTab", this.openTab.bind(this));
  this.worker.port.on("listTestResults", this.listTestResults.bind(this));
  this.worker.port.on("getTestResult", this.getTestResult.bind(this));
  this.worker.port.on("getTestResults", this.getTestResults.bind(this));
}

/**
 * Open a tab.
 *
 * @param {String} tabName The name of the
 * tab to open.
 */
Mlab.prototype.openTab = function (tabName) {
  Tabs.open(Self.data.url("viz" + this.getPluginVizContent(tabName.toUpperCase())));
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
 * List all the tests. I.e., list
 * all the plugin names.
 *
 * This function does not return anything,
 * but does emit the test list back to
 * the web ui.
 */
Mlab.prototype.listTests = function () {
  var tests = [];
  for (test in this.tests)
    tests.push(this.tests[test].name);
  this.worker.port.emit("tests", tests);
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
  console.error("listTestPreferences - mlab.");
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
  console.error("listTestPreferences - found a test.");
  if (this.worker != null) {
    console.error("listTestPreferences - emitting.");
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

/*
 * Run a function with an instantiated
 * test object for each defined test.
 *
 * @param {function} f A function to invoke
 * on an instantiated version of each of 
 * the tests. That test will be the function's
 * only parameter.
 */
Mlab.prototype.forEachTest = function (f) {
  for (i in this.tests) {
    var testClass = require("plugins/" +
      this.tests[i].name + "/" + this.tests[i].name + ".js");
    f(new testClass.Test());
  }
}

exports.Mlab = Mlab;
