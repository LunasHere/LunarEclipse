const express = require('express');
const cors = require('cors');

// get port from config
const config = require('../config.json');
const port = config.port || 3000;
const routes = require('./routes');

function createApp() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(cors({
        origin: ['http://localhost:3000'],
        credentials: true,     
    }));
    app.use('/api', routes);
    return app;
}


async function main(client) {
    try {
        const app = createApp();
        app.listen(port, () => {
            client.log(`API is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting the API:', error);
    }
}

module.exports = main; // Export the main function