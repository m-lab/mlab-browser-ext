/* vim: set expandtab ts=2 sw: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var socketTransportService=Cc["@mozilla.org/network/socket-transport-service;1"]
                             .getService(Ci.nsISocketTransportService);
var BinaryInputStream = Cc["@mozilla.org/binaryinputstream;1"];
var BinaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"];
var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;
var File = components.utils.import("resource://gre/modules/FileUtils.jsm");

function ReaderConnection(transport) {
  this.transport = transport;
  this.bos = null;

  this.bytesRead = 0;
  this.started = new Date().getTime();

  this.buffer = new ArrayBuffer(1024);
};

ReaderConnection.prototype.connect = function () {
  this.input = this.transport.openInputStream(0, 0, 0);
  this.output = this.transport.openOutputStream(0, 0, 0);

  this.binput = BinaryInputStream.createInstance(Ci.nsIBinaryInputStream);
  this.binput.setInputStream(this.input);
}  

ReaderConnection.prototype.setOutputFile = function (filename) {
  var os = FileUtils.openFileOutputStream(new FileUtils.File(filename));    
  this.bos = BinaryOutputStream.createInstance(Ci.nsIBinaryOutputStream);
  this.bos.setOutputStream(os);
}

ReaderConnection.prototype.receivingData = function () {
  console.error("Receiving from!");
  try {
    while (this.input.available()) {
      var start, justRead, end; 
      //console.error("Bytes available: " + this.input.available());

      start = new Date().getTime();
      justRead = this.binput.readArrayBuffer(1024, this.buffer);
      end = new Date().getTime();

      if (this.bos != null)
        this.bos.writeByteArray(new Uint8Array(this.buffer, 0, justRead), 
                                justRead);

      this.bytesRead += justRead;
      /*
      console.error("Read " + justRead + "/" + this.input.available() + 
                    " bytes in elapsed: " + (end - start) + " ms");
      */
    }
  } catch (error) {
    if (error.result == Cr.NS_BASE_STREAM_CLOSED) {
      console.error("Closing (in BASE_STREAM_CLOSED)"); 
      console.error("Bytes read: " + this.bytesRead + 
                    " in " + ((new Date().getTime()) - this.started)  + 
                    " seconds.");
      
      this.transport.close(0);

      if (this.bos != null) {
        this.bos.close();
      }
    } else {
      console.error("oops: " + error.toString());
      console.error("but still read " + toread.value + 
                    "/" + toread.asked + 
                    " bytes");
    }
  }
}

ReaderConnection.prototype.onTransportStatus = function (transport, status, progress, max) {
  if (status == Ci.nsISocketTransport.STATUS_RESOLVING) {
  } else if (status === Ci.nsISocketTransport.STATUS_RESOLVED) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_CONNECTED_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_SENDING_TO) {
  } else if (status === Ci.nsISocketTransport.STATUS_WAITING_FOR) {
  } else if (status === Ci.nsISocketTransport.STATUS_RECEIVING_FROM) {
    this.receivingData();
  } else {
    console.error("status: " + status.toString());
  }
  console.error("Leaving onTransportStatus: " + this.bytesRead);
};

exports.ReaderConnection = ReaderConnection;
