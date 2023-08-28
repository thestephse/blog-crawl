const { exec } = require('child_process');

// Execute the createJson.js script
exec('node createJson.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing createJson.js: ${error}`);
    return;
  }

  console.log(`createJson.js stdout: ${stdout}`);
  console.error(`createJson.js stderr: ${stderr}`);

  // Execute the scrapeLinks.js script
  exec('node scrapeLinks.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing scrapeLinks.js: ${error}`);
      return;
    }

    console.log(`scrapeLinks.js stdout: ${stdout}`);
    console.error(`scrapeLinks.js stderr: ${stderr}`);
  });
});
