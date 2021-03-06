/* vim: set expandtab ts=2 sw=2: */
gMaxVisibleResults = 10;

function getMaxVisibleResults() {
  return gMaxVisibleResults;
}

function setMaxVisibleResults(newMaxVisibleResults) {
  gMaxVisibleResults = newMaxVisibleResults;
}

function getTestDuration(testName) {
  self.port.emit("getTestDuration", testName);
}

function listTests() {
  self.port.emit("listTests");
}

function startTest(testName) {
  console.error("starting test: " + testName);
  self.port.emit("startTest", testName);
}

function listTestPreferences(testName) {
  console.error("listTestPreferences.");
  self.port.emit("listTestPreferences", testName);
}

function setVisibleTest(testName) {
  console.error("Setting visible test: " + testName);
  self.port.emit("setVisibleTest", testName);
}

function setTestTitle(testTitle) {
  var titleElement = document.getElementById("TestInfoAreaTitle");
  while (titleElement.firstChild) {
    titleElement.removeChild(titleElement.firstChild);
  }
  titleElement.appendChild(document.createTextNode(testTitle));
}

function setTestBody(testBody) {
  var bodyElement = document.getElementById("TestInfoAreaBody");
  var div = document.createElement('div');
  while (bodyElement.firstChild) {
    bodyElement.removeChild(bodyElement.firstChild);
  }
  div.innerHTML = testBody;
  bodyElement.appendChild(div);
}

self.port.on("testTitle", function (testTitle) {
  setTestTitle(testTitle);
});

self.port.on("testDescription", function (testDescription) {
  setTestBody(testDescription);
});

function updatePreference(preferenceId) {
  /*
   * We need to closure this off.
   * Stupid javascript.
   */
  return function () {
    var preferenceIdParts = preferenceId.split(":");
    var test = preferenceIdParts[0];
    var type = preferenceIdParts[1];
    var preference = preferenceIdParts[2];
    var element = document.getElementById(preferenceId);
    var value;

    if (type == "boolean") {
      value = element.checked ? "true" : "false";
    } else if (type == "int") {
      var intValue = parseInt(element.value, 10);
      if (isNaN(intValue)) {
        alert("Error: Expecting a number.");
        return;
      }
      value = intValue;
    }
    else {
      value = element.value;
    }

    self.port.emit("setTestPreference", { test: test,
      type: type,
      key: preference,
      value: value}
    );
  }
}

function renderPreference(renderElement, preference) {
  var prefType = preference.type;
  var prefKey = preference.key;
  var prefValue = (typeof(preference.value) !== 'undefined') ?
    preference.value :
    preference.defaultValue;
  var prefTest = preference.test;
  var prefDescription = preference.description;

  var containerElement = document.createElement('div');
  var labelElement = document.createElement('label');
  var inputElement = document.createElement('input');

  labelElement.htmlFor = prefTest + ":" + prefKey;
  labelElement.appendChild(document.createTextNode(prefDescription));
  inputElement.name = prefTest + ":" + prefKey;
  inputElement.id = prefTest + ":" + prefType + ":" + prefKey;
  inputElement.onchange = updatePreference(inputElement.id);

  if (prefType == "boolean") {
    inputElement.type = "checkbox";
    inputElement.checked = prefValue;
  } else if (prefType == "string") {
    inputElement.type = "text";
    inputElement.value = prefValue;
  } else if (prefType == "int") {
    inputElement.type = "text";
    inputElement.value = prefValue;
  }

  containerElement.appendChild(labelElement);
  containerElement.appendChild(inputElement);

  renderElement.appendChild(containerElement);
}

function generateResultsClickHandler(testName) {
  return function () {
    setMaxVisibleResults(10);
    setVisibleTest(testName);
    generateTestResults(testName);
  };
}

function generateRunTestClickHandler(testName) {
  return function () {
    startTest(testName);
  }
}

function generateAccordianHandler(testName) {
  return function () {
    var element = document.getElementById(testName + "_PreferencesArea");
    if (!element) return;
    if (element.style.display == 'block') {
      element.style.display = 'none';
    } else {
      element.style.display = 'block';
    }
  }
}

function renderTest(testName) {
  var testContainerElement, titleElement, listContainerElement,
      preferencesElement, startElement, preferencesTitleElement,
      actionsTitleElement, resultsElement;

  listContainerElement = document.getElementById("TestArea");

  testContainerElement = document.createElement('div');
  testContainerElement.id = testName;


  titleElement = document.createElement('h2');
  titleElement.id = "TabTitle:" + testName;
  titleElement.appendChild(document.createTextNode(testName));

  actionsTitleElement = document.createElement('h3');
/*
  actionsTitleElement.appendChild(document.createTextNode("Actions:"));
*/
  startElement = document.createElement('a');
  startElement.classList.add("ui_link");
  startElement.onclick = generateRunTestClickHandler(testName);
  startElement.appendChild(document.createTextNode("Start a test"));

  preferencesTitleElement = document.createElement('a');
  preferencesTitleElement.classList.add("ui_link");
  preferencesTitleElement.onclick = generateAccordianHandler(testName);
  preferencesTitleElement.appendChild(document.createTextNode("Preferences"));

  preferencesElement = document.createElement('div');
  preferencesElement.id = testName + "_PreferencesArea";
  preferencesElement.className = "Preferences";

  resultsElement = document.createElement('a');
  resultsElement.classList.add("ui_link");
  resultsElement.onclick = generateResultsClickHandler(testName);
  resultsElement.appendChild(document.createTextNode("Results"));

  testContainerElement.appendChild(titleElement);
  testContainerElement.appendChild(startElement);
  testContainerElement.appendChild(resultsElement);
  testContainerElement.appendChild(preferencesTitleElement);
  testContainerElement.appendChild(preferencesElement);
  testContainerElement.appendChild(actionsTitleElement);

  listContainerElement.appendChild(testContainerElement);
  testContainerElement.appendChild(document.createElement('br'));


  listTestPreferences(testName);
}

self.port.on("tests", function (tests) {
  for (test in tests) {
    console.error("test: " + tests[test]);
    renderTest(tests[test]);
  }
});

self.port.on("initialize", function () {
  console.error("initialize");
  listTests();
});

self.port.on("testStarted", function (test) {
  var runningElement = null, labelElement = null;
  runningElement = document.getElementById("test-running");
  if (!runningElement) { return; }
  runningElement.style.visibility = "visible";
  getTestDuration(test);
});

self.port.on("testDuration", function (td) {
  var labelElement = null, runningElement = null;
  runningElement = document.getElementById("test-running");
  labelElement = document.getElementById("test-running-label");
  if (runningElement != null && runningElement.style.visibility == "visible") {
    var minutes = 0, seconds = 0, time = "";
    if (td.duration > 0) {
      minutes = Math.floor(td.duration / 60.0);
      seconds = td.duration % 60;
      if (minutes>0) {
        time = "" + minutes + " minute";
        if (minutes>1) {
          time += "s";
        }
        time += " ";
      }
      if (seconds>0) {
        time += "" + seconds + " second";
        if (seconds>1) {
          time += "s";
        }
      }
    }
    var message = td.name + " is running.";
    if (time != "") {
      message += " Test will take approximately " + time + "."
    }
    var textNode = document.createTextNode(message);
    labelElement.appendChild(textNode);
  }
});

self.port.on("testStopped", function (test) {
  var runningElement = null, labelElement = null;
  runningElement = document.getElementById("test-running");
  if (!runningElement) { return; }
  runningElement.style.visibility = "hidden";
  labelElement = document.getElementById("test-running-label");
  while (labelElement.firstChild) {
    labelElement.removeChild(labelElement.firstChild);
  }
});

window.addEventListener("beforeunload", function (e) {
  self.port.emit("unload");
});
