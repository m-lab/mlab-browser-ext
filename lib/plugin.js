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
 * @param {array} params An array of parameters.
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
 */
Plugin.prototype.toString = function () {
}

exports.Plugin = Plugin;

