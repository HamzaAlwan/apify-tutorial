# Apify Tutorial

## Tutorial II Apify SDK: 

- Where and how can you use JQuery with the SDK?
    - Inside `handlePageFunction` using `cheerio-crawler`.
- What is the main difference between Cheerio and JQuery?
    - Cheerio is essentially jQuery for Node.js.
    - JQuery is a library for the browser.
- When would you use CheerioCrawler and what are its limitations?
    - When the page we are crawling serves all it's content in the first HTML response, otherwise it doesn't work. Although in that case, we can use it with different crawlers like `PuppeteerCrawler` and `PlaywrightCrawler`.
- What are the main classes for managing requests and when and why would you use one instead of another?
    - `RequestQueue` supports dynamic adding and removing of requests, we use it we don't all of the urls we want to crawl, so we add them recurcevly to the queue.
    - `RequestList` is immutable, and doesn't support the adding or removing of requests, we use it when we have a predefined list of urls we want to crawl.
- How can you extract data from a page in Puppeteer without using JQuery?
    - Using `$eval`, `$$eval` functions.
- What is the default concurrency/parallelism the SDK uses?
    - `AutoscaledPool`.