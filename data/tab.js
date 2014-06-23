/* vim: set expandtab ts=2 sw=2: */
function listTests() {
  self.port.emit("listTests");
}

function startTest(testName) {
  console.error("starting test: " + testName);
  self.port.emit("startTest", testName);
}

function listTestPreferences(testName) {
  console.error("listTestPreferendces.");
  self.port.emit("listTestPreferences", testName);
}

function openTab(tabName) {
  self.port.emit("openTab", tabName);
}

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
    listTestResults(testName);
  };
}

function generateRunTestClickHandler(testName) {
  return function () {
    startTest(testName);
  }
}

function renderTest(testName) {
  var testContainerElement, titleElement, listContainerElement,
      preferencesElement, resultsElement, startElement;

  listContainerElement = document.getElementById("TestArea");

  testContainerElement = document.createElement('div');
  testContainerElement.id = testName;

  titleElement = document.createElement('h3');
  titleElement.appendChild(document.createTextNode(testName));

  resultsElement = document.createElement('a');
  resultsElement.onclick = generateResultsClickHandler(testName);
  resultsElement.appendChild(document.createTextNode("Results..."));

  startElement = document.createElement('a');
  startElement.onclick = generateRunTestClickHandler(testName);
  startElement.appendChild(document.createTextNode("Start a test."));

  preferencesElement = document.createElement('div');
  preferencesElement.id = testName + "_PreferencesArea";

  testContainerElement.appendChild(titleElement);
  testContainerElement.appendChild(document.createElement('br'));
  testContainerElement.appendChild(preferencesElement);
  testContainerElement.appendChild(document.createElement('br'));
  testContainerElement.appendChild(startElement);
  testContainerElement.appendChild(document.createElement('br'));
  testContainerElement.appendChild(resultsElement);
  testContainerElement.appendChild(document.createElement('br'));
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

window.addEventListener("unload", function e(e) {
  self.port.emit("unload");
});
