import bcrypt from "bcryptjs";

const seedAdminUser = async (sequelize) => {
  if (process.env.SEED_ADMIN_PASSWORD) {
    const existingUser = await sequelize.models.User.findOne({
      where: { email: "satyrnplatform@gmail.com" },
    });

    if (existingUser) {
      console.log("Admin user already exists.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, salt);

    const adminUser = await sequelize.models.User.build({
      firstName: "Admin",
      lastName: "Testing",
      email: "satyrnplatform@gmail.com",
      usage: "Admin Testing Purpose",
      password: hash,
      role: "admin",
      approved: true,
      emailIsVerified: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
  } else {
    console.log("No admin password, user not created");
  }
};

const seedHelpTexts = async (sequelize) => {
  const searchableFields = [
    "ontology_labels",
    "case_status",
    "case_type",
    "cause",
    "circuit_abbrev",
    "city_name",
    "court_name",
    "state_abbrev",
    "case_id",
    "filing_date",
    "year",
    "judge",
    "case_NOS",
    "parties",
    "pacer_pro_se",
    "terminating_date",
    "case_id-header",
    "filing_date-header",
    "terminating_date-header",
    "case_NOS-header",
    "court_name-header",
    "case_name-header",
  ];

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
    seedAdminUser(sequelize);
    seedHelpTexts(sequelize);
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
  }
};

export default seeds;
