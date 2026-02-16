const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll({ attributes: ['email', 'isAdmin', 'passwordHash'] });
        console.log('--- USER LIST ---');
        users.forEach(u => {
            console.log(`Email: ${u.email}, Admin: ${u.isAdmin}, Hash: ${u.passwordHash}`);
        });
        console.log('--- END LIST ---');
    } catch (err) {
        console.error('Error querying users:', err);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
