const Apify = require("apify");
const {
    utils: {
        log,
    },
} = Apify;

require('dotenv').config();

Apify.main(async () => {
    const { datasetId } = await Apify.getInput();
    const dataset = await Apify.openDataset(datasetId);

    const { items } = await dataset.getData();

    log.info(`Processing ${items.length} items...`);

    for (const product of items) {
        let cheapest;
        for (const offer in product.offers) {
            const price = offer.price ? +offer.price.slice(1) : null;

            if (!cheapest || (price && price < cheapest.price)) cheapest = offer;
        }

        product.offers = [cheapest];
    }

    await Apify.pushData(items);
});