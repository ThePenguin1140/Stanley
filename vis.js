var width   = 1000,
    height  = 500,
    margin  = 20,
    pad     = margin / 2,
    radius  = 6,
    yfixed  = pad + radius;

var color = d3.scale.category10();

// Main
//-----------------------------------------------------

function arcDiagram(graph) {
    var radius = d3.scale.sqrt()
        .domain([0, 20])
        .range([0, 15]);

    var svg = d3.select("#chart").append("svg")
        .attr("id", "arc")
        .attr("width", width)
        .attr("height", height);

    // create plot within svg
    var plot = svg.append("g")
        .attr("id", "plot")
        .attr("transform", "translate(" + pad + ", " + pad + ")");

    // fix graph links to map to objects
    graph.links.forEach(function(d,i) {
        d.source = graph.nodes[d.source];
        d.target = graph.nodes[d.target];
    });

    linearLayout(graph.nodes);
    drawLinks(graph.links);
    drawNodes(graph.nodes);
}

// layout nodes linearly
function linearLayout(nodes) {

    var xscale = d3.scale.linear()
        .domain([0, nodes.length - 1])
        .range([radius, width - margin - radius]);

    nodes.forEach(function(d, i) {
        d.x = xscale(i);
        d.y = yfixed;
    });
}

function drawNodes(nodes) {

    var gnodes = d3.select("#plot").selectAll("g.node")
        .data(nodes)
        .enter().append('g');

    var nodes = gnodes.append("circle")
        .attr("class", "node")
        .attr("id", function(d, i) { return d.year; })
        .attr("cx", function(d, i) { return d.x; })
        .attr("cy", function(d, i) { return d.y; })
        .attr("r", 5)
        .style("stroke", function(d, i) {
            if(d.name == 'Montreal Canadiens')
                return 'rgb(255, 2, 2)';
            else if(d.name == 'Toronto Maple Leafs')
                return color(5);
            else
                return 'rgb(167, 174, 180)';
        });

    nodes.append("title")
        .attr("dx", function(d) { return 20; })
        .attr("cy", ".35em")
        .text(function(d) { return d.name + " | " + d.year; })

}

function drawLinks(links) {
    var radians = d3.scale.linear()
        .range([Math.PI / 2, 3 * Math.PI / 2]);

    var arc = d3.svg.line.radial()
        .interpolate("basis")
        .tension(0)
        .angle(function(d) { return radians(d); });

    d3.select("#plot").selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("transform", function(d,i) {
            var xshift = d.source.x + (d.target.x - d.source.x) / 2;
            var yshift = yfixed;
            return "translate(" + xshift + ", " + yshift + ")";
        })
        .attr("d", function(d,i) {
            var xdist = Math.abs(d.source.x - d.target.x);
            arc.radius(xdist / 2);
            var points = d3.range(0, Math.ceil(xdist / 3));
            radians.domain([0, points.length - 1]);
            return arc(points);
        });
}