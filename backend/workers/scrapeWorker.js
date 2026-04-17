const redisService = require("../services/redisService");

/**
 * A mock function to simulate extracting emails from a webpage.
 * In a real application, you would use axios/cheerio or puppeteer here.
 */
const mockScrapeJob = async (url) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let domain = "unknown.com";
            try {
                const urlObj = new URL(url);
                domain = urlObj.hostname.replace("www.", "");
            } catch (e) {
                // Invalid URL format
            }

            // Mock found email
            const randomId = Math.floor(Math.random() * 1000);
            const foundEmails = [`contact${randomId}@${domain}`, `info@${domain}`];

            resolve({ domain, emails: foundEmails });
        }, 2000); 
    });
};

const startWorker = async () => {
    console.log("🛠️ Scrape Worker started and waiting for URLs...");
    
    // Endless loop to continuously process items from the queue
    while (true) {
        try {
            // This will block for up to 5 seconds or until an item is available
            const urlToScrape = await redisService.dequeueUrl();
            
            if (urlToScrape) {
                console.log(`[Scraper Worker] Processing URL: ${urlToScrape}`);
                
                // Simulate scraping
                const { domain, emails } = await mockScrapeJob(urlToScrape);
                
                // Save extracted emails
                for (const email of emails) {
                    const result = await redisService.saveEmail(email, domain, {
                        source: urlToScrape,
                        status: "active"
                    });
                    
                    if (result.saved) {
                        console.log(`[Scraper Worker] Saved new email: ${email}`);
                    }
                }
            }
            // If no item, it continues the while loop and blocks again
        } catch (error) {
            console.error("[Scraper Worker] Error in worker loop:", error.message);
            // Throttle slightly on error to avoid tight error-looping
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
};

module.exports = { startWorker };
