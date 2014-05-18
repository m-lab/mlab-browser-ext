/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var dirService = Cc["@mozilla.org/file/directory_service;1"].
  getService(Ci.nsIProperties);
var dbService = Cc["@mozilla.org/storage/service;1"].
  getService(Ci.mozIStorageService);
var storageSingleton = null;

function Storage() {
  var create = false;
  var dbFile = dirService.get("ProfD", Ci.nsIFile);
  dbFile.append("mlab.sqlite");

  if (!dbFile.exists()) {
    create = true; 
  }
  this.dbConnection = dbService.openDatabase(dbFile);
  if (create) {
    this.dbConnection.createTable("mlab", 
      "test STRING, time INTEGER, results TEXT");
  }
}

Storage.prototype.storeResult = function (test, results) {
  console.error("Storing result.");
  var statement = this.dbConnection.createStatement("INSERT INTO mlab (test, time, results) VALUES (:test, :time, :results)");
  console.error("Statement: " + statement.toString());
  statement.bindStringParameter(statement.getParameterIndex("test"), test);
  statement.bindInt64Parameter(statement.getParameterIndex("time"), Date.now());
  statement.bindStringParameter(statement.getParameterIndex("results"), results);
  /*
  statement.params.test = test;
  statement.params.time = Date.now();
  statement.params.results = results;
*/
  console.error("Statement: " + statement.toString());
  
  statement.executeAsync({
    handleError: function (error) {
      console.error("Error: " + error.toString());
    },
    handleCompletion: function (reason) {
      console.error("Completed: " + reason.toString());
    },
    });
}

function getStorage() {
  if (storageSingleton == null) {
    storageSingleton = new Storage();
  }
  return storageSingleton;
}

exports.getStorage = getStorage;
