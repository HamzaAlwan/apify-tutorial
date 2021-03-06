const Apify = require("apify");
const tools = require("./tools");
const cheerio = require("cheerio");
const {
    utils: {
        log,
        puppeteer: { saveSnapshot },
    },
} = Apify;

require('dotenv').config();

Apify.main(async () => {
    const { keyword, email } = await Apify.getInput();
    if (!keyword || !keyword.trim()) throw new Error('Please provide a keyword.');

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${encodeURIComponent(keyword.trim())}`,
        userData: {
            label: 'SEARCH',
        },
    });

    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['BUYPROXIES94952']
    });

    const router = tools.createRouter({ requestQueue });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        sessionPoolOptions: {
            sessionOptions: {
                maxUsageCount: 5
            },
        },
        maxConcurrency: 5,

        handlePageFunction: async context => {
            const { page, request } = context;

            try {
                const $ = cheerio.load(await page.content());

                await router(request.userData.label, { $, request });
            } catch (err) {
                const randomNumber = Math.random();
                const key = `ERROR-LOGIN-${randomNumber}`;
                await saveSnapshot(page, { key, saveHtml: true });

                log.error(`[${request.userData.label}]: Error Occured while crawling: ${request.loadedUrl}.`);

                throw new Error(err);
            }
        },
        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request, error }) => {
            log.error(`Request ${request.url} failed twice.`, error);
        },
    });

    log.info("Starting the crawl.");
    await crawler.run();

    if (email && email.trim()) {
        await tools.sendEmail(email);
    }

    log.info("Actor finished.");
});