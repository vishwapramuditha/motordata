const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// The output path where the scraped JSON will be saved
const OUTPUT_PATH = path.join(__dirname, '../data/f1/2026/results.json');

async function scrapeF1Results() {
    console.log("🚀 Starting Automated F1 Web Scraper...");
    try {
        // Step 1: Fetch the HTML page (e.g., Wikipedia, Official site, etc.)
        // For demonstration, we fetch the 2024 F1 Wikipedia page
        const url = 'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship';
        console.log(`📡 Fetching data from: ${url}`);
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'MotorData-ScraperBot/1.0 (https://github.com/vishwapramuditha/motordata)'
            }
        });

        // Step 2: Load HTML into Cheerio for easy DOM parsing
        const $ = cheerio.load(html);
        
        // Step 3: Parse the HTML tables to extract the data
        // (This is a simplified parsing example targeting Wikipedia tables)
        const standings = [];
        
        // Example: Find the first wikitable (which is usually the standings)
        const table = $('table.wikitable').first();
        
        table.find('tr').each((index, element) => {
            if (index === 0) return; // Skip header row
            
            const tds = $(element).find('td, th');
            if (tds.length < 2) return;
            
            let position = $(tds[0]).text().trim();
            let driverName = $(tds[1]).text().trim();
            
            // Wikipedia tables are messy, fallback if we didn't parse a number
            if (!position || isNaN(parseInt(position))) {
                position = index;
                driverName = driverName || "Unknown Driver";
            }
            
            const driverId = driverName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            
            standings.push({
                position: parseInt(position, 10),
                driverId: driverId || 'unknown'
            });
        });

        console.log(`✅ Scraped ${standings.length} drivers from the web.`);

        if (standings.length === 0) {
            throw new Error("No standings found. The website structure may have changed.");
        }

        // Step 4: Format the data into our strict MotorData JSON Schema
        const payload = {
            raceId: "latest-championship-standings",
            season: 2026,
            results: standings.slice(0, 5) // Just taking top 5 for this template
        };

        // Step 5: Save the JSON file to our data directory!
        // Make sure directory exists
        const dir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf-8');
        console.log(`💾 Successfully updated API endpoint at: ${OUTPUT_PATH}`);

    } catch (error) {
        console.error("❌ Scraper Failed:", error.message);
        process.exit(1); // Exit with error code so GitHub Actions marks the job as Failed
    }
}

// Run the scraper
scrapeF1Results();
