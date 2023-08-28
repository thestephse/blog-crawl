const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Load the domains from output.json
const domains = JSON.parse(fs.readFileSync('domains.json', 'utf8'));

// Your API token
const api_token = process.env.BROWSERLESS;

// Create an array of promises
const promises = domains.map(async (domain) => {
  const url = domain.domain;

  // Define the payload for the scrape API
  const payload = {
    url: url,
    elements: [
      {
        selector: "a"
      }
    ]
  };

  // Make the POST request to the scrape API
  try {
    const response = await axios.post(
      `https://chrome.browserless.io/scrape?stealth=true&pause=true&token=${api_token}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Extract href values and add them to the domain object if they contain 'blog'
    const hrefs = response.data.data[0].results
    .map(result => result.attributes.find(attr => attr.name === 'href'))
    .filter(hrefAttr => hrefAttr && (hrefAttr.value.includes('/blog') || hrefAttr.value.includes('blog.')))
    .map(hrefAttr => {
      // Check if hrefAttr.value is a complete URL
      if (!hrefAttr.value.startsWith('http')) {
        // If not, prepend the domain to it
        hrefAttr.value = url + hrefAttr.value;
      }
  
    // Remove everything after '/blog/'
const index = hrefAttr.value.indexOf('/blog/');
return index !== -1 ? hrefAttr.value.slice(0, index + 6) : hrefAttr.value;
    });
    // Remove duplicates
    const uniqueHrefs = [...new Set(hrefs)];

    console.log(`Found ${uniqueHrefs.length} unique hrefs containing 'blog' for domain ${url}`);

    domain.blog = uniqueHrefs;
  } catch (error) {
    console.error(`Error scraping ${url}: `, error.message);
    domain.error = error.message;
  }
});

// Wait for all promises to resolve
Promise.allSettled(promises).then(() => {
  // Save the domains array back into the domains.json file
  fs.writeFile('domains.json', JSON.stringify(domains, null, 2), (err) => {
    if (err) throw err;
    console.log('Domains written to file');
  });
});
