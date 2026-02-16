const { User, Role, Household, UserHousehold } = require("./src/models");
const { sequelize } = require("./src/config/database");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const email = "admin@pantrypilot.ai";
    const password = "admin-access-secure";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Default Household
    const [household] = await Household.findOrCreate({
      where: { name: "PantryPilot Test Household" },
      defaults: { subscriptionTier: "premium" },
    });

    // Create Admin User
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        passwordHash,
        firstName: "System",
        lastName: "Administrator",
        isAdmin: true,
      },
    });

    if (user && household) {
      // Ensure a Role exists
      const [role] = await Role.findOrCreate({
        where: { name: "admin" },
        defaults: { permissions: { all: true } },
      });

      await UserHousehold.findOrCreate({
        where: { userId: user.id, householdId: household.id },
        defaults: { roleId: role.id },
      });
    }

    if (created) {
      console.log("--- ADMIN NODE INITIALIZED ---");
      console.log(`Email: ${email}`);
      console.log(`Keycode: ${password}`);
      console.log("--- SYNC COMPLETE ---");
    } else {
      // Update existing user to be admin
      await user.update({ isAdmin: true, passwordHash });
      console.log("--- ADMIN NODE UPDATED ---");
      console.log(`Email: ${email}`);
      console.log(`Keycode: ${password}`);
      console.log("--- SYNC COMPLETE ---");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
