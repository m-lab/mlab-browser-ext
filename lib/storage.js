/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var dirService = Cc["@mozilla.org/file/directory_service;1"].
  getService(Ci.nsIProperties);
var dbService = Cc["@mozilla.org/storage/service;1"].
  getService(Ci.mozIStorageService);
var storageSingleton = null;

var storageSchema = "id INTEGER PRIMARY KEY AUTOINCREMENT, \
  test STRING, \
  time INTEGER, \
  results TEXT";

/**
 * Construct a storage object.
 * @constructor
 */
function Storage() {
  var create = false;
  var dbFile = dirService.get("ProfD", Ci.nsIFile);
  dbFile.append("mlab.sqlite");

  if (!dbFile.exists()) {
    create = true; 
  }
  this.dbConnection = dbService.openDatabase(dbFile);
  if (create) {
    this.dbConnection.createTable("mlab", storageSchema);
  }
}

/**
 * List the results for a particular test.
 *
 * @param {string} test The test name.
 *
 * @returns {number[]} The times of the tests for
 * which results are available.
 */
Storage.prototype.listResults = function (test) {
  var results = [];
  console.error("listing results.");
  var statement = this.dbConnection.createStatement(
    "SELECT time from mlab where test=:test");
  statement.bindStringParameter(statement.getParameterIndex("test"), test);

  while (statement.executeStep()) {
    results.push(statement.row.time);
  }
  return results;
}

/**
 * Store a test result.
 *
 * @param {string} test Name of the test.
 * @param {number} time Time the test finished.
 * @param {string} results Results to store.
 * @param {boolean} synchronous (optional) true/false
 * whether to write these results to the storage
 * synchronously. Used mostly for testing.
 */
Storage.prototype.storeResult = function (test, time, results, synchronous) {
  console.error("Storing result.");
  var statement = this.dbConnection.createStatement(
    "INSERT INTO mlab \
    (test, time, results) \
    VALUES (:test, :time, :results)");

  console.error("Statement: " + statement.toString());
  statement.bindStringParameter(statement.getParameterIndex("test"), test);
  statement.bindInt64Parameter(statement.getParameterIndex("time"), time);
  statement.bindStringParameter(statement.getParameterIndex("results"),results);

  if (synchronous) {
    statement.execute();
  } else {
    statement.executeAsync({
      handleError: function (error) {
        console.error("Error: " + error.toString());
      },
      handleCompletion: function (reason) {
        console.error("Completed: " + reason.toString());
      },
    });
  }
}

/**
 * Get a particular test result.
 *
 * @param {string} test The name of the test.
 * @param {number} time The time of the test.
 *
 * @returns {string[]} Results.
 */
Storage.prototype.getResult = function (test, time) {
  var numResults = 0;
  var results = null;
  console.error("Getting a result.");

  var statement = this.dbConnection.createStatement(
    "SELECT results from mlab where test=:test and time=:time");

  statement.bindStringParameter(statement.getParameterIndex("test"), test);
  statement.bindInt64Parameter(statement.getParameterIndex("time"), time);

  while (statement.executeStep()) {
    if (numResults) {
      console.error("This query should not return multiple results.");
    }
    results = statement.row.results;
  }

  return results;
}

/**
 * Get all the results for a particular test.
 *
 * @param {string} test Test name.
 * @param {int} [after] Only retrieve tests after
 * this time.
 * @param {int} [before] Only retrieve tests before
 * this time.
 *
 * @returns {Object[]} Array of objects. .time
 * is set to the time of that result; .results
 * is set to the results themselves.
 */
Storage.prototype.getResults = function (test, after, before) {
  var statementString = "SELECT time, results from mlab where test=:test";
  var numResults = 0;
  var results = [];
  console.error("Getting a result.");

  var statement = null;

  if (after != null) {
    statementString += " and time>=:after";
  }
  if (before != null) {
    statementString += " and time<=:before";
  }

  statement = this.dbConnection.createStatement(statementString);

  statement.bindStringParameter(statement.getParameterIndex("test"), test);
  if (after != null) {
    statement.bindInt64Parameter(statement.getParameterIndex("after"), after);
  }
  if (before != null) {
    statement.bindInt64Parameter(statement.getParameterIndex("before"), before);
  }

  while (statement.executeStep()) {
    results.push({
      time: statement.row.time,
      results: statement.row.results});
  }
  return results;
}


/**
 * Get the storage object.
 * @name Storage.getStorage
 *
 * @return {Storage} The storage object.
 */
function getStorage() {
  if (storageSingleton == null) {
    storageSingleton = new Storage();
  }
  return storageSingleton;
}

exports.getStorage = getStorage;
