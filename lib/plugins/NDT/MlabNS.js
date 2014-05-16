/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
Cu.import("resource://gre/modules/NetUtil.jsm");

function MlabNS() {
}

MlabNS.prototype.resolve = function () {
  var channel = null;
  var stream = null;
  var result = null;
  var jResult = null;

  channel = NetUtil.newChannel("https://mlab-ns.appspot.com/ndt");
  stream = channel.open();

  if (!stream || stream.available() == 0)
    return null;
  
  result = NetUtil.readInputStreamToString(stream,stream.available(),null);

  stream.close();

  if (result) {
    try {
      jResult = JSON.parse(result.toString());
    } catch (e) {
    }
  }
  return (jResult != null) ? jResult.fqdn : null;
}

exports.MlabNS = MlabNS;
