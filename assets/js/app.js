// define svg area dimensions
var svgWidth = 960;
var svgHeight = 660;

// define chart magins and the dimensions of chart area
var margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60
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

// import data from csv file
d3.csv("assets/data/data.csv").then(function(data) {
    console.log(data);

    // parse data/cast as numbers
    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
    });

    console.log(d3.min(data, d => d.poverty));
    console.log(d3.min(data, d => d.healthcare));

    // create x and y scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([8, d3.max(data, d => d.poverty)])
        .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([chartHeight, 0]);
    
    // create axis funtions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append axes to chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);
    
    // create circles for scatter plot
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter();

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("stroke-width", "1px")
        .attr("fill", "blue")
        .attr("opacity", ".3")
        .attr("class", "stateCircle");
        
    circlesGroup.append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("text-anchor", "middle")
        .attr("alignment-basline", "central")
        .attr("stroke-width", "1px")
        .attr("dy", "5px")
        .text(function(d) {
            return d.abbr;
        })
        .on("click", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });


    // tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.abbr}<br>Poverty (%): ${d.poverty}<br>Healthcare (%): ${d.healthcare}`)
        });
    
    chartGroup.call(toolTip);

    // circlesGroup.on("click", function(data) {
    //     toolTip.show(data, this);
    // })
    //     .on("mouseout", function(data, index) {
    //         toolTip.hide(data);
    //     });

    // axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight/2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Lacks Healthcare (%)");

    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top/1.5})`)
        .attr("class", "aText")
        .text("In Poverty(%)");
});