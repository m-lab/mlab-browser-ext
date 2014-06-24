/* vim: set expandtab ts=2 sw=2: */
var {components, Cc, Ci, Cr, Cu} = require("chrome");
var Constants = require("./Constants.js");

function range(begin, end) {
  for (let i = begin; i < end; ++i) {
    yield i;
  }
}

exports.range = range;

function genericParseTLString(b) {
  var type, length, value;
  if (!b.BYTES_PER_ELEMENT || b.BYTES_PER_ELEMENT != 1) {
    console.error("Incorrect parameter type!");
    return -1;
  }

  length = b[1];
  length = length << 8;
  length += b[2];

  this.type = b[0];
  this.value = [
    String.fromCharCode(b[i+3]) for (i in range(0, length))
    ].join("");
}

function readRawBytes(stream, length) {
  try {
    return new Uint8Array(stream.readByteArray(length));
  } catch (NS_ERROR_FAILURE) {
    return -1;
  }
}

function readRawBytesTlv(stream) {
  var type = 0, length = 0, bytes, haveRead = 0;
  type = stream.read8();
  length = stream.read16();

  bytes = new Uint8Array(new ArrayBuffer(length+3));
  bytes[0] = type;
  bytes[1] = (length & 0xff00) >>> 8;
  bytes[2] = (length & 0xff);
  try {
    while (haveRead < length) {
      bytes.set(new Uint8Array([stream.read8()]), 3 + haveRead);
      haveRead++;
    }
  } catch (e) {
    console.error("Caught: " + e.toString());
  }
  return bytes;
}

exports.genericParseTLString = genericParseTLString;
exports.readRawBytes = readRawBytes;
exports.readRawBytesTlv = readRawBytesTlv;
