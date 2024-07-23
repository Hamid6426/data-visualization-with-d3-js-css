// Set up chart dimensions
const margin = { top: 100, right: 20, bottom: 30, left: 60 };
const width = 920 - margin.left - margin.right;
const height = 630 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

// Fetch and process data
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
  .then(data => {
    const parseTime = d3.timeParse("%M:%S");
    data.forEach(d => {
        d.Place = +d.Place;
        const parsedTime = d.Time.split(':');
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
        .range([0, width]);

    const yScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))
        .range([0, height]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Time))
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time.toISOString())
        .style("fill", d => d.Doping ? "red" : "blue")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(
                `${d.Name}: ${d.Nationality}<br/>
                Year: ${d.Year}, Time: ${d3.timeFormat("%M:%S")(d.Time)}
                ${d.Doping ? `<br/><br/>${d.Doping}` : ''}`
            )
            .attr("data-year", d.Year)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("text")
        .attr("id", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text("Bicycle Racing Data");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2 + 25)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("35 Fastest times up");

    const legendContainer = svg.append("g").attr("id", "legend");

    const legend = legendContainer.selectAll("#legend")
        .data(["Riders with doping allegations", "No doping allegations"])
        .enter()
        .append("g")
        .attr("class", "legend-label")
        .attr("transform", (d, i) => `translate(0, ${height / 2 - i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => i === 0 ? "red" : "blue");

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
})
.catch(err => console.log(err));