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

## Tutorial III Apify SDK:

- How do you allocate more CPU for your actor run?
    - By allocating more memory for the actor, every CPU core corresponds to 4 GB of memory.
- How can you get the exact time when the actor was started from within the running actor process?
    - `const { startedAt } = await Apify.getEnv()`
- Which are the default storages an actor run is allocated (connected to)?
    - `apify_storage/key_value_stores/default`
- Can you change the memory allocated to a running actor?
    - No I can't, it can be automatically increased by the `Autoscaling` provided by Apify, but it only applies to solutions that run multiple tasks (URLs) for at least 30 seconds.
- How can you run an actor with Puppeteer in a headful (non-headless) mode?
    - By adding `APIFY_HEADLESS=0` environment variable, or by passing to Puppeteer the following (which is the default):
    ```launchContext: {
            launchOptions: {
                headless: false,
            },
    ```.
- Imagine the server/instance the container is running on has a 32 GB, 8-core CPU. What would be the most performant (speed/cost) memory allocation for CheerioCrawler? (Hint: NodeJS processes cannot use user-created threads)
    - 4GB, 1-core CPU.

- What is the difference between RUN and CMD Dockerfile commands?
    - The `RUN` command: triggers while building the docker image, it runs a command and commits the result.
    - The `CMD` command: triggers while launching the created docker image, it does not execute anything at build time, but specifies the intended command for the image.
    
- Does your Dockerfile need to contain a CMD command (assuming we don't want to use ENTRYPOINT which is similar)? If yes or no, why?
    -
- How does the FROM command work and which base images Apify provides?
    - The `FROM` command initializes a new build stage and sets the `Base Image` for subsequent instructions.
    - Apify provide NodeJs images.