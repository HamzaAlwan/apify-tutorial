const Apify = require("apify");
const {
	utils: { log },
} = Apify;

require('dotenv').config();

const asinsData = await Apify.getValue("ASINS_DATA") || {};

Apify.events.on('migrating', async () => {
    await Apify.setValue("ASINS_DATA", asinsData);
});

// Log the Asins data every 20 seconds
setInterval(() => {
	log.info(`[ASINS]: Current asins data.`, asinsData);
}, 20000);

exports.SEARCH = async ({ $ }, { requestQueue }) => {
	const items = $("div[data-asin][data-component-type*=search-result]");

	log.info(`Processing ${items.length} items...`);

	for (const item of items) {
		let asin = $(item).attr("data-asin");

		log.info(`[ITEM]: Adding ${asin} item to requestQueue...`);

		requestQueue.addRequest({
			url: `https://www.amazon.com/dp/${asin}`,
			userData: {
				label: "ITEM",
				asin,
			},
		});
	}
};

exports.ITEM = async ({ $, request }, { requestQueue }) => {
	let asin = request.userData.asin;

	log.info(`[OFFERS]: Adding ${asin} item offers to requestQueue...`);

	// Save number of offers for each asin
	asinsData[asin] = asinsData[asin] ? asinsData[asin] + 1 : 1;

	requestQueue.addRequest({
		url: `https://www.amazon.com/gp/offer-listing/${asin}`,
		userData: {
			label: "OFFERS",
			url: request.loadedUrl,
			title: $("#productTitle").text().trim(),
			description: $("#productDescription p").text().trim(),
			// I noticed that there is no shiiping price for the pinned offer when you go to the offers page, so I get it from the item page.
			pinnedOfferShippingPrice: $("#amazonGlobal_feature_div > span.a-size-base.a-color-secondary").text().trim().split(' ')[0] || null,
		},
	});
};

exports.OFFERS = async ({ $, request }) => {
	const { keyword } = await Apify.getInput();
	const dataset = await Apify.openDataset();

	const {
		userData: { url, title, description, pinnedOfferShippingPrice },
	} = request;

	log.info("Pushing offers to dataset...");

	// Pinned offer
	let result = {
		url,
		title,
		description,
		keyword: keyword.trim(),
		offersUrl: request.loadedUrl,
		offers: [{
			sellerName: $('#aod-pinned-offer #aod-offer-soldBy [aria-label*="Opens a new page"]').text().trim(),
			price: $(`#aod-pinned-offer [id*="aod-price"] span.a-offscreen`).text().trim(),
			shippingPrice: pinnedOfferShippingPrice,
		}]
	}

	let offers = $("#all-offers-display #aod-offer-list #aod-offer");

	if (offers.length) {
		for (const offer of offers) {
			const sellerName = $(offer).find('#aod-offer-soldBy [aria-label*="Opens a new page"]').text().trim();
			if (sellerName) {
				const shippingPrice = $(offer)
					.find("[data-csa-c-delivery-price]")
					.attr("data-csa-c-delivery-price");

				result.offers.push({
					sellerName,
					price: $(offer).find(`[id*="aod-price"] span.a-offscreen`).text().trim(),
					shippingPrice: shippingPrice ? shippingPrice.trim() || null : null
				});
			}
		}
	}

	if (result.offers.length) {
		await dataset.pushData(result);
	}
};
