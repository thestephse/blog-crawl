const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio'); // For parsing HTML
const OpenAI = require("openai");
const { isWithinTokenLimit, encode, decode } = require('gpt-tokenizer');

require('dotenv').config();

// Load the domains from domains.json
const domains = JSON.parse(fs.readFileSync('domains.json', 'utf8'));

// Your API tokens
const browserless_token = process.env.BROWSERLESS;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Iterate through the domains
(async () => {
  for (const domain of domains) {
    // Check if the blog key is not empty
    if (domain.blog && domain.blog.length > 0) {
      const url = domain.blog[0]; // Get the blog URL

      // Define the payload for the content API
      const payload = {
        url: url
      };

      // Make the POST request to the content API
      try {
        const response = await axios.post(
          `https://chrome.browserless.io/content?headless=true&slowMo=1000&stealth=true&token=${browserless_token}`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );

       // Parse the HTML content and extract the text
    const $ = cheerio.load(response.data);
    let blogContent = $('body').text();

    // Tokenize the blog content
    let tokens = encode(blogContent);

// Limit the tokens to 3000
    if (tokens.length > 3000) {
    tokens = tokens.slice(0, 3000);
    }

// Convert the tokens back to a string
    blogContent  = decode(tokens)

    // Define the prompt
    const prompt = "This is the content of a blog, find me the latest post/entry and return it as json. I want only the title and date: " + blogContent;

    // Send the text content to the OpenAI API
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: prompt}]
    });

    // Check if choices exist in the response
    if (openaiResponse.choices && openaiResponse.choices[0]) {
        let messageContent = openaiResponse.choices[0].message.content;
    
        // Use regex to extract title and date
        let titleMatch = messageContent.match(/"title": "(.*?)"/);
        let dateMatch = messageContent.match(/"date": "(.*?)"/);
    
        let title = titleMatch ? titleMatch[1] : null;
        let date = dateMatch ? dateMatch[1] : null;
    
        // Update the respective blog key
        domain.content = {
            title: title,
            date: date
        };
      domain.scraped = new Date().toISOString().split('T')[0]; // current date in YYYY-MM-DD format
      console.log(`Success, token used: ${openaiResponse.usage.total_tokens}`);
    } else {
      console.log('No choices returned from OpenAI API');
    }
      } catch (error) {
        console.error(`Failed to get content for ${url}:`, error);
        domain.error = error.message; // Add this line
      }
    }
  }

  // Write the updated content back to domains.json
  fs.writeFileSync('domains.json', JSON.stringify(domains, null, 2), 'utf8');
  console.log('All content fetched and sent to OpenAI.');
})();
