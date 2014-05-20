function startTest(testName) {
  addon.port.emit("startTest", testName);
}

function listTestResults(testName) {
  addon.port.emit("listTestResults", testName);
}

function getTestResult(testName, testTime) {
  addon.port.emit("getTestResult", { test: testName, time: testTime});
}

addon.port.on("testResult", function (test) {
  var testTest, testTime, testResults;
  testResult = test.result;
  testTest = test.test;
  testTime = test.time;

  var resultArea = document.getElementById("MajorResultArea");
  while (resultArea.firstChild) {
    resultArea.removeChild(resultArea.firstChild);
  }
  resultArea.appendChild(document.createTextNode(testResult));
});

addon.port.on("testDone", function (test) {
  var testTime, testTest;
  
  testTime = test.time;
  testTest = test.test;

  listTestResults(testTest);
});

function closeGetTestResult(test, date) {
  return function (e) { getTestResult(test, date); };
}

addon.port.on("testResultsList", function (test) {
  var testResults, testTest, resultsList;

  /*
   * We want to reverse chronologically
   * sort the results.
   */
  testResults = test.results.sort(function(a,b) {
    return parseInt(b, 10) - parseInt(a, 10);
  });
  testTest = test.test;

  resultsList = document.getElementById(testTest + "-ResultsList");

  while (resultsList.firstChild) {
    resultsList.removeChild(resultsList.firstChild);
  }

  for (i in testResults) {
    var formattedTime = new Date(testResults[i]);
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.onclick = closeGetTestResult(testTest, testResults[i]);
    a.appendChild(document.createTextNode(formattedTime));
    li.appendChild(a);
    resultsList.appendChild(li);
  }
});
