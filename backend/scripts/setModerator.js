/**
 * Utility script to set a user as moderator
 * Usage: node dist/scripts/setModerator.js <email>
 * 
 * Make sure to build the backend first: npm run build
 */

const User = require("../models/User").default;
const sequelize = require("../config/db").default;

const setUserAsModerator = async (email) => {
  try {
    await sequelize.sync();
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error(`❌ User with email '${email}' not found`);
      process.exit(1);
    }

    user.role = "moderator";
    await user.save();

    console.log(`✅ Successfully set ${user.name} (${user.email}) as moderator`);
    console.log(`   Role: ${user.role}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting user as moderator:", error);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node dist/scripts/setModerator.js <email>");
  process.exit(1);
}

setUserAsModerator(email);
