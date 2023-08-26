const fs = require('fs');
const path = require('path');

const inputFolder = './input';
const outputFile = 'output.json';

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
      const domain = 'https://' + line.trim();
      domains.push({ domain });
    });

    processedFiles++;

    if (processedFiles === csvFiles.length) {
      fs.writeFileSync(outputFile, JSON.stringify(domains, null, 2));
      console.log('JSON file successfully created');
    }
  });
});
