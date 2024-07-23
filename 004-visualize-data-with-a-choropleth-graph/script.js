const projectMap = 'choropleth';

var bodyElement = d3.select('body');
var svgElement = d3.select('svg');

var tooltipDiv = bodyElement
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

var geoPath = d3.geoPath();

var xScale = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

var colorScale = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeGreens[9]);

var legendGroup = svgElement
  .append('g')
  .attr('class', 'key')
  .attr('id', 'legend')
  .attr('transform', 'translate(0,40)');

legendGroup.selectAll('rect')
  .data(
    colorScale.range().map(function (d) {
      d = colorScale.invertExtent(d);
      if (d[0] === null) {
        d[0] = xScale.domain()[0];
      }
      if (d[1] === null) {
        d[1] = xScale.domain()[1];
      }
      return d;
    })
  )
  .enter()
  .append('rect')
  .attr('height', 8)
  .attr('x', function (d) {
    return xScale(d[0]);
  })
  .attr('width', function (d) {
    return d[0] && d[1] ? xScale(d[1]) - xScale(d[0]) : xScale(null);
  })
  .attr('fill', function (d) {
    return colorScale(d[0]);
  });

legendGroup.append('text')
  .attr('class', 'caption')
  .attr('x', xScale.range()[0])
  .attr('y', -6)
  .attr('fill', '#000')
  .attr('text-anchor', 'start')
  .attr('font-weight', 'bold');

legendGroup.call(
  d3
    .axisBottom(xScale)
    .tickSize(13)
    .tickFormat(function (x) {
      return Math.round(x) + '%';
    })
    .tickValues(colorScale.domain())
)
  .select('.domain')
  .remove();

const educationDataFile = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyDataFile = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([d3.json(countyDataFile), d3.json(educationDataFile)])
  .then(data => prepareData(data[0], data[1]))
  .catch(err => console.log(err));

function prepareData(usData, educationData) {
  svgElement
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(usData, usData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('data-fips', function (d) {
      return d.id;
    })
    .attr('data-education', function (d) {
      var result = educationData.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
      console.log('could find data for: ', d.id);
      return 0;
    })
    .attr('fill', function (d) {
      var result = educationData.filter(function (obj) {
        return obj.fips === d.id;
      });
      if (result[0]) {
        return colorScale(result[0].bachelorsOrHigher);
      }
      return colorScale(0);
    })
    .attr('d', geoPath)
    .on('mouseover', function (event, d) {
      tooltipDiv.style('opacity', 0.9);
      tooltipDiv
        .html(function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return (
              result[0]['area_name'] +
              ', ' +
              result[0]['state'] +
              ': ' +
              result[0].bachelorsOrHigher +
              '%'
            );
          }
          return 0;
        })
        .attr('data-education', function () {
          var result = educationData.filter(function (obj) {
            return obj.fips === d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          return 0;
        })
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      tooltipDiv.style('opacity', 0);
    });

  svgElement
    .append('path')
    .datum(
      topojson.mesh(usData, usData.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr('class', 'states')
    .attr('d', geoPath);
}
