var width   = 1100,
    height  = 750,
    margin  = 20,
    pad     = margin / 2,
    radius  = 10,
    yfixed  = pad + radius + 20;

var color = d3.scaleOrdinal([0,10]);
var timeScale = d3.scaleTime()
    .domain([
        new Date(1901, 0, 1),
        new Date(1951, 0 ,1)
    ])
    .range([radius * 2, width - margin ]);
var axis = d3.axisTop(timeScale);


var arc = d3.arc()
    .startAngle(1.5708)
    .endAngle( 4.71239 );

var selectedTeam = null;
// Main
//-----------------------------------------------------

function arcDiagram(graph) {
    var radius = d3.scaleSqrt()
        .domain([0, 20])
        .range([0, 15]);

    var svg = d3.select("#chart").append("svg")
        .attr("id", "arc")
        .attr("width", width)
        .attr("height", height);

    // create plot within svg
    var plot = svg.append("g")
        .style('pointer-events', 'all')
        .attr("id", "plot")
        .attr("transform", "translate(" + pad + ", " + pad + ")");

    // fix graph links to map to objects
    graph.links.forEach(function(d,i) {
        d.source = graph.nodes[d.source];
        d.target = graph.nodes[d.target];
    });

    var gX = linearLayout(graph.nodes, svg);
    var gLinks = drawLinks(graph.links);
    var gNodes = drawNodes(graph.nodes);

    gNodes.on('click', function( d ) {
        var old = d3.selectAll('.'+selectedTeam);
        if( old ) old.style("fill", "white");
        if( selectedTeam != d.name.replace(/ /g, '')) {
            selectedTeam = d.name.replace(/ /g,'');
            d3.selectAll('.'+selectedTeam).style( "fill", "gray").style("fill-opacity", 0.9);
        } else selectedTeam = null;
    });

    var zoomed = function ( e ) {
        // plot.attr( 'transform', 'translate(' + d3.event.transform.x + ',' + pad + ')' +
        //     ' scale(' + d3.event.transform.k + ')' );
        var transform = d3.event.transform;
        gX.call( axis.scale( transform.rescaleX( timeScale ) ) );

        gNodes.attr("cx", function(d, i) { return transform.applyX(d.x) });

        gLinks.attr("transform", function(d,i) {
                var xshift = d.source.x + (d.target.x - d.source.x) / 2;
                xshift = transform.applyX( xshift );
                var yshift = yfixed;
                return "translate(" + xshift + ", " + yshift + ")";
            })
        .attr("d", function(d,i) {
            var xdist = Math.abs(
                transform.applyX( d.source.x )-
                transform.applyX( d.target.x ) );
            arc.outerRadius( xdist / 2 );
            arc.innerRadius( xdist / 2 );
            // var points = d3.range(0, Math.ceil(xdist / 3));
            // radians.domain([0, points.length - 1]);
            return arc();
        });
    };

    svg.call( d3.zoom()
        .scaleExtent( [0.2, 3 ])
        .translateExtent( [ [ -3000,0 ], [ 3100, 0] ])
        .on("zoom", zoomed)
    );

}

// layout nodes linearly
function linearLayout(nodes, svg) {

    // var xscale = d3.scale.linear()
    //     .domain([0, nodes.length - 1])
    //     .range([radius * 2, width - margin - radius ]);

    var g = svg.append("g")
        .attr('class', 'axis')
        .attr('transform', 'translate(' + pad + ', ' + ( pad + 20 )  + ')')
        .call(axis);

    nodes.forEach(function(d, i) {
        d.x = timeScale(new Date( d.year, 0, 1, 1 ) );
        d.y = yfixed;
    });

    return g;
}

function drawNodes(nodes) {

    var gNodes = d3.select("#plot").selectAll("g.node")
        .data(nodes)
        .enter()
        .append('g')
        .append("circle")
        .attr("class", "node")
        .attr("id", function(d, i) { return d.year + d.name; })
        .attr("class", function( d ) { return d.name.replace(/ /g,'') })
        .attr("cx", function(d, i) { return d.x; })
        .attr("cy", function(d, i) { return d.y; })
        .attr("r", 10)
        .style("stroke", function(d, i) {
            if(d.name == 'Montreal Canadiens')
                return 'rgb(255, 2, 2)';
            else if(d.name == 'Toronto Maple Leafs')
                return "blue";
            else
                return 'rgb(167, 174, 180)';
        })
        .style("fill", "white");

    gNodes.append("title")
        .attr("dx", function(d) { return 20; })
        .attr("cy", ".35em")
        .text(function(d) { return d.name + " | " + d.year; });

    return gNodes;
}

function drawLinks(links) {
    var radians = d3.scaleLinear()
        .range([Math.PI / 2, 3 * Math.PI / 2]);

    return d3.select("#plot").selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("transform", function(d,i) {
            var xshift = d.source.x + (d.target.x - d.source.x) / 2;
            var yshift = yfixed;
            return "translate(" + xshift + ", " + yshift + ")";
        })
        .attr("d", function(d,i) {
            var xdist = Math.abs(d.source.x - d.target.x);
            arc.outerRadius( xdist / 2 );
            arc.innerRadius( xdist / 2 );
            // var points = d3.range(0, Math.ceil(xdist / 3));
            // radians.domain([0, points.length - 1]);
            return arc();
        });
}