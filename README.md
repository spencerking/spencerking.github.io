# CSE557A-Final-Project

The project can be accessed live [here](https://spencerking.github.io/index.html) or you can run a web server on your local machine using something like [MAMP](https://www.mamp.info/).

## Report and Presentation

Our final report is the file `KingMorganShapiro_report.pdf` and our presentation shown in class is `KingMorganShapiro_presentation.pdf`.

## Data Availability

In order to generate our data we used the Genome in a Bottle Consortium's AJtrio_HiSeq300X_cortex_variants_GRCh37_09042015.vcf which can be downloaded from their FTP server: ftp://ftp-trace.ncbi.nlm.nih.gov/giab/ftp/data/AshkenazimTrio/analysis

For the disease names we used DisGeNET's all_variant_disease_associations.tsv which can be downloaded from [https://www.disgenet.org/downloads](https://www.disgenet.org/downloads).

## Source Code Files

### css
The css files used for the project.
It is mostly bootstrap.

### data
There are two files here, `data.tsv` and `data_removed_NA_genes.tsv`.
We realized after performing our pre-processing steps that not all variants had known genes.
We simply removed these variants from our dataset and used `data_removed_NA_genes.tsv` moving forward.

### img
Custom images used for the project.
We only used one, royalty-free, permissively licensed icon which we recolored.

### js
The Javascript files used for the project.
We implemented these ourselves and used some example code from the d3 documentation, cited in comments.

### preprocessing
The preprocessing steps we used to work with the data provided by the Genome in a Bottle Consortium.

### index.html, diseases.html, and modals.html
These are the Overview page, Disease Explorer page, and Chromosome modals respectively.
