const chartDiv = document.getElementById("chart");
const svg = d3.select(chartDiv).append("svg");

svg
    .attr("width", width)
    .attr("height", height);

const margin = {
    top: 80,
    right: 0,
    bottom: 5,
    left: 0
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

let title = svg.append('text')
    .attrs({
        class: 'title',
        y: 24
    })
    .html('The most populous cities in the world from 1500 to 2018');