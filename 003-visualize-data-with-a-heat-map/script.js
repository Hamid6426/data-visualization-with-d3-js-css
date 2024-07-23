
const margin = { top: 50, right: 50, bottom: 100, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#heatmap")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
.attr("id", "tooltip")
.style("opacity", 0);

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url).then(data => {
  const baseTemperature = data.baseTemperature;
  const monthlyData = data.monthlyVariance;

  monthlyData.forEach(d => {
    d.month -= 1; // convert month to 0-indexed
    d.temperature = baseTemperature + d.variance;
  });

  const xScale = d3.scaleBand()
  .domain(monthlyData.map(d => d.year))
  .range([0, width])
  .padding(0.01);

  const yScale = d3.scaleBand()
  .domain(d3.range(12))
  .range([0, height])
  .padding(0.01);

  const colorScale = d3.scaleQuantize()
  .domain(d3.extent(monthlyData, d => d.temperature))
  .range(d3.schemeRdYlBu[11].reverse());

  const xAxis = d3.axisBottom(xScale)
  .tickValues(xScale.domain().filter(year => year % 10 === 0))
  .tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale)
  .tickFormat(month => d3.timeFormat("%B")(new Date(0, month)));

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .call(yAxis);

  svg.selectAll(".cell")
    .data(monthlyData)
    .enter().append("rect")
    .attr("class", "cell")
    .attr("data-month", d => d.month)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => d.temperature)
    .attr("x", d => xScale(d.year))
    .attr("y", d => yScale(d.month))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", d => colorScale(d.temperature))
    .on("mouseover", (event, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0, d.month))}<br>Temp: ${d.temperature.toFixed(2)}℃`)
      .attr("data-year", d.year)
      .style("left", (event.pageX + 5) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
    .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  const legendColors = d3.schemeRdYlBu[11].reverse();
  const legendWidth = 400;
  const legendHeight = 20;

  const legendScale = d3.scaleLinear()
  .domain(d3.extent(monthlyData, d => d.temperature))
  .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
  .tickSize(10)
  .ticks(10);

  const legend = svg.append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${(width - legendWidth) / 2},${height + 40})`);

  legend.selectAll("rect")
    .data(legendColors.map((color, i) => {
    const start = legendScale.domain()[0] + i * (legendScale.domain()[1] - legendScale.domain()[0]) / legendColors.length;
    const end = start + (legendScale.domain()[1] - legendScale.domain()[0]) / legendColors.length;
    return [start, end, color];
  }))
    .enter().append("rect")
    .attr("x", d => legendScale(d[0]))
    .attr("y", 0)
    .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
    .attr("height", legendHeight)
    .style("fill", d => d[2]);

  legend.append("g")
    .attr("transform", `translate(0,${legendHeight})`)
    .call(legendAxis);
}).catch(error => console.error(error));
