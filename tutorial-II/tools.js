const Apify = require('apify');
const routes = require('./routes');
const {
    utils: { log },
} = Apify;

require('dotenv').config();

exports.createRouter = globalContext => {
    return async (routeName, requestContext) => {
        const route = routes[routeName];
        if (!route) throw new Error(`No route for name: ${routeName}`);
        log.debug(`Invoking route: ${routeName}`);
        return route(requestContext, globalContext);
    };
};

exports.sendEmail = async (email) => {
    log.info(`Sending email to '${email}'...`);

    const dataset = await Apify.openDataset();
    
    const datasetInfo = await dataset.getInfo();
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetInfo.id}/items?clean=true&format=json`;
    
    await Apify.call('apify/send-mail', {
        to: email,
        subject: 'Hamza Alwan - This is for the Apify SDK exercise',
        html: `You can find the url for SDK Tutorial II <a href="${datasetUrl}">here</a>`,
    });

    log.info('Email sent.');
}