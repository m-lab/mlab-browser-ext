/* vim: set expandtab ts=2 sw=2: */
function startTest(testName) {
  addon.port.emit("startTest", testName);
}

function listTestResults(testName) {
  addon.port.emit("listTestResults", testName);
  getTestResults(testName);
}

function getTestResult(testName, testTime) {
  addon.port.emit("getTestResult", { test: testName, time: testTime});
}

function getTestResults(testName) {
  addon.port.emit("getTestResults", testName);
}
