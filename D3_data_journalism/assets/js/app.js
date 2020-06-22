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

// Select body, append SVG area for the scatter plot, and set its dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a group to the scatter plot area defining the starting point
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create objects to hold x and y axis labels
var xLabel = {
    "poverty": ["In Poverty (%)", "povertyLabel",-75],
    "age": ["Age (Median)", "ageLabel",-75],
    "income": ["Household Income (Median)", "incomeLabel",-120]
};

var yLabel = {
    "healthcare": ["Lacks Healthcare (%)", "healthcareLabel",-95],
    "obesity": ["Obesity (%)", "obesityLabel",-70],
    "smokes": ["Smoke (%)", "smokesLabel",-70]
};

// Set the starting x and y axis data to display
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function: xScale
// Parameters: demographicData - All of the data to be plotted
//             chosenXAxis - X Axis data selection
// Creates a scale on the x axis setting the domain to 80% of the minimum value and 120% of the maximum value.
// The entire width of the chart area is utilized
function xScale(demographicData, chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demographicData, d => +d[chosenXAxis]) * 0.8,
        d3.max(demographicData, d => +d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);

    return xLinearScale;
}

// Function: yScale
// Parameters: demographicData - All of the data to be plotted
//             chosenYAxis - Y Axis data selection
// Creates a scale on the y axis setting the domain to 80% of the minimum value and 120% of the maximum value.
// The entire height of the chart area is utilized
function yScale(demographicData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(demographicData, d => +d[chosenYAxis]) * 0.8,
        d3.max(demographicData, d => +d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// Function: renderXAxes
// Parameters: newXScale - Contains the scale for the new selection on the x axis 
//             xAxis - Area for the values and tick marks for the x axis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    // Transition the x axis data to the page over a second
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function: renderYAxes
// Parameters: newYScale - Contains the scale for the new selection on the y axis 
//             yAxis - Area for the values and tick marks for the y axis
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    // Transition the y axis data to the page over a second
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function: renderCircles
// Parameters: circleGroup - Data for the circles
//             textGroup - State abbreviations for the middle of the circles
//             newXScale - Contains the scale for the new selection on the x axis
//             chosenXAxis - X Axis data selection
//             newYScale - Contains the scale for the new selection on the y axis
//             chosenYAxis - Y Axis data selection
function renderCircles(circleGroup, textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    // Transitions the circles to new locations over a second
    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(+d[chosenXAxis]))
        .attr("cy", d => newYScale(+d[chosenYAxis]));


    // Transitions the state abbreviations to new locations over a second
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(+d[chosenXAxis]))
        .attr("y", d => newYScale(+d[chosenYAxis]) + 3);

    return circleGroup;
}

// Function: updateToolTip
// Parameters: chosenXAxis - X Axis data selection
//             chosenYAxis - Y Axis data selection
//             circleGroup - Circles on the chart
function updateToolTip(chosenXAxis, chosenYAxis, circleGroup) {
    // Set Y offset value to the value in the yLabel object
    var yOffset = yLabel[chosenYAxis][2];
    // Compare the y and x values abd set Y offset to the lowest value
    // This will allow the tooltip to be displayed near the circle regardless the width of the box
    if (xLabel[chosenXAxis][2] < yLabel[chosenYAxis][2]) {
        yOffset = xLabel[chosenXAxis][2]
    }
    // Configure the message to display when a circle is hovered over
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([70, yOffset])
        .html(function (d) {
            return (`<strong>${d.state}<br>${xLabel[chosenXAxis][0]}: ${d[chosenXAxis]}<br>${yLabel[chosenYAxis][0]}: ${d[chosenYAxis]}`);
        });

    circleGroup.call(toolTip);

    // Highlight the circle with a blue outline and the show the popup when the mouse is on that circle
    // Reset the circle outline and hide the popup when the mouse out of the circle
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

// Import csv file and set up the initial chart view
d3.csv("./assets/data/data.csv").then(function (demographicData) {

    // Set up the x axis scale
    var xLinearScale = xScale(demographicData, chosenXAxis);

    var xAxis = chartGroup.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(xLinearScale));

    // Set up the y axis scale
    var yLinearScale = yScale(demographicData, chosenYAxis);

    var yAxis = chartGroup.append("g")
        .call(d3.axisLeft(yLinearScale));

    // Create a circle group, create the circles using the default x and y options
    var circleGroup = chartGroup.append("g")
        .selectAll("circle")
        .data(demographicData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", function (d) { return xLinearScale(+d[chosenXAxis]); })
        .attr("cy", function (d) { return yLinearScale(+d[chosenYAxis]); })
        .attr("r", 10)

    // Create x axis labels and selection options
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 10})`);

    // Configure the poverty label, set to active class
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "poverty")
        .classed("active", true)
        .text(xLabel["poverty"][0]);

    // Configure the age label, set to inactive class
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 45)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text(xLabel["age"][0]);

    // Configure the income label, set to inactive class
    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 65)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text(xLabel["income"][0]);

    // Create y axis labels and selection options, rotate 90 degrees to display text vertically
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // Configure the healthcare label, set to active class
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", -45)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text(yLabel["healthcare"][0]);

    // Configure the obesity label, set to inactive class
    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", -65)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text(yLabel["obesity"][0]);

    // Configure the smokes label, set to inactive class
    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", -85)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text(yLabel["smokes"][0]);

    // Set the tooltips for each circle
    var circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

    // Set the state abbreviation into the center of each circle using the stateText class
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

    // Listener for x Axis selection click event
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // Gets the clicked value and compares it to the current selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // Selected value changed, set the x axis to the new value
                chosenXAxis = value;

                // Updates x scale for new data
                xLinearScale = xScale(demographicData, chosenXAxis);

                // Updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Updates circles with new x values and current y values
                circleGroup = renderCircles(circleGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Updates tooltips with new info
                circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

                // Set all 3 x axis selections to inactive
                Object.entries(xLabel).forEach(([key, value]) => {
                    eval(value[1])
                        .classed("active", false)
                        .classed("inactive", true);
                });
                // Set the selected option to active
                eval(xLabel[chosenXAxis][1])
                    .classed("active", true)
                    .classed("inactive", false);
            }
        });

    // Listener for y Axis selection click event
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // Gets the clicked value and compares it to the current selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // Selected value changed, set the y axis to the new value
                chosenYAxis = value;

                // Updates y scale for new data
                yLinearScale = yScale(demographicData, chosenYAxis);

                // Updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Updates circles with new y values and current x values
                circleGroup = renderCircles(circleGroup, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Updates tooltips with new info
                circleGroup = updateToolTip(chosenXAxis, chosenYAxis, circleGroup);

                // Set all 3 y axis selections to inactive
                Object.entries(yLabel).forEach(([key, value]) => {
                    eval(value[1])
                        .classed("active", false)
                        .classed("inactive", true);
                });
                // Set the selected option to active
                eval(yLabel[chosenYAxis][1])
                    .classed("active", true)
                    .classed("inactive", false);
            }
        });
}).catch(function (error) {
    console.log(error);
});
