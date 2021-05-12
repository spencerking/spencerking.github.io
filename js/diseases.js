dataset = null;

d3.tsv("./data/data_removed_NA_genes.tsv").then(function (data) {
	//console.log(data[0]);
	dataset = data;
});

// Returns a key-value array of diseases and their mutation counts
function uniqueValues(column) {
	values = {};
	var name;
	dataset.forEach(function (entry) {
		name = entry[column];
		if (values[name] == null) {
			values[name] = 1;
		} else {
			values[name] += 1;
		}
	});

	return values;
}

// Returns a key-value array of diseases and their notes
function getDiseaseNotes(dataset) {
	notes = {};
	dataset.forEach(function (entry) {
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

function setFilterType(value) {
	var select = document.getElementById("filter-value-select");
	var entry_values = uniqueValues(value);

	if (entry_values == null || entry_values.length == 0) {
		return;
	}

	var value_list = [];

	for (const val in entry_values) {
		if (entry_values.hasOwnProperty(val)) {
			value_list.push(val);
		}
	}

	while (select.firstChild) {
		select.removeChild(select.firstChild);
	}

	value_list.sort(function (a, b) {
		return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
	});
	var option = document.createElement("option");
	select.add(option);
	value_list.forEach(function (val) {
		var option = document.createElement("option");
		var pretty = val.toLocaleLowerCase();
		pretty = pretty[0].toUpperCase() + pretty.slice(1);
		option.text = pretty;
		option.value = val;
		select.add(option);
	});
}

function filterValues(value) {
	var filter_type = document.getElementById("filter-select").value;
	var main = document.getElementById("card-container");
	while (main.firstChild) {
		main.removeChild(main.firstChild);
	}

	if (filter_type == "diseaseName") {
		createDiseaseCard(value);
	} else {
		var disease_obj = {};
		dataset.forEach(function (row) {
			if (row[filter_type] == value) {
				disease_obj[row["diseaseName"]] = 1;
			}
		});
		Object.keys(disease_obj).forEach(createDiseaseCard);
	}
}

function displaySeverity(sevObj) {
	for (const [disease, severity] of Object.entries(sevObj)) {
		var fragment = document.createDocumentFragment();
		var element = document.createElement('p');
		element.innerHTML = disease + ' - ' + severity
		fragment.appendChild(element);
		document.getElementById("sev-list").appendChild(fragment);
	}
}

// Functionality for Disease Card



function createDiseaseCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h5');
	title.innerText = disease;
	title.className = 'card-header d-flex justify-content-between align-items-center';

	var btn = document.createElement("BUTTON");
	btn.innerText = "-";
	btn.onclick = function () {
		cardBody.hidden = (btn.innerText === "+") ? '' : 'hidden';
		btn.innerText = (btn.innerText === "+") ? '-' : '+';
	};

	btn.classList.add("btn");
	btn.classList.add("btn-secondary");
	btn.classList.add("float-right");

	title.appendChild(btn);

	let genes = listOfGenesCard(disease);
	let diseaseInfo = diseaseInfoCard(disease);

	card.appendChild(title);
	cardBody.appendChild(diseaseInfo);
	cardBody.appendChild(genes);
	card.appendChild(cardBody);

	document.getElementById('card-container').appendChild(card);
}

function listOfGenesCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h6');
	title.innerText = "List of Genes";
	title.className = 'card-title';
	cardBody.appendChild(title);


	var genesID = new Set();
	dataset.forEach(function (entry) {
		if (entry['diseaseName'] == disease && !genesID.has(entry['gene_id'])) {
			var gene_symbol = document.createTextNode(entry['gene_symbol']);
			var div = document.createElement('div');
			div.appendChild(gene_symbol);
			cardBody.appendChild(div);
			genesID.add(entry['gene_id']);
		}
	});

	card.appendChild(cardBody);
	return card;
}


function diseaseInfoCard(disease) {
	let card = document.createElement('div');
	card.className = 'card';

	let cardBody = document.createElement('div');
	cardBody.className = 'card-body';

	let title = document.createElement('h6');
	title.innerText = "Disease Info";
	title.className = 'card-title';
	cardBody.appendChild(title);


	var consequences = new Set();
	var organs = new Set();
	var severity = new Set();
	var description = new Set();
	dataset.forEach(function (entry) {
		if (entry['diseaseName'] == disease) {
			consequences.add(entry['major_consequence']);
			organs.add(entry['Organ']);
			severity.add(entry['Severity']);
			description.add(entry['Notes'])
			
		}
	});

	
	
	cardBody = straightenLists(cardBody, description, "Description");
	//cardBody = straightenLists(cardBody, consequences, "Consequences");
	cardBody = straightenLists(cardBody, organs, "Organs");
	cardBody = straightenLists(cardBody, severity, "Severity");
	card.appendChild(cardBody);
	return card;

}

function straightenLists(cardBody, setOrigin, title) {
	if (setOrigin.size > 1) {
		var div = document.createElement('div');
		var text = document.createTextNode(title + ": " + Array.from(setOrigin).join(", "));
		div.appendChild(text);
		cardBody.appendChild(div);
	} else {
		var div = document.createElement('div');
		var text = document.createTextNode(title + ": " + Array.from(setOrigin)[0]);
		div.appendChild(text);
		cardBody.appendChild(div);
	}

	return cardBody
}

// Diseases and their notes
diseaseNotes = null;

setTimeout(() => {
	diseaseNotes = getDiseaseNotes(dataset);
	//console.log(diseaseNotes);
	setFilterType(document.getElementById("filter-select").value);
}, 100);
