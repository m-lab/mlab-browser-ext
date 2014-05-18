/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Storage = require("./storage.js");

/**
 * This object will wait for done 
 * tests. It will take the results
 * and do something with them.
 * @constructor
 */

function Done() {
}

/**
 * Invoked when a test is done.
 * @param {Plugin} test The test that is done.
 */
Done.prototype.done = function (test) {
  console.error("Test done: " + test.toString() );
  console.error("Results: " + JSON.stringify(test.results) );
  var storage = Storage.getStorage();
  storage.storeResult(test, JSON.stringify(test.results));
}

exports.Done = Done;
