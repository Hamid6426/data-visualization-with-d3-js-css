// Define dimensions
const width = 960;
const height = 570;

// Load the dataset
d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json').then(data => {
    // Create the SVG element
    const svg = d3.select('#tree-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create the tooltip
    const tooltip = d3.select('#tooltip');

    // Create the root hierarchy node
    const root = d3.hierarchy(data)
        .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    // Create the treemap layout
    d3.treemap()
        .size([width, height])
        .paddingInner(1)
        .paddingOuter(2)
        .paddingTop(20)(root);

    // Create the color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the tiles
    svg.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => color(d.data.category))
        .on('mouseover', (event, d) => {
            tooltip.style('display', 'block')
                .style('left', `${event.pageX + 5}px`)
                .style('top', `${event.pageY - 28}px`)
                .attr('data-value', d.data.value)
                .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`);
        })
        .on('mouseout', () => tooltip.style('display', 'none'));

    // Create the legend
    const categories = root.leaves().map(d => d.data.category).filter((v, i, a) => a.indexOf(v) === i);
    
    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', width)
        .attr('height', 50);

    legend.selectAll('rect')
        .data(categories)
        .enter()
        .append('rect')
        .attr('class', 'legend-item')
        .attr('x', (d, i) => i * 150)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d => color(d));

    legend.selectAll('text')
        .data(categories)
        .enter()
        .append('text')
        .attr('x', (d, i) => i * 150 + 25)
        .attr('y', 15)
        .text(d => d);
});
