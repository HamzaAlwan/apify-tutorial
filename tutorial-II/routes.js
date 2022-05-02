const Apify = require("apify");
const tools = require("./tools");
const {
	utils: { log },
} = Apify;

exports.SEARCH = async ({ $, request }, { requestQueue }) => {
	const products = $("div[data-asin][data-component-type*=search-result]");

	for (const product of products) {
		let asin = $(product).attr("data-asin");
		requestQueue.addRequest({
			url: `https://www.amazon.com/dp/${asin}`,
			userData: {
				label: "PRODUCT",
				asin,
			},
		});
	}
};

exports.PRODUCT = async ({ $, request }, { requestQueue }) => {
	let asin = request.userData.asin;

    log.info(`Adding OFFER for ${asin} to requestQueue...`);

	const descriptionElements = $('#feature-bullets ul.a-unordered-list li:not([class*="hidden"]) .a-list-item');
	let description = '';
	
	for (const element of descriptionElements) {
		description += $(element).text().trim() + '\n';
	}
	
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
	log.info("Scraping OFFERS...");
	const input = await Apify.getInput();

	const dataset = await Apify.openDataset();

	log.info("Pushing data to dataset...");

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

	await tools.sendEmail(input.email);
};
