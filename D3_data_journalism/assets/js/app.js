// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 520;


// Define the chart's margins as an object
var margin = {
    top: 60,
    right: 60,
    bottom: 80,
    left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add Functions for the multiple Axis Options
var xLabel = {
    "poverty": "In Poverty (%)",
    "age": "Age (Median)",
    "income": "Household Income (Median)"
};

var yLabel = {
    "healthcare": "Lacks Healthcare (%)",
    "obesity": "Obesity (%)",
    "smokes": "Smoke (%)"
};

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(demographicData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demographicData, d => +d[chosenXAxis]) * 0.8,
        d3.max(demographicData, d => +d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);

    return xLinearScale;
}

function yScale(demographicData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(demographicData, d => +d[chosenYAxis]) * 0.8,
        d3.max(demographicData, d => +d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circleGroup, textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(+d[chosenXAxis]))
        .attr("cy", d => newYScale(+d[chosenYAxis]));
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(+d[chosenXAxis]))
        .attr("y", d => newYScale(+d[chosenYAxis]) + 3);

    return circleGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circleGroup) {

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([100, -120])
        .html(function (d) {
            return (`<strong>${d.state}<hr>${xLabel[chosenXAxis]}: ${d[chosenXAxis]}<hr>${yLabel[chosenYAxis]}: ${d[chosenYAxis]}`);
        });

    circleGroup.call(toolTip);

    circleGroup.on("mouseover", function (d) {
        d3.select(this).style("stroke", "blue");
        toolTip.show(d, this);
    })
        .on("mouseout", function (d) {
            d3.select(this).style("stroke", "#e3e3e3");
            toolTip.hide(d);
        });

    return circleGroup;
}


d3.csv("./assets/data/data.csv").then(function (demographicData) {

    console.log(demographicData);

    var xLinearScale = xScale(demographicData, chosenXAxis);

    var xAxis = chartGroup.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(xLinearScale));

    var yLinearScale = yScale(demographicData, chosenYAxis);

    var yAxis = chartGroup.append("g")
        .call(d3.axisLeft(yLinearScale));

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", -45)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text(yLabel["healthcare"]);

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", -65)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text(yLabel["obesity"]);

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", -85)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text(yLabel["smokes"]);

    var circleGroup = chartGroup.append("g")
        .selectAll("circle")
        .data(demographicData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", function (d) { return xLinearScale(+d[chosenXAxis]); })
        .attr("cy", function (d) { return yLinearScale(+d[chosenYAxis]); })
        .attr("r", 10)

    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 10})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text(xLabel["poverty"]);

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 45)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text(xLabel["age"]);

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 65)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text(xLabel["income"]);


    var circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

    var textGroup = chartGroup.append("g")
        .selectAll("text")
        .data(demographicData)
        .classed("stateText", true)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", function (d) { return xLinearScale(+d[chosenXAxis]); })
        .attr("y", function (d) { return yLinearScale(+d[chosenYAxis]) + 3; })
        .text(function (d) { return d.abbr; })
        .attr("font-size", "8px")

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(demographicData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circleGroup = renderCircles(circleGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

                // changes classes to change bold text
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
                else {
                    if (chosenXAxis === "age") {
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false)
                    }
                    else {
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            }
        });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // updates y scale for new data
                yLinearScale = yScale(demographicData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circleGroup = renderCircles(circleGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

                // changes classes to change bold text
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);

                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
                else {
                    if (chosenYAxis === "obesity") {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false)
                    }
                    else {
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
