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

    const { products } = await dataset.getData();

    for (const product of products) {
        let cheapest;
        for (const offer in product.offers) {
            const price = +offer.price.slice(1);

            if (!cheapest || price < cheapest.price) cheapest = offer;
        }

        product.offers = [cheapest];
    }

    await Apify.pushData(products);
});