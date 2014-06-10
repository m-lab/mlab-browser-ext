/* vim: set expandtab ts=2 sw=2: */
function startTest(testName) {
  addon.port.emit("startTest", testName);
}

function listTestResults(testName) {
  addon.port.emit("listTestResults", testName);
  getTestResults(testName);
}

function listTestPreferences(testName) {
  addon.port.emit("listTestPreferences", testName);
}

function getTestResult(testName, testTime) {
  addon.port.emit("getTestResult", { test: testName, time: testTime});
}

function getTestResults(testName) {
  addon.port.emit("getTestResults", testName);
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

    addon.port.emit("setTestPreference", { test: test,
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
