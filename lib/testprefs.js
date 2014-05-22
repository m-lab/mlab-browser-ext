/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var SimplePreferences = require("sdk/simple-prefs");

function TestPrefs() {
}

TestPrefs.prototype.setPreference = function (test, prefName, prefValue) {
  SimplePreferences.prefs[test + "." + prefName] = prefValue;
}

TestPrefs.prototype.getPreference = function (test, prefName) {
  return SimplePreferences.prefs[test + "." + prefName];
}

exports.TestPrefs = TestPrefs;
