function listTestResults(testName) {
  console.error("listTestResults!");
  self.port.emit("listTestResults", testName);
  getTestResults(testName);
  getTestBody(testName);
  getTestTitle(testName);
}

function getTestResult(testName, testTime) {
  self.port.emit("getTestResult", { test: testName, time: testTime});
}

function getTestResults(testName) {
  self.port.emit("getTestResults", testName);
}

function getTestTitle(testName) {
  self.port.emit("getTestTitle", testName);
}

function getTestBody(testName) {
  self.port.emit("getTestDescription", testName);
}
