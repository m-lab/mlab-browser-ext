/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");

/** 
 * The superclass for all plugins.
 * @constructor
 */
function Plugin() {
}

/**
 * Initialize a plugin.
 * 
 * @abstract
 * @param {string[]} params An array of parameters.
 */
Plugin.prototype.init = function (params) {
}

/** 
 * Run the plugin test.
 *
 * @abstract
 * @param {Done} done The Done object to tell 
 * the plugin-runner we are done.
 */
Plugin.prototype.runTest = function (done) {
}

/**
 * Make us a string! Important because the 
 * plugin-runner uses this to organize
 * and store results.
 *
 * @abstract
 * @returns {String} Name of the plugin.
 */
Plugin.prototype.toString = function () {
}

/**
 * Get the array defining all available
 * preferences for this Plugin.
 *
 * @return {Object[]} An array of Objects, each
 * of which has the following keys:
 * .type: The type of the preference
 * .key: The preference identifier
 * .defaultValue: The preference's default value.
 * .description: A human-readable description
 * of the preference.
 */
Plugin.prototype.getPreferences = function () {
}

exports.Plugin = Plugin;
