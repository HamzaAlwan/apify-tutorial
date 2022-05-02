const Apify = require("apify");
const tools = require("./tools");
const cheerio = require("cheerio");
const {
	utils: { log },
} = Apify;


Apify.main(async () => {
	log.info('Starting actor.');
    
    const input = await Apify.getInput();
    if (!input.keyword || !input.keyword.trim()) throw new Error('Please provide a keyword.');
    
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${encodeURIComponent(input.keyword.trim())}`,
        userData: {
            label: 'SEARCH',
        },
    });

    const router = tools.createRouter({ requestQueue });

    const crawler = new Apify.PuppeteerCrawler({
		requestQueue,

        launchContext: {
            launchOptions: {
                headless: true,
            },
        },

        browserPoolOptions: {
            useFingerprints: true,
            fingerprintsOptions: {
                fingerprintGeneratorOptions: {
                    browsers: [
                        { name: 'chrome', minVersion: 96 },
                    ],
                    devices: [
                        'desktop',
                    ],
                    operatingSystems: [
                        'windows',
                        'macos'
                    ],
                },
            },
        },

        handlePageFunction: async context => {
			const { page, request } = context;

			const $ = cheerio.load(await page.content());

			log.info(`Processing ${request.userData.label} : ${request.url}`);
			await router(request.userData.label, { $, request });
		},
        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request, error}) => {
            log.debug(`Request ${request.url} failed twice.`);
            log.error(error);
        },
    });

    log.info("Starting the crawl.");
	await crawler.run();
	log.info("Actor finished.");
});