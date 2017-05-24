var width   = screen.width,
    height  = screen.height,
    margin  = 20,
    pad     = margin / 2,
    radius  = 30,
    yfixed  = pad + radius + 20;

var color = d3.scaleOrdinal([0,10]);
var timeScale = d3.scaleTime()
    .domain([
        new Date(2000, 0, 1),
        new Date(2020, 0 ,1)
    ])
    .range([radius * 2, width - margin ]);
var axis = d3.axisTop(timeScale)
    .tickSize([10]);


var arc = d3.arc()
    .startAngle(1.5708)
    .endAngle( 4.71239 );

var selectedTeam = null;
var selectedPlayer = null;
var hoverSelectionTeam = null;
var incomingArcs, outgoingArcs;

var t = d3.transition()
    .duration(500)
    .ease(d3.easeLinear);
// Main
//-----------------------------------------------------

function arcDiagram(graph) {

    var svg = d3.select("#chart").append("svg")
        .attr("id", "arc")
        .attr("width", width)
        .attr("height", height);

    // fix graph links to map to objects
    graph.links.forEach(function(d,i) {
        d.source = graph.nodes[d.source];
        d.target = graph.nodes[d.target];
    });

    svg.append('svg:defs').selectAll("pattern")
        .data( d3.entries( graph.teams ) )
        .enter()
        .append("svg:pattern")
        .attr('id', function( d ) { return d.value.name.replace(/ /g, '_'); } )
        .attr('width', "95%" )
        .attr('height', "95%" )
        .attr('patternContentUnits', 'objectBoundingBox')
        .append('svg:image')
        .attr('xlink:href', function( d ) { return d.value.logoURL; } )
        .attr('preserveAspectRatio', 'xMidYMid slice')
        .attr('width', 1 )
        .attr('height',1 );

    // create plot within svg
    var plot = svg.append("g")
        .style('pointer-events', 'all')
        .attr("id", "plot")
        .attr("transform", "translate(" + pad + ", " + pad + ")");

    var gX = linearLayout(graph.nodes, svg);
    var gLinks = drawLinks(graph.links);
    var gNodes = drawNodes(graph.nodes);

    gNodes.on('click', function( d ) {
        var old = d3.selectAll('.'+selectedTeam);
        if( old ) old.style("stroke", "rgb(167, 174, 180)").style("stroke-width", 2);
        if( selectedTeam != d.name.replace(/ /g, '')) {
            selectedTeam = d.name.replace(/ /g,'');
            d3.selectAll('.'+selectedTeam).style( "stroke", "red").style("stroke-width", 6);
        } else selectedTeam = null;

        if( incomingArcs && outgoingArcs ) {
            incomingArcs.style("stroke", "#888888");
            outgoingArcs.style("stroke", "#888888");
        }

        incomingArcs = d3.selectAll('*[data-target=\"' + d.id + '\"]');
        outgoingArcs = d3.selectAll('*[data-source=\"' + d.id + '\"]');

        incomingArcs.style("stroke", "red");
        outgoingArcs.style("stroke", "red");

        d3.select("#teamLogo").attr("src", graph.teams[d.name].logoURL);
        d3.select("#teamName").text( d.name );
        d3.select("#winYear").text( d.year );
        d3.select("#teamRoster")
            .selectAll(".item")
            .data( d.roster )
            .remove()
            .enter()
            .append("div")
            .attr("class", "item")
            .text( function( d ) { return graph.players[d].name })
    });

    gNodes.on('mouseover', function (d) {
        var selection = d3.selectAll('.' + d.name.replace(/ /g, ''));
        if( hoverSelectionTeam ) {
            hoverSelectionTeam.interrupt();
            hoverSelectionTeam.transition(t).attr('r', radius);
        }
        hoverSelectionTeam = selection;
        if( hoverSelectionTeam ) {
            hoverSelectionTeam.interrupt();
            hoverSelectionTeam.transition(t).attr('r', radius * 2);
        }
    });


    gNodes.on('mouseout', function (d) {
        if( hoverSelectionTeam ) {
            hoverSelectionTeam.interrupt();
            hoverSelectionTeam.transition(t).attr('r', radius);
        }
    });

    gLinks.on("click", function (d) {
        var old = d3.selectAll('.p'+selectedPlayer);
        if( old ) old.style("stroke", "#888888");
        if( selectedPlayer != d.player ) {
            selectedPlayer = d.player;
            d3.selectAll('.p'+selectedPlayer).style("stroke", "red");
        } else selectedPlayer = null;
    });

    var zoomed = function ( e ) {
        // plot.attr( 'transform', 'translate(' + d3.event.transform.x + ',' + pad + ')' +
        //     ' scale(' + d3.event.transform.k + ')' );
        var transform = d3.event.transform;
        gX.call( axis.scale( transform.rescaleX( timeScale ) ) );

        gNodes.attr("cx", function(d) { return transform.applyX(d.x) });

        gLinks.attr("transform", function(d) {
                var xshift = d.source.x + (d.target.x - d.source.x) / 2;
                xshift = transform.applyX( xshift );
                var yshift = yfixed + radius;
                return "translate(" + xshift + ", " + yshift + ")";
            })
        .attr("d", function(d) {
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
        .scaleExtent( [0.4, 3 ])
        // .translateExtent( [ [ -6000,0 ], [ 1500, 0] ])
        .on("zoom", zoomed)
    );

}

// layout nodes linearly
function linearLayout(nodes, svg) {
    var g = svg.append("g")
        .attr('class', 'axis')
        .attr('transform', 'translate(' + pad + ', ' + ( pad + 20 )  + ')')
        .style('font-size','20px')
        .call(axis);

    nodes.forEach(function(d, i) {
        d.x = timeScale(new Date( d.year, 0, 1, 1 ) );
        d.y = yfixed;
    });

    return g;
}

function drawNodes( nodes ) {
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
        .attr("r", radius)
        .style("stroke", function(d, i) {
            return 'rgb(167, 174, 180)';
        })
        .attr("fill", function (d, i) {
            return "url(#" + d.name.replace(/ /g, '_') +")";
        });

    gNodes.append("title")
        .attr("dx", function(d) { return 20; })
        .attr("cy", ".35em")
        .text(function(d) { return d.name + " | " + d.year; });

    return gNodes;
}

function drawLinks(links) {
    var radians = d3.scaleLinear()
        .range([Math.PI / 2, 3 * Math.PI / 2]);

    var gLinks = d3.select("#plot").selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function (d) {
            return "link p" + d.player;
        })
        .attr("data-source", function (d) {
            return d.source.id;
        })
        .attr("data-target", function (d) {
            return d.target.id;
        })
        .attr("transform", function(d) {
            var xshift = d.source.x + (d.target.x - d.source.x) / 2;
            var yshift = yfixed + radius;
            return "translate(" + xshift + ", " + yshift + ")";
        })
        .attr("d", function(d) {
            var xdist = Math.abs(d.source.x - d.target.x);
            arc.outerRadius( xdist / 2 );
            arc.innerRadius( xdist / 2 );
            return arc();
        });

    return gLinks;
}