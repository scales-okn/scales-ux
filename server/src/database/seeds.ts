import bcrypt from "bcryptjs";

const seeds = async (sequelize) => {
  try {
    if (process.env.SEED_ADMIN_PASSWORD) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt);

      const adminUser = await sequelize.models.User.build({
        firstName: "Admin",
        lastName: "Testing",
        email: "satyrnplatform@gmail.com",
        usage: "Admin Testing Purpose",
        password: hash,
        role: "admin",
        approved: "true",
        emailIsVerified: true,
      });

      await adminUser.save();
    } else {
      console.log("No admin password, user not created");
    }
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
  }
};

export default seeds;
