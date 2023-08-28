const fs = require('fs');
const path = require('path');

const inputFolder = './input';
const outputFile = 'domains.json';

const domains = [];

fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('An error occurred:', err);
    return;
  }

  const csvFiles = files.filter(file => file.endsWith('.csv'));

  let processedFiles = 0;

  csvFiles.forEach(file => {
    const inputFile = path.join(inputFolder, file);

    fs.readFileSync(inputFile, 'utf-8').split('\n').forEach(line => {
      line = line.trim();
      if (line) { // check if line is not empty
        const domain = 'https://' + line;
        domains.push({ domain });
      }
    });

    processedFiles++;

    if (processedFiles === csvFiles.length) {
      fs.writeFileSync(outputFile, JSON.stringify(domains, null, 2));
      console.log('JSON file successfully created');
    }
  });
});
