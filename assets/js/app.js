// define svg area dimensions
var svgWidth = 960;
var svgHeight = 660;

// define chart magins and the dimensions of chart area
var margin = {
    top: 60,
    right: 60,
    bottom: 100,
    left: 100
};
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// create an svg wrapper and append an svg group
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// set initial parameters
var chosenXaxis = "poverty"
var chosenYaxis = "healthcare"

// -------------------------FUNCTIONS --------------------------------
// function to update x-scale variable when axis label is clicked
function xScale(ACSdata, chosenXaxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(ACSdata, d => d[chosenXaxis]) * 0.5, d3.max(ACSdata, d => d[chosenXaxis]) * 1.2])
        .range([0, chartWidth]);
    return xLinearScale;
}

function yScale(ACSdata, chosenYaxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(ACSdata, d => d[chosenYaxis]) * 0.5, d3.max(ACSdata, d => d[chosenYaxis]) * 1.2])
        .range([chartHeight,0]);
    return yLinearScale;
}

// function to update x Axis variable when axis label is clicked
function updateAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function updateYaxis(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function to update circles group
function updateCircles(circlesGroup, newXscale, newYscale, chosenXaxis, chosenYaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d=> newXscale(d[chosenXaxis]))
        .attr("cy", d=> newYscale(d[chosenYaxis]));
    
        return circlesGroup;
}

// function to update circles group with new tooltip
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, newXscale, newYscale) {
    if (chosenXaxis === "poverty") {
        var labelX = "In Poverty (%)";
    }
    else {
        var labelX = "Median Age";
    }

    if (chosenYaxis === "healthcare") {
        var labelY = "Lacks Healthcare (%)";
    }
    else {
        var labelY = "Smokes (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(data, index) {
            return (`${data.state} <br> ${labelX}: ${data[chosenXaxis]} <br> ${labelY}: ${data[chosenYaxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}

//===================================================================
// import data from csv file
d3.csv("assets/data/data.csv").then(function(ACSdata) {
    console.log(ACSdata);

    // parse data/cast as numbers
    ACSdata.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.age = +d.age;
        d.smokes = +d.smokes;
    });

    console.log(d3.extent(ACSdata, d => d[chosenXaxis]));
    console.log(d3.extent(ACSdata, d => d[chosenYaxis]));
    
    // create x and y scale function using functions from above
    var xLinearScale = xScale(ACSdata, chosenXaxis);
    var yLinearScale = yScale(ACSdata, chosenYaxis);
    
    // create axes funtions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    // append x axis to chart
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    //append y axis to chart
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    
    // create circles, state abbrvs 
    var circlesGroup = chartGroup.selectAll("circle")
        .data(ACSdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", "10")
        .attr("class", "stateCircle");
    
    // ====================================================== State Abbrvs
    // circlesGroup.append("text")
    //     .attr("x", d => xLinearScale(d[chosenXaxis]))
    //     .attr("y", d => yLinearScale(d[chosenYaxis]))
    //     .attr("class", "stateText")
    //     .attr("dy", "5px")
    //     .text(function(d) {
    //         console.log(d.abbr);
    //         return d.abbr;
    //     });

    // chartGroup.selectAll("circle").append("text")
    //     .attr("x", d => xLinearScale(d[chosenXaxis]))
    //     .attr("y", d => yLinearScale(d[chosenYaxis]))
    //     .attr("class", "stateText")
    //     .attr("dy", "5px")
    //     .attr("fill", "red")
    //     .text(function(d) {
    //         console.log(d.abbr);
    //         return d.abbr;
    //     });
   

    // create X axis label groups and append both labels
    var labelGroupsX = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = labelGroupsX.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = labelGroupsX.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age");

    // create Y axis label groups and append both labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 25)
        .attr("x", 0 - (chartHeight/2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
    var smokesLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight/2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    // use update tooltip function
    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, xLinearScale, yLinearScale);

    // event listeners for X and Y axis labels
    labelGroupsX.selectAll("text")
        .on("click", function() {
            // storing value of selection as variable 
            var value = d3.select(this).attr("value");
            
            if (value !== chosenXaxis) {
                // replace default/chosen axis with value selected 
                chosenXaxis = value;
                // update x scale 
                xLinearScale = xScale(ACSdata, chosenXaxis);
                xAxis = updateAxes(xLinearScale, xAxis);
                circlesGroup = updateCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, xLinearScale, yLinearScale);

                if (chosenXaxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    labelsGroupY.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");

            if (value !== chosenYaxis) {
                chosenYaxis = value;
                yLinearScale = yScale(ACSdata, chosenYaxis);
                yAxis = updateYaxis(yLinearScale, yAxis);
                circlesGroup = updateCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup, xLinearScale, yLinearScale);

                if (chosenYaxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });


}).catch(function(error) {
    console.log(error);
});