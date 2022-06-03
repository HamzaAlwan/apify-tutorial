const Apify = require("apify");
const axios = require('axios').default;
const {
    utils: {
        log,
    },
} = Apify;

require('dotenv').config();

Apify.main(async () => {
    const { useClient, memory, fields, maxItems } = await Apify.getInput();

    const taskId = 'jRZRviSwdpE4AdyOK';

    const getUsingClient = async () => {
        const client = Apify.newClient();

        const task = client.task(taskId);
        const { id } = await task.call({ memory });

        const dataset = client.run(id).dataset();

        const data = await dataset.downloadItems('csv', {
            limit: maxItems,
            fields
        });

        return Apify.setValue('OUTPUT', data, { contentType: 'text/csv' });
    }

    const getUsingAPI = async () => {
        return await axios.post(`https://api.apify.com/v2/actor-tasks/${taskId}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}&memory=${memory}&limit=${maxItems}&fields=${fields.join(',')}&format=csv`)
        .then(data => {
            return Apify.setValue('OUTPUT', data, { contentType: 'text/csv' });
        })
        .catch(err => {
            throw new Error(err);
        });
    }

    try {
        log.info(`Running the task using ${useClient ? 'Client' : 'API'}...`);
        if (useClient) {
            await getUsingClient();
        } else {
            await getUsingAPI();
        }
        log.info(`Finished running the task.`);
    } catch (err) {
        log.error(`Error Occured while running the task: ${err?.message}.`);
        throw new Error(err);
    }
});