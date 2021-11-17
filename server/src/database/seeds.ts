import bcrypt from "bcryptjs";

export const seeds = async (sequelize) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("Pass-word-25", salt);

    const adminUser = await sequelize.models.User.build({
      firstName: "Admin",
      lastName: "Testing",
      email: "admin@testing.test",
      usage: "Admin Testing Purpose",
      password: hash,
      role: "admin",
      approved: "true",
      emailIsVerified: true,
    });
    await adminUser.save();

    const userForTesting = await sequelize.models.User.build({
      firstName: "User",
      lastName: "Testing",
      email: "user@testing.test",
      usage: "User Testing Purpose",
      password: hash,
      role: "user",
      approved: "true",
      emailIsVerified: true,
    });
    await userForTesting.save();
  } catch (error) {
    console.log(error);
  }

  try {
    [
      {
        title: "Notebook Test",
        description: "Notebook description",
        userId: 1,
      },
      {
        title: "Notebook Testing",
        description: "Notebook description",
        userId: 2,
      },
    ].forEach(async ({ title, description, userId }) => {
      const notebook = await sequelize.models.Notebook.build({
        title,
        description,
        userId,
      });
      await notebook.save();
    });

    // // console.log(user);
    const newRing = await sequelize.models.Ring.build({
      id: 1, // database id
      userId: 1, // database owner id
      visibility: "public",
      rid: "20e114c2-ef05-490c-bdd8-f6f271a6733f", // unique ring id regardless of storage location -- we'll use this + version # below to request rings, regardless of db id
      version: 1, // ring version number
      name: "Basic Ring",
      description:
        "A simple ring for testing and development based on the political contributions data.",
      schemaVersion: 2.1, // ring schema version number (for compiler changes over time with backwards compatibility)
      dataSource: {
        type: "sqlite",
        connectionString: "basic.db", // db name if sqlite, list of flat file names if uploads, connection string if hosted db -- we'll have to add something to core about where sqlite/flat files get stored/queried from. Actually -- maybe better to store the raw data of flat files/sqlites as a blob directly in the schema so they "move around" with the db? TODO: let's discuss
        tables: [
          {
            name: "contribution",
            primaryKey: "id",
            pkType: "integer",
          },
          {
            name: "contributor",
            primaryKey: "id",
            pkType: "integer",
          },
        ],
        joins: [
          {
            name: "contributor",
            from: "contribution",
            to: "contributor",
            path: [
              ["contribution.contributor_id", "contributor.id", "integer"],
            ],
            bidirectional: true,
          },
        ],
      },
      ontology: {
        // defaultTargetEntity, relationships and entities are here
        defaultTargetEntity: "Contribution",
        relationships: [
          {
            name: "ContribToContributor",
            from: "Contribution",
            to: "Contributor",
            join: "contributor",
            relation: "m2o",
            bidirectional: true,
          },
        ],
        entities: [
          {
            name: "Contribution",
            table: "contribution",
            id: "id",
            idType: "integer",
            renderable: false,
            reference: "${amount}",
            attributes: {
              amount: {
                nicename: ["Contribution Amount", "Contribution Amounts"],
                units: ["dollar", "dollars"],
                isa: "float",
                source: {
                  table: "contribution",
                  columns: ["amount"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                },
              },
              inState: {
                nicename: [
                  "In State Contribution Status",
                  "In State Contribution Statuses",
                ],
                isa: "boolean",
                source: {
                  table: "contribution",
                  columns: ["in_state"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                },
              },
              electionYear: {
                nicename: ["Election Year", "Election Years"],
                isa: "integer",
                source: {
                  table: "contribution",
                  columns: ["election_year"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                  description: "The year of this election.",
                },
              },
              contributionRecipient: {
                nicename: ["Recipient", "Recipients"],
                isa: "string",
                source: {
                  table: "contribution",
                  columns: ["contribution_recipient"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                  autocomplete: true,
                },
              },
              contributionDate: {
                nicename: ["Contribution Date", "Contribution Dates"],
                isa: "datetime",
                source: {
                  table: "contribution",
                  columns: ["contribution_date"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                  autocomplete: true,
                },
              },
            },
          },
          {
            name: "Contributor",
            table: "contributor",
            id: "id",
            idType: "integer",
            renderable: false,
            reference: "${name}",
            attributes: {
              name: {
                nicename: ["Contributor", "Contributor"],
                isa: "string",
                source: {
                  table: "contributor",
                  columns: ["name"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                  autocomplete: true,
                },
              },
              parentOrg: {
                nicename: [
                  "Contributor Parent Organization",
                  "Contributor Parent Organizations",
                ],
                isa: "string",
                source: {
                  table: "contributor",
                  columns: ["parent_org"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                  description:
                    "The organization this contributor is associated with.",
                },
              },
              area: {
                nicename: ["Contributor Sector", "Contributor Sectors"],
                isa: "string",
                source: {
                  table: "contributor",
                  columns: ["area"],
                },
                metadata: {
                  searchable: true,
                  allowMultiple: false,
                  searchStyle: "range",
                  analyzable: true,
                },
              },
            },
          },
        ],
      },
    });

    await newRing.save();

    // const panelForTesting = await sequelize.models.Panel.build({
    //   title: "test",
    //   userId: 1,
    //   notebookId: 1,
    //   contents: '{"test" : 1}',
    //   ringId: 1,
    // });
    // await panelForTesting.save();
  } catch (error) {
    console.log(error);
  }
};
