/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/*
 * This object will wait for done 
 * tests. It will take the results
 * and do something with them.
 */

function Done() {
}

Done.prototype.done = function (test) {
  console.error("Test done: " + test.toString() );
  console.error("Results: " + JSON.stringify(test.results) );
}

exports.Done = Done;
