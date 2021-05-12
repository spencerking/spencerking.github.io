dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
    //console.log(data[0]);
    dataset = data;
});



/*function loadData() {
    const dataset = d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
	return data;
    });

    x = null
    dataset.then(function(value) {
	x =  value;
    });

    return x;
}

dataset = loadData();
*/

// Returns a key-value array of diseases and their mutation counts
function uniqueDiseases(dataset) {
    diseases = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	if (diseases[name] == null) {
	    diseases[name] = 1;
	} else {
	    diseases[name] += 1;
	}
    });

    return diseases;
}

// Returns a key-value array of organs and their mutation counts
function uniqueOrgans(dataset) {
    organs = {};
    dataset.forEach(function(entry) {
	name = entry['Organ'];
	if (organs[name] == null) {
	    organs[name] = 1;
	} else {
	    organs[name] += 1;
	}
    });

    return organs;
}

// Returns a key-value array of diseases and their severity
function diseaseSeverity(dataset) {
    severity = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	if (severity[name] == null) {
	    severity[name] = entry['Severity'];
	} else {
	    // TODO:
	    // Can probably just remove this else and assume it'll all work fine
	    if (severity[name] != entry['Severity']) {
		console.log('This should never happen if I annotate the data right');
	    }
	}
    });

    return severity;
}

// Returns a key-value array of chromosomes and their mutation counts
function getChromosomeCounts(dataset) {
    chromosomes = {};
    dataset.forEach(function(entry) {
	number = entry['chromosome'];
	if (chromosomes[number] == null) {
	    chromosomes[number] = 1;
	} else {
	    chromosomes[number] += 1;
	}
    });

    return chromosomes;
}

function getTopNDiseasesBySeverity(n, disSev) {
    topn = {};
    ds = disSev;    
    i = 0;

    // Get fatal diseases
    for (const [disease, severity] of Object.entries(ds)) {
	if (i == n) {
	    break;
	}
	
	if (severity == 'Fatal') {
	    topn[disease] = severity;
	    i++;
	}
    }

    // Get critical diseases
    for (const [disease, severity] of Object.entries(ds)) {
	if (i == n) {
	    break;
	}
	
	if (severity == 'Critical') {
	    topn[disease] = severity;
	    i++;
	}
    }

    // Get chronic diseases
    for (const [disease, severity] of Object.entries(ds)) {
	if (i == n) {
	    break;
	}
	
	if (severity == 'Chronic') {
	    topn[disease] = severity;
	    i++;
	}
    }    
   
    // TODO:
    // Add more loops for additional severity levels

    return topn;
}

// Returns a key-value array of diseases and their notes
function getDiseaseNotes(dataset) {
    notes = {};
    dataset.forEach(function(entry) {
	name = entry['diseaseName'];
	note = entry['Notes'];
	if (notes[name] == null) {
	    notes[name] = note;
	} else {
	    // TODO:
	    // Can probably just remove this else and assume it'll all work fine
	    if (notes[name] != note) {
		console.log('This should never happen if I annotate the data right');
	    }
	}
    });

    return notes;
}

// Largely copied from: https://www.d3-graph-gallery.com/graph/donut_label.html
function buildOrganChart(organs) {
    // set the dimensions and margins of the graph
    var width = 530
    height = 530
    margin = 76

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'organs-chart'
    var svg = d3.select("#organs-chart")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Prepare data
    var data = {}; //organs;

    // Sort borrowed from:
    // https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
    const sortable = Object.entries(organs)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    i = 0;
    otherCount = 0;
    for (const [key, value] of Object.entries(sortable)) {
	if (i < 15) {
	    data[key] = value;
	    i++;
	} else {
	    otherCount += value;
	}
    };
    data['Other'] = otherCount;    

    // set the color scale
    var color = d3.scaleOrdinal()
	.domain(["a", "b", "c", "d", "e", "f", "g", "h"])
	.range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
	.sort(null) // Do not sort group by size
	.value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data))

    // The arc generator
    var arc = d3.arc()
	.innerRadius(radius * 0.5)         // This is the size of the donut hole
	.outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
	.selectAll('allSlices')
	.data(data_ready)
	.enter()
	.append('path')
	.attr('d', arc)
	.attr('fill', function(d){ return(color(d.data.key)) })
	.attr("stroke", "white")
	.style("stroke-width", "2px")
	.style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg
	.selectAll('allPolylines')
	.data(data_ready)
	.enter()
	.append('polyline')
	.attr("stroke", "black")
	.style("fill", "none")
	.attr("stroke-width", 1)
	.attr('points', function(d) {
	    var posA = arc.centroid(d) // line insertion in the slice
	    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
	    var posC = outerArc.centroid(d); // Label position = almost the same as posB
	    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
	    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
	    return [posA, posB, posC]
	})

    // Add the polylines between chart and labels:
    svg
	.selectAll('allLabels')
	.data(data_ready)
	.enter()
	.append('text')
	.text( function(d) { console.log(d.data.key) ; return d.data.key } )
	.attr('transform', function(d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
	})
	.style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
	})
    
}

/*
// https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
function buildChromosomeBarChart(chromosomes) {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);
    
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    d3.csv("./data/chromosomes.csv").then(function(error, data) {
	//if (error) throw error;

	// format the data
	data.forEach(function(d) {
	    d.Count = +d.Count;
	});

	// Scale the range of the data in the domains
	x.domain(data.map(function(d) { return d.Chromosome; }));
	y.domain([0, d3.max(data, function(d) { return d.Count; })]);

	// append the rectangles for the bar chart
	svg.selectAll(".bar")
	    .data(data)
	    .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.Chromosome); })
	    .attr("width", x.bandwidth())
	    .attr("y", function(d) { return y(d.Count); })
	    .attr("height", function(d) { return height - y(d.Count); });

	// add the x Axis
	svg.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
	    .call(d3.axisLeft(y));

    });
}
*/

function displaySeverity(sevObj) {
    i = 1;
    for (const [disease, severity] of Object.entries(sevObj)) {	
	var fragment = document.createDocumentFragment();
	var element = document.createElement('span');
	element.innerHTML = disease
	fragment.appendChild(element);
	document.getElementById("disease"+i.toString()).appendChild(fragment);

	fragment = document.createDocumentFragment();
	element = document.createElement('span');
	element.innerHTML = severity;
	fragment.appendChild(element);
	document.getElementById("severity"+i.toString()).appendChild(fragment);
	i++;
    }
}

function displayChromosomes(chrObj) {
    i = 1;
    for (const [chr, count] of Object.entries(chrObj)) {
	var fragment = document.createDocumentFragment();
	var element = document.createElement('span');
	element.innerHTML = count;
	fragment.appendChild(element);
	document.getElementById("chr"+i.toString()).appendChild(fragment);
	i++;
    }
}

// Diseases and their counts
d = null;

// Organs and their counts
o = null;

// Chromosomes and their counts
c = null;

// Diseases and their severities
s = null;

// The top n diseases and their severities
topNSeverities = null;

// Diseases and their notes
diseaseNotes = null;

setTimeout(() => {
    d = uniqueDiseases(dataset);
    o = uniqueOrgans(dataset);
    s = diseaseSeverity(dataset);
    c = getChromosomeCounts(dataset);
    topNSeverities = getTopNDiseasesBySeverity(5, s);
    diseaseNotes = getDiseaseNotes(dataset);
    buildOrganChart(o);
    // buildChromosomeBarChart(c);
    console.log(d);
    console.log(o);
    console.log(s);
    console.log(c);
    console.log(topNSeverities);
    console.log(diseaseNotes);
    displaySeverity(topNSeverities);
    displayChromosomes(c);
    createDiseaseCard("Body mass index");
}, 100);







