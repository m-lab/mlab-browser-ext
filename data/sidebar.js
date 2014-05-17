function startTest(testName) {
  addon.port.emit("startTest", testName);
}
