function generateTestResults(testName, after, before, max) {
  if (max == null) {
    max = getMaxVisibleResults();
  }

  console.error("listTestResults!");

  listTestResults(testName, after, before, max);
  getTestResults(testName, after, before, max);
  getTestBody(testName);
  getTestTitle(testName);
}

function listTestResults(testName, after, before, max) {
  self.port.emit("listTestResults", testName, after, before, max);
}

function getTestResult(testName, testTime) {
  self.port.emit("getTestResult", { test: testName, time: testTime});
}

function getTestResults(testName, after, before, max) {
  self.port.emit("getTestResults", testName, after, before, max);
}

function getTestTitle(testName) {
  self.port.emit("getTestTitle", testName);
}

function getTestBody(testName) {
  self.port.emit("getTestDescription", testName);
}
