/* vim: set expandtab ts=2 sw=2: */
addon.port.on("NDT.testResults", function (results) {
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 260 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.value); });

  var resultGraphArea = document.getElementById("NDT_GraphResultsArea");
  while (resultGraphArea.firstChild) {
    resultGraphArea.removeChild(resultGraphArea.firstChild);
  }
  var svg = d3.select("#NDT_GraphResultsArea").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = [
  {
    test: "C2S",
    values: []
  },
  {
    test: "S2C",
    values: []
  }];

  function findTestIndex(testName, data) {
    for (i in data) {
      if (data[i].test == testName) return i;
    }
    return 0;
  }

  for (i in results.results) {
    var resultsTime = new Date(results.results[i].time);
    var resultsParsed = JSON.parse(results.results[i].results);
    var newValue = {
      time: resultsTime,
      value: parseInt(resultsParsed["C2S"].throughput, 10)/1000.0
      };
    data[findTestIndex("C2S", data)].values.push(newValue);
    newValue = {
      time: resultsTime,
      value: parseInt(resultsParsed["S2C"].throughput, 10)/1000.0
      };
    data[findTestIndex("S2C", data)].values.push(newValue);
  }

  x.domain([
    d3.min(data, function(d) {
      return d3.min(d.values, function(v) {
        return v.time;
      })
    }),
    d3.max(data, function(d) {
      return d3.max(d.values, function(v) {
        return v.time;
      })
    }),
  ]);

  y.domain([
    d3.min(data, function(d) {
      return d3.min(d.values, function(v) {
        return v.value;
      })
    }),
    d3.max(data, function(d) {
      return d3.max(d.values, function(v) {
        return v.value;
      })
    }),
  ]);

  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "y axis")
     .call(yAxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("Speed (Mbps)");

  var testLine = svg.selectAll(".test")
                .data(data)
                .enter().append("g")
                .attr("class", "testLine");

  testLine.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); });
});

addon.port.on("NDT.testResult", function (test) {
  var testTest, testTime, testResults;
  testResult = test.result;
  testTest = test.test;
  testTime = test.time;

  var resultArea = document.getElementById("NDT_MajorResultArea");
  while (resultArea.firstChild) {
    resultArea.removeChild(resultArea.firstChild);
  }
  resultArea.appendChild(document.createTextNode(testResult));
});

addon.port.on("NDT.testDone", function (test) {
  var testTime, testTest;

  testTime = test.time;
  testTest = test.test;

  listTestResults(testTest);
});

function closeGetTestResult(test, date) {
  return function (e) { getTestResult(test, date); };
}

addon.port.on("NDT.testResultsList", function (test) {
  var testResults, resultsList, testTest = "NDT";

  /*
   * We want to reverse chronologically
   * sort the results.
   */
  testResults = test.results.sort(function(a,b) {
    return parseInt(b, 10) - parseInt(a, 10);
  });
  testTest = "NDT";

  resultsList = document.getElementById("NDT_ResultsList");

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

addon.port.on("NDT.testPreferences", function (testPreferences) {
  for (i in testPreferences) {
    addon.port.emit("getTestPreference", { test: "NDT",
      key: testPreferences[i].key,
      type: testPreferences[i].type,
      description: testPreferences[i].description
      });
  }
});

addon.port.on("NDT.testPreference", function (testPreference) {
  renderPreference(document.getElementById("NDT_PreferencesArea"), testPreference);
});
