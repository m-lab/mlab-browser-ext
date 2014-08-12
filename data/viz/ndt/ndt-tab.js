/* vim: set expandtab ts=2 sw=2: */
self.port.on("NDT.testResults", function (results) {

  /*
   * Graph generation code originally from
   * http://bl.ocks.org/mbostock/3884955.
   */
  var margin = {top: 20, right: 20, bottom: 60, left: 50},
      width = 500 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  var x = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(10)
      .tickFormat(function (d) {
        if (d>=0) {
          return d3.time.format('%b %d')(new Date(d));
        } else {
          return "";
        }
      });

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return x(d.uTime); })
      .y(function(d) { return y(d.value); });

  var tooltip = d3.select("#tooltip");

  var resultsIterator = 0, resultsCounter = 0, min = 0, max = 0;

  var resultGraphArea = document.getElementById("GraphResultsArea");

  while (resultGraphArea.firstChild) {
    resultGraphArea.removeChild(resultGraphArea.firstChild);
  }
  var svg = d3.select("#GraphResultsArea").append("svg")
        .attr("width", width + margin.left + margin.right + 50/*label fudge*/)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = [
  {
    test: "C2S",
    prettyName: "Upload",
    color: "red",
    values: []
  },
  {
    test: "S2C",
    prettyName: "Download",
    color: "blue",
    values: []
  }];

  function findTestIndex(testName, data) {
    for (i in data) {
      if (data[i].test == testName) return i;
    }
    return 0;
  }

  for (resultsIterator in results.results) {
    var resultsTime = new Date(results.results[resultsIterator].time);
    var uTime = results.results[resultsIterator].time;
    var resultsParsed = JSON.parse(results.results[resultsIterator].results);
    if (resultsParsed["C2S"]) {
      var newValue = {
        time: resultsTime,
        uTime: uTime,
        value: parseInt(resultsParsed["C2S"].throughput, 10)/1024.0
        };
      data[findTestIndex("C2S", data)].values.push(newValue);
    }
    if (resultsParsed["S2C"]) {
      var download = 0;
      if (parseInt(resultsParsed["S2C"]["exceptions"]) > 0) {
        console.error("Exceptions; falling back. (graph)");
        var downloadString = resultsParsed["S2C"]["throughput"];
        var downloadStringArray = downloadString.split(" ");
        download = parseInt(downloadStringArray[0], 10) / 1024.00;
      } else {
        download = parseInt(resultsParsed["S2C"]["cthroughput"], 10) / 1024.00;
      }
      var newValue = {
        time: resultsTime,
        uTime: uTime,
        value: download
        };
      data[findTestIndex("S2C", data)].values.push(newValue);
    }
    resultsCounter++;
  }

  /*
   * Insert dummy values so that our graph always
   * looks pretty.
   */
  while (resultsCounter<10) {
    var newValue = {
        time: -1,
        uTime: -1 * resultsCounter - 1,
        value: 0
        };
    data[findTestIndex("S2C", data)].values.push(newValue);
    data[findTestIndex("C2S", data)].values.push(newValue);

    newValue = {
        time: -1,
        uTime: -1 * resultsCounter - 1,
        value: 100
        };
    data[findTestIndex("S2C", data)].values.push(newValue);
    data[findTestIndex("C2S", data)].values.push(newValue);
    resultsCounter++;
  }

  min = d3.min(data, function(d) {
      return d3.min(d.values, function(v) {
        if (v.uTime == -1) {
          return Number.MAX_VALUE;
        } else {
          return v.uTime;
        }
      })
    });
  max = d3.max(data, function(d) {
      return d3.max(d.values, function(v) {
        return v.uTime;
      })
    });
  x.domain(data[0].values.map(function (d) { return d.uTime;}));
  x.rangePoints([width, 0]);

  min = d3.min(data, function(d) {
      return d3.min(d.values, function(v) {
        return v.value;
      })
    });
  max = d3.max(data, function(d) {
      return d3.max(d.values, function(v) {
        return v.value;
      })
    });
  y.domain([min, max]);

  /*
   * And now filter those values so that
   * the graph doesn't look messy.
   */
  data[findTestIndex("S2C", data)].values =
    data[findTestIndex("S2C", data)].values.filter(function (d) {
      return (d.uTime>=0);
    }
  );
  data[findTestIndex("C2S", data)].values =
    data[findTestIndex("C2S", data)].values.filter(function (d) {
      return (d.uTime>=0);
    }
  );

  svg.append("g")
     .attr("class", "x axis")
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis)
     .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-55)" 
            });

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

  if (resultsCounter!=-1) {
    testLine.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return d.color; });

    testLine.append("text")
        .datum(function(d) { return {
              name: d.prettyName,
              value: d.values[0]
            };
          })
        .attr("transform", function(d) {
          return "translate("+x(d.value.uTime)+","+y(d.value.value)+")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    svg.selectAll(".circle")
      .data(data[findTestIndex("S2C", data)].values)
      .enter()
      .append("circle")
      .attr("class", "results-dot")
      .attr("r", 3.5)
      .attr("cx", function (d) { return x(d.uTime); })
      .attr("cy", function (d) { return y(d.value); })
      .attr("id", function (d) {return "dot:S2C:" + d.uTime; })
      .on("mouseover", function (d) {
        var element = document.getElementById("resultContainer:" + d.uTime);
        element.classList.add("hoveredResult");
        element = document.getElementById("dot:S2C:" + d.uTime);
        element.classList.add("results-dot-hover");
        element = document.getElementById("dot:C2S:" + d.uTime);
        element.classList.add("results-dot-hover");
        tooltip.style("visibility", "visible");
        tooltip.text(d.value);
        tooltip.style("top", (d3.event.pageY-10)+"px")
          .style("left",(d3.event.pageX+15)+"px")
          .style("background-color", "blue");
      })
      .on("mouseout", function (d) {
        var element = document.getElementById("resultContainer:" + d.uTime);
        element.classList.remove("hoveredResult");
        element = document.getElementById("dot:S2C:" + d.uTime);
        element.classList.remove("results-dot-hover");
        element = document.getElementById("dot:C2S:" + d.uTime);
        element.classList.remove("results-dot-hover");
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (d) {
        var element = document.getElementById("input:" + d.uTime);
        element.checked = !element.checked;
      });

    svg.selectAll(".circle")
      .data(data[findTestIndex("C2S", data)].values)
      .enter()
      .append("circle")
      .attr("class", "results-dot")
      .attr("r", 3.5)
      .attr("cx", function (d) { return x(d.uTime); })
      .attr("cy", function (d) { return y(d.value); })
      .attr("id", function (d) {return "dot:C2S:" + d.uTime; })
      .on("mouseover", function (d) {
        var element = document.getElementById("resultContainer:" + d.uTime);
        element.classList.add("hoveredResult");
        element = document.getElementById("dot:S2C:" + d.uTime);
        element.classList.add("results-dot-hover");
        element = document.getElementById("dot:C2S:" + d.uTime);
        element.classList.add("results-dot-hover");
        tooltip.style("visibility", "visible");
        tooltip.text(d.value);
        tooltip.style("top", (d3.event.pageY-10)+"px")
          .style("left",(d3.event.pageX+15)+"px")
          .style("background-color", "red");
      })
      .on("mouseout", function (d) {
        var element = document.getElementById("resultContainer:" + d.uTime);
        element.classList.remove("hoveredResult");
        element = document.getElementById("dot:S2C:" + d.uTime);
        element.classList.remove("results-dot-hover");
        element = document.getElementById("dot:C2S:" + d.uTime);
        element.classList.remove("results-dot-hover");
        tooltip.style("visibility", "hidden");
      })
      .on("click", function (d) {
        var element = document.getElementById("input:" + d.uTime);
        element.checked = !element.checked;
      });
  }
});

self.port.on("NDT.testResult", function (test) {
  var testTest, testTime, testResult, testResultParsed;
  var upload = 0.0, download = 0.0;
  var error = null;
  testResult = test.result;
  testTest = test.test;
  testTime = test.time;

  testResultParsed = JSON.parse(testResult);

  if (testResultParsed["error"]) {
    error = testResultParsed["error"];
  } else {
    if (parseInt(testResultParsed["S2C"]["exceptions"]) > 0) {
      console.error("Exceptions; falling back. (list)");
      var downloadString = testResultParsed["S2C"]["throughput"];
      var downloadStringArray = downloadString.split(" ");
      download = parseFloat(downloadStringArray[0]) / 1024.00;
    } else {
      download = parseFloat(testResultParsed["S2C"]["cthroughput"]) / 1024.00;
    }
    upload = parseFloat(testResultParsed["C2S"]["throughput"]) / 1024.00;

    upload = upload.toFixed(2);
    download = download.toFixed(2);
  }

  var resultArea = document.getElementById("result:" + testTime);
  while (resultArea.firstChild) {
    resultArea.removeChild(resultArea.firstChild);
  }
  if (error != null) {
    resultArea.appendChild(document.createTextNode("Error: "+error));
  } else {
    resultArea.appendChild(document.createTextNode("Upload: "+upload+"Mbps"));
    resultArea.appendChild(document.createElement("br"));
    resultArea.appendChild(document.createTextNode("Download: " +
      download +
      "Mbps"));
  }
});

self.port.on("NDT.testDone", function (test) {
  var testTime, testTest;

  testTime = test.time;
  testTest = test.test;

  generateTestResults(testTest);
});

function generateResultMouseOverHandler(testTime) {
  return function () {
    var element = document.getElementById("dot:S2C:" + testTime);
    element.classList.add("results-dot-hover");
    element = document.getElementById("dot:C2S:" + testTime);
    element.classList.add("results-dot-hover");
  }
}

function generateResultMouseOutHandler(testTime) {
  return function () {
    var element = document.getElementById("dot:S2C:" + testTime);
    element.classList.remove("results-dot-hover");
    element = document.getElementById("dot:C2S:" + testTime);
    element.classList.remove("results-dot-hover");
  }
}

self.port.on("NDT.testResultsList", function (test) {
  console.error("We are here.");
  var testResults, resultsList, testTest = "NDT";

  /*
   * We want to reverse chronologically
   * sort the results.
   */
  testResults = test.results.sort(function(a,b) {
    return parseInt(b, 10) - parseInt(a, 10);
  });
  testTest = "NDT";

  resultsList = document.getElementById("ResultsList");

  while (resultsList.firstChild) {
    resultsList.removeChild(resultsList.firstChild);
  }


  if (testResults.length == 0) {
      var div = document.createElement("div");

      div.className = "noResults";
      div.appendChild(document.createTextNode("No results yet."));

      resultsList.appendChild(div);
  } else {
    for (i in testResults) {
      var formattedTime = new Date(testResults[i]);
      var div = document.createElement("div");
      var input = document.createElement("input");
      var label = document.createElement("label");
      var resultsDiv = document.createElement("div");

      div.id = "resultContainer:" + testResults[i];
      div.onmouseover = generateResultMouseOverHandler(testResults[i]);
      div.onmouseout = generateResultMouseOutHandler(testResults[i]);

      input.id = "input:" + testResults[i];
      input.type = "checkbox";
      label.htmlFor = input.id;

      resultsDiv.id = "result:" + testResults[i];
      resultsDiv.className = "testresult";

      label.appendChild(document.createTextNode((+i+1) + ". " + formattedTime));
      div.appendChild(input);
      div.appendChild(label);
      div.appendChild(resultsDiv);

      resultsList.appendChild(div);

      getTestResult(testTest, testResults[i]);
    }
  }
});

self.port.on("NDT.testPreferences", function (testPreferences) {
  for (i in testPreferences) {
    self.port.emit("getTestPreference", { test: "NDT",
      key: testPreferences[i].key,
      type: testPreferences[i].type,
      description: testPreferences[i].description,
      defaultValue: testPreferences[i].defaultValue
      });
  }
});

self.port.on("NDT.testPreference", function (testPreference) {
  renderPreference(document.getElementById("NDT_PreferencesArea"), testPreference);
});
