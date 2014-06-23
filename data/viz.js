function listTestResults(testName) {
  console.error("listTestResults!");
  self.port.emit("listTestResults", testName);
  getTestResults(testName);
}

function getTestResult(testName, testTime) {
  self.port.emit("getTestResult", { test: testName, time: testTime});
}

function getTestResults(testName) {
  self.port.emit("getTestResults", testName);
}


