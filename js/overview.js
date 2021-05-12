dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function(data) {
    //console.log(data[0]);
    dataset = data;
});


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
		//console.log('This should never happen if I annotate the data right');
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
		//console.log('This should never happen if I annotate the data right');
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
	.text( function(d) { return d.data.key } )
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
    // console.log(d);
    // console.log(o);
    // console.log(s);
    // console.log(c);
    // console.log(topNSeverities);
    // console.log(diseaseNotes);
    displaySeverity(topNSeverities);
    displayChromosomes(c);
}, 100);







