// Set up chart dimensions
const margin = { top: 50, right: 30, bottom: 50, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch and process data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then(data => {
    const dataset = data.data;
    const parseTime = d3.timeParse("%Y-%m-%d");
    dataset.forEach(d => {
        d[0] = parseTime(d[0]);
        d[1] = +d[1];
    });

    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, d => d[0]))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])])
        .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    // Append x-axis
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    // Append y-axis
    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // Create bars
    svg.selectAll(".bar")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", width / dataset.length - 1)
        .attr("height", d => height - yScale(d[1]))
        .attr("data-date", d => d3.timeFormat("%Y-%m-%d")(d[0]))
        .attr("data-gdp", d => d[1]);

    // Append title
    svg.append("text")
        .attr("id", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text("US GDP Over Time");

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // Mouseover and mouseout events
    svg.selectAll(".bar")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d[0])}<br>GDP: ${d[1]}`)
                .attr("data-date", d3.timeFormat("%Y-%m-%d")(d[0]))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
});