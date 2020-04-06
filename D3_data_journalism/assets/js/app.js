var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 10,
  right: 40,
  bottom: 110,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//All in our chart is 1 group
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.75, d3.max(stateData, d => d[chosenXAxis]) * 1.1])
    .range([0, width]);
  return xLinearScale;
}
function yScale(stateData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.25, d3.max(stateData, d => d[chosenYAxis]) * 1.15])
    .range([height, 0]);
  return yLinearScale;
}

// function used for updating xAxis and yAxis var upon click on axes labels
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderCirclesText(circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesText.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]) - 5)
    .attr("dy", d => newYScale(d[chosenYAxis]) + 3);
  return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label1 = "In Poverty: ";
  }
  else if (chosenXAxis === "age") {
    var label1 = "Age (Median): ";
  }
  else {
    var label1 = "Household Income (Median): ";
  }

  if (chosenYAxis === "obesity") {
    var label2 = "Obese (%) ";
  }
  else if (chosenYAxis === "healthcare") {
    var label2 = "Lacks Healthcare (%) ";
  }
  else {
    var label2 = "Smokes (%) ";
  }
  if (chosenXAxis === "poverty") {
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>${label1} ${d[chosenXAxis]}% <br>${label2} ${d[chosenYAxis]}%`);
      })
  }
  else {
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>${label1} ${d[chosenXAxis]}<br>${label2} ${d[chosenYAxis]}%`);
      })
  }
  chartGroup.call(toolTip);
  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (stateData) {

  // parse data
  stateData.forEach(function (i) {
    i.poverty = +i.poverty;
    i.age = +i.age;
    i.income = +i.income;
    i.obesity = +i.obesity;
    i.healthcare = +i.healthcare;
    i.smokes = +i.smokes;
  });

  // xLinearScale & yLinearScale
  var xLinearScale = xScale(stateData, chosenXAxis);
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // new group for circles and text:
  var elemEnter = chartGroup.append("g");

  // append initial circles 
  var circlesGroup = elemEnter.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "#F98604")
    .attr("stroke", "#D0DDF7")
    .attr("opacity", ".75");

  var circlesText = elemEnter.selectAll("text")
    .data(stateData)
    .enter()
    .append("text")
    .attr("dx", d => xLinearScale(d[chosenXAxis]) - 5)
    .attr("dy", d => yLinearScale(d[chosenYAxis]) + 3)
    .text(function (d) { return d.abbr })
    .attr("font-size", "9")
    .attr("font-weight", "bold")
    .attr("stroke", "1258DC")

  // Create group for 3 XAxis labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var PovertyLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .attr("stroke", "#332009")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("In Poverty (%)");

  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 45)
    .attr("value", "age")
    .classed("inactive", true)
    .attr("stroke", "#332009")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("Age (Median)");

  var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 70)
    .attr("value", "income")
    .classed("inactive", true)
    .attr("stroke", "#332009")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("Household Income (Median)");

  // Create group for 3 YAxis labels
  var labelsYGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")

  var healthcareLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 80)
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare")
    .classed("active", true)
    .attr("stroke", "darkblue")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes")
    .classed("inactive", true)
    .attr("stroke", "darkblue")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("Smokes (%)");

  var obeseLabel = labelsYGroup.append("text")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity")
    .classed("inactive", true)
    .attr("stroke", "darkblue")
    .attr("font-size", "18")
    .attr("font-weight", "bold")
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsXGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  labelsYGroup.selectAll("text")
    .on("click", function () {

      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenYAxis = value;
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "healthcare") {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});

