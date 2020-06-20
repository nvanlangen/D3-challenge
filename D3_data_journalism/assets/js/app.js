// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60
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

d3.csv("./assets/data/data.csv").then(function (demographicData) {

    console.log(demographicData);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([d3.min(demographicData, data => +data.poverty) - 1, d3.max(demographicData, data => +data.poverty) + 1])
        .range([0, chartWidth]);

    chartGroup.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x));

    chartGroup.append("text")
        .classed("axisLabel", true)
        .attr("transform", "translate(" + (chartWidth / 2) + " ," + (chartHeight + margin.bottom) + ")")
        .attr("dy", "-1em")
        .text("In Poverty (%)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(demographicData, data => +data.healthcare) - 1, d3.max(demographicData, data => +data.healthcare) + 1])
        .range([chartHeight, 0]);

    chartGroup.append("g")
        .call(d3.axisLeft(y));

    chartGroup.append("text")
        .classed("axisLabel", true)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (chartHeight / 2))
        .attr("dy", "1em")
        .text("Lacks Healthcare (%)");

        // Add dots
    chartGroup.append("g")
        .selectAll("dot")
        .data(demographicData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", function (d) { return x(+d.poverty); })
        .attr("cy", function (d) { return y(+d.healthcare); })
        .attr("r", 10)

    chartGroup.append("g")
        .selectAll("text")
        .data(demographicData)
        .classed("stateText", true)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", function(d) { return x(+d.poverty); })
        .attr("y", function(d) { return y(+d.healthcare) +3; })
        .text( function (d) { return d.abbr; })
        .attr("font-size", "10px")
 
}).catch(function(error) {
    console.log(error);
});
  