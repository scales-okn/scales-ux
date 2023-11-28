import bcrypt from "bcryptjs";

const seedUser = async ({ sequelize, email, firstName, lastName, role }) => {
  if (process.env.SEED_ADMIN_PASSWORD) {
    const existingUser = await sequelize.models.User.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log("Admin user already exists.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt);

    const adminUser = await sequelize.models.User.build({
      firstName,
      lastName,
      email,
      usage: "Admin Testing Purpose",
      password: hash,
      role,
      approved: true,
      emailIsVerified: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
  } else {
    console.log("No admin password, user not created");
  }
};

const seedUsers = async (sequelize) => {
  const testUsers = [
    {
      email: "satyrnplatform-standard@gmail.com",
      firstName: "Standard",
      lastName: "User",
      role: "user",
    },
    {
      email: "satyrnplatform-admin@gmail.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  ];

  if (process.env.NODE_ENV !== "production") {
    testUsers.map(async (user) => {
      const { email, firstName, lastName, role } = user;
      await seedUser({ sequelize, email, firstName, lastName, role });
    });
  }

  await seedUser({ sequelize, email: "satyrnplatform@gmail.com", firstName: "Admin", lastName: "Testing", role: "admin" });
};

const seedHelpTexts = async (sequelize) => {
  const searchableFields = ["ontology_labels", "case_status", "case_type", "cause", "circuit_abbrev", "city_name", "court_name", "state_abbrev", "case_id", "filing_date", "year", "judge", "case_NOS", "parties", "pacer_pro_se", "terminating_date", "case_id-header", "filing_date-header", "terminating_date-header", "case_NOS-header", "court_name-header", "case_name-header"];

  for (const slug of searchableFields) {
    const description = "";

    const existingHelpText = await sequelize.models.HelpText.findOne({
      where: { slug },
    });

    if (!existingHelpText) {
      const newHelpText = await sequelize.models.HelpText.build({
        slug,
        description,
      });

      await newHelpText.save();
    }
  }
};

const seeds = async (sequelize) => {
  try {
    seedUsers(sequelize);
    seedHelpTexts(sequelize);
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
  }
};

export default seeds;
