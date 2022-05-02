const Apify = require("apify");
const {
	utils: { log },
} = Apify;

require('dotenv').config();

exports.SEARCH = async ({ $ }, { requestQueue }) => {
	const items = $("div[data-asin][data-component-type*=search-result]");

	log.info(`Processing ${items.length} items...`);

	for (const item of items) {
		let asin = $(item).attr("data-asin");

		log.info(`Adding ${asin} item to requestQueue...`);

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

	const descriptionElements = $('#feature-bullets ul.a-unordered-list li:not([class*="hidden"]) .a-list-item');
	let description = '';

	for (const element of descriptionElements) {
		description += $(element).text().trim() + '\n';
	}

	log.info(`Adding ${asin} item offers to requestQueue...`);

	requestQueue.addRequest({
		url: `https://www.amazon.com/gp/offer-listing/${asin}`,
		userData: {
			label: "OFFER",
			url: request.loadedUrl,
			title: $("#productTitle").text().trim(),
			description,
			pinnedOfferShippingPrice: $("#amazonGlobal_feature_div > span.a-size-base.a-color-secondary").text().trim().split(' ')[0] || null,
		},
	});
};

exports.OFFER = async ({ $, request }) => {
	const input = await Apify.getInput();
	const dataset = await Apify.openDataset();

	log.info("Pushing offers to dataset...");

	// Push pinned offer
	await dataset.pushData({
		url: request.userData.url,
		title: request.userData.title,
		description: request.userData.description,
		keyword: input.keyword.trim(),
		sellerName: $('#aod-pinned-offer #aod-offer-soldBy [aria-label*="Opens a new page"]').text().trim(),
		price: $(`#aod-pinned-offer [id*="aod-price"] span.a-offscreen`).text().trim(),
		shippingPrice: request.userData.pinnedOfferShippingPrice,
	});

	let offers = $("#all-offers-display #aod-offer-list #aod-offer");

	if (offers.length) {
		for (const offer of offers) {
			const shippingPrice = $(offer)
				.find("[data-csa-c-delivery-price]")
				.attr("data-csa-c-delivery-price");
			await dataset.pushData({
				url: request.userData.url,
				title: request.userData.title,
				description: request.userData.description,
				keyword: input.keyword.trim(),
				sellerName: $(offer).find('#aod-offer-soldBy [aria-label*="Opens a new page"]').text().trim(),
				price: $(offer).find(`[id*="aod-price"] span.a-offscreen`).text().trim(),
				shippingPrice: shippingPrice ? shippingPrice.trim() || null : null
			});
		}
	}
};
