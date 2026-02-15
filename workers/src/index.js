const { sequelize } = require('./config/database');

async function main() {
    console.log('PantryPilot Workers starting...');
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // In a real app, this might be a cron or worker queue listener
        // For E2E testing, we just verify it can start and connect
        console.log('Workers service is ready.');

        // Keep it running for E2E observation if needed
        setInterval(() => {
            console.log('Workers heartbeat...');
        }, 60000);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

main();
