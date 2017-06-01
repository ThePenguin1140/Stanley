var margin  = 20,
    pad     = margin / 2,
    radius  = 30,
    yfixed  = pad + radius + 20;

var color, axis, arc, arcs, selectedTeam, selectedPlayer, hoverSelectionTeam, t, fast_t;


function init( data ) {

    color = d3.scaleOrdinal([0,10]);
    timeScale = d3.scaleTime()
        .domain([
            new Date(2000, 0, 1),
            new Date(2020, 0 ,1)
        ])
        .range([radius * 2, width - margin ]);
    axis = d3.axisTop(timeScale)
        .tickSize([10]);


    arc = d3.arc()
        .startAngle(1.5708)
        .endAngle( 4.71239 );

    selectedTeam = null;
    selectedPlayer = null;
    hoverSelectionTeam = null;
    arcs;

    t = d3.transition()
        .duration(500)
        .ease(d3.easeLinear);

    fast_t = d3.transition()
        .duration(250)
        .ease(d3.easeLinear)
        ;

    arcDiagram(data);
}

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

    var gX = linearLayout(graph.nodes, svg);

    // create plot within svg
    var plot = svg.append("g")
        .style('pointer-events', 'all')
        .attr("id", "plot")
        .attr("transform", "translate(" + pad + ", " + pad + ")");

    var gLinks = drawLinks(graph.links);
    var gNodes = drawNodes(graph.nodes);

    gNodes.on('click', function( d ) {

        d3.select("button").classed("active", false);

        var old = d3.selectAll('.'+selectedTeam);
        if( old ) {
            old.interrupt();
            old.transition(fast_t)
                .style("stroke", "rgb(167, 174, 180)")
                .style("stroke-width", 2)
            ;
        }
        if( true ) {
            selectedTeam = d.name.replace(/ /g,'');
            d3.selectAll('.'+selectedTeam).interrupt();
            d3.selectAll('.' + selectedTeam).transition(fast_t)
                .style( "stroke", "red")
                .style("stroke-width", 6)
            ;
        } else selectedTeam = null;

        if( arcs ) {
            arcs.transition(fast_t)
                .style("stroke", "#888888")
                .style("stroke-width", 1)
                .style("stroke-opacity", 0.5)
            ;
        }

        arcs = d3.selectAll('*[data-target=\"' + d.id + '\"]').classed("cur", true);
        var outgoingArcs = d3.selectAll('*[data-source=\"' + d.id + '\"]').classed("cur", true);

        arcs = d3.selectAll('.cur');
        arcs.classed("cur", false);

        arcs.transition(fast_t)
            .style("stroke", "black")
            .style("stroke-width", 3)
            .style("stroke-opacity", 1)
        ;

        d3.select("#teamLogo").attr("src", graph.teams[d.name].logoURL);

        d3.select("#teamName").text( d.name );

        d3.select("#winYear").selectAll('div.ui.label').remove();

        d3.select("#winYear").selectAll('div')
            .data( Object.keys( graph.teams[d.name].wins, function( n ) {
                return n;
            } ) )
            .enter()
            .append('div')
            .text( function ( year ) {
                return year;
            } )
            .attr("class", function ( year ) {
                var c = "ui ";
                c += d.year == year ? "green " : "";
                return c + "label";
            })
            .style("margin", "5px")
            ;

        d3.select("#teamRoster")
            .style('height',
            String( height + 20 - d3.select('#infoPanel>div').node().getBoundingClientRect().height ) + "px" )
            .style("overflow-y", "scroll")
            .style("padding-bottom", "10px")
        ;

        d3.select("#teamRoster").selectAll('div').remove();

        var roster = d3.select("#teamRoster")
            .selectAll(".item")
            .data( d.roster, function( n ) {
                return n;
            } );

        var rosterItem = roster.enter()
            .append("div")
            .attr("class", "item")
            .on("click", function (item) {
                var playerArcs = d3.selectAll('*[data-player=\"' + item + '\"');
                playerArcs.transition(fast_t).style("stroke", "red");
            })
            .on('mouseover', function (item) {
                var playerArcs = d3.selectAll('*[data-player=\"' + item + '\"');
                playerArcs.interrupt();
                playerArcs.transition(fast_t).style("stroke-width", 8).style("stroke", "red");
            })
            .on('mouseout', function (item) {
                var playerArcs = d3.selectAll('*[data-player=\"' + item + '\"');
                playerArcs.interrupt();
                playerArcs.transition(fast_t).style("stroke-width", 3).style("stroke", "#888888");
                arcs.interrupt();
                arcs.transition(fast_t).style("stroke", "black").style("stroke-width", 3);
            })
            ;

        rosterItem
            .selectAll(".ui.avatar.image")
            .data( function( n ) {
                wins = [];
                for( year in graph.players[n].wins ) {
                    wins.push( { "year": year, "name": graph.players[n].wins[year] } );
                }
                return wins;
            })
            .enter()
            .append("img")
            .attr("class", "ui avatar image")
            .attr("src", function (team) {
                return graph.teams[team.name].logoURL;
            })
            ;

        rosterItem
            .append("div")
            .attr("class", "content")
            .append("a")
            .attr("class", "header")
            .text( function( n ) { return graph.players[n].name })
            ;


        roster.exit().remove();
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

        this.parentNode.appendChild(this);
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
        .attr("data-player", function (d) {
            return d.player;
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

toggleLengend = function () {
    if (selectedTeam) {
        var button = d3.select("button");
        button.classed("active", !button.classed("active"));
        xhr.open('GET', 'legend.html', true);
        xhr.send();

        var old = d3.selectAll('.' + selectedTeam);
        if (old) {
            old.interrupt();
            old.transition(fast_t)
                .style("stroke", "rgb(167, 174, 180)")
                .style("stroke-width", 2)
            ;
        }

        selectedTeam = null;

        if (arcs) {
            arcs.transition(fast_t)
                .style("stroke", "#888888")
                .style("stroke-width", 1)
                .style("stroke-opacity", 0.5)
            ;
        }

        arcs = null;

    }
};