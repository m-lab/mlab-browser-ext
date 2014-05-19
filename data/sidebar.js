function startTest(testName) {
  addon.port.emit("startTest", testName);
}

addon.port.on("testDone", function (test) {
  var testTime, testTest;
  
  testTime = test.time;
  testTest = test.test;

  alert("test (" + testTest + ") was done at " + testTime);
});
