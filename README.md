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

## Tutorial IV Apify SDK:

- Do you have to rebuild an actor each time the source code is changed?
    - Yes, because we need to rebuild the docker image.
- What is the difference between pushing your code changes and creating a pull request?
    - Pushing the code directly merges the changes with the branch the changes are pushed to.
    - Creating a pull request send a request to the repository owner to merge the changes, to any branch, where we can compare the changes with the branch we want to merge the changes to.
- How does the apify push command work? Is it worth using, in your opinion?
    - This command uploads your project to the Apify cloud and builds an actor from it. Yes some times it worth using since it does multiple steps at once.

## Tutorial V Apify SDK:

- What is the relationship between actor and task?
    - Tasks let you create multiple re-usable configurations of a single actor that are adapted for specific use cases.
- What are the differences between default (unnamed) and named storage? Which one would you choose for everyday usage?
    - Named and unnamed storages are the same in all regards except their retention period. The only difference is that named storages make it easier to verify you are using the correct store.
    - I would choose the unnamed storage, unless I need the data to be persistent.
- What is the relationship between the Apify API and the Apify client? Are there any significant differences?
    - Apify is the official library to access Apify API from your JavaScript applications and it provides useful features like automatic retries and convenience functions that improve the experience of using the Apify API.
- Is it possible to use a request queue for deduplication of product IDs? If yes, how would you do that?
    - Yes, you can use a `RequestQueue` to deduplicate product IDs, it automatically ignores duplicate urls.
- What is data retention and how does it work for all types of storage (default and named)?
    - Data retention is a time period after which data is deleted from the storage, unnamed storages expire after 7 days unless otherwise specified. Named storages are retained indefinitely.
- How do you pass input when running an actor or task via the API?
    - You can pass the input as the body of the request as a JSON object.


## Tutorial VI Apify SDK:

- What types of proxies does the Apify Proxy include? What are the main differences between them?
    - Datacenter proxy, Residential proxy and Google SERP proxy.
- Which proxies (proxy groups) can users access with the Apify Proxy trial? How long does this trial last?
    - Shared proxy groups, the trial lasts for 30 days.
- How can you prevent a problem that one of the hardcoded proxy groups that a user is using stops working (a problem with a provider)? What should be the best practices?
    -
- Does it make sense to rotate proxies when you are logged in?
    - No.
- Construct a proxy URL that will select proxies only from the US (without specific groups).
- What do you need to do to rotate proxies (one proxy usually has one IP)? How does this differ for Cheerio Scraper and Puppeteer Scraper?
    - Because the IP address might become blocked or banned.
- Try to set up the Apify Proxy (using any group or auto) in your browser. This is useful for testing how websites behave with proxies from specific countries (although most are from the US). You can try Switchy Omega extension but there are many more. Were you successful?
    - 
- Name a few different ways a website can prevent you from scraping it.
    - IP detection, IP rate limiting, Browser detection, and Tracking user behavior.

- Do you know any software companies that develop anti-scraping solutions? Have you ever encountered them on a website?
    - No, captcha.


## Tutorial VII Apify SDK:
- Actors have a Restart on error option in their Settings. Would you use this for your regular actors? Why? When would you use it, and when not?
    - No, since it will probably fail again for the same error if not handled.
    - I will use it only for some testing (like to see if an error is reproducable).
-  Migrations happen randomly, but by setting Restart on error and then throwing an error in the main process, you can force a similar situation. Observe what happens. What changes and what stays the same in a restarted actor run?
    - 
- Why don't you usually need to add any special code to handle migrations in normal crawling/scraping? Is there a component that essentially solves this problem for you?
    - The Apify SDK persists its state automatically, using the `migrating` and `persistState` events. persistState notifies SDK components to persist their state at regular intervals in case a migration happens. The migrating event is emitted just before a migration.
- How can you intercept the migration event? How much time do you need after this takes place and before the actor migrates?
    - We can intercept the migration event using `Apify.events.on('migrating', () => {...}).`
    - When a migration event occurs, you only have a few seconds to save your work.
- When would you persist data to a default key-value store and when would you use a named key-value store?
    - I would presest the final data that I need from the actor run in a named key-value store, other wise I would have to persist the data in a default key-value store.