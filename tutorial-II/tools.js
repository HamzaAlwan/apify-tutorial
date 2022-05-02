const Apify = require('apify');
const routes = require('./routes');
const {
    utils: { log },
} = Apify;

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
    
    await Apify.call('apify/send-mail', {
        to: email,
        subject: 'Hamza Alwan - This is for the Apify SDK exercise',
        text: `Hello World!`,
    });

    log.info('Email sent.');
}