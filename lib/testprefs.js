/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var SimplePreferences = require("sdk/simple-prefs");

/**
 * Abstraction for the SDK's simple-prefs API
 * @constructor
 */
function TestPrefs() {
}

/**
 * Set a test preference's value.
 *
 * @param {string} test The name of the test that
 * should be associated with this preference.
 * @param {string} prefKey The key of the preference.
 * @param {Object} value The value to be stored for that
 * preference.
 */
TestPrefs.prototype.setPreference = function (test, prefKey, prefValue) {
  SimplePreferences.prefs[test + "." + prefKey] = prefValue;
}

/**
 * Get a test preference's value.
 *
 * @param {string} test The name of the test that
 * should be associated with this preference.
 * @param {string} prefKey The key of the preference.
 *
 * @return {Object} The preference's value.
 */
TestPrefs.prototype.getPreference = function (test, prefKey) {
  return SimplePreferences.prefs[test + "." + prefKey];
}

exports.TestPrefs = TestPrefs;
