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

function getStorage() {
  if (storageSingleton == null) {
    storageSingleton = new Storage();
  }
  return storageSingleton;
}

exports.getStorage = getStorage;
