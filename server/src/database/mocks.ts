import bcrypt from "bcryptjs";

const users = async (sequelize) => {};

export const mocks = async (sequelize) => {
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
    // [{title: "Notebook Test", description:"Notebook description", userId: 1}, {title: "Notebook Testing", description:"Notebook description", userId: 2}].forEach(async ({title, description, userId}) => {
    //   const notebook = await sequelize.models.Notebook.build({
    //     title, description, userId
    //   });
    //   await notebook.save();
    // });

    // const user = await sequelize.models.Panel.findOne({
    //   where: { id: 1 },
    //   include: "rings",
    // });

    // // console.log(user);
    // const newRing = await sequelize.models.Ring.build({
    //   name: "Basic Ring",
    //   userId: 1,
    //   sourceType: "test",
    //   contents: '{"name":"Basic Ring","slug":"basic-ring","id":"20e114c2-ef05-490c-bdd8-f6f271a6733f","version":"2.1","defaultTargetEntity":"Contribution","description":"A simple ring for testing and development based on the political contributions data.","dataSource":{"type":"sqlite","connectionString":"/Users/andrewpaley/Dropbox/c3/satyrn-templates/basic_v2/basic.db","tables":[{"name":"contribution","primaryKey":"id","pkType":"integer"},{"name":"contributor","primaryKey":"id","pkType":"integer"}],"joins":[{"name":"contributor","from":"contribution","to":"contributor","path":[["contribution.contributor_id","contributor.id","integer"]],"bidirectional":true}]},"relationships":[{"name":"ContribToContributor","from":"Contribution","to":"Contributor","join":"contributor","relation":"m2o","bidirectional":true}],"entities":[{"name":"Contribution","table":"contribution","id":"id","idType":"integer","renderable":false,"reference":"${amount}","attributes":{"amount":{"nicename":["Contribution Amount","Contribution Amounts"],"units":["dollar","dollars"],"isa":"float","metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true}},"inState":{"nicename":["In State Contribution Status","In State Contribution Statuses"],"isa":"boolean","source":{"table":"contribution","columns":["in_state"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true}},"electionYear":{"nicename":["Election Year","Election Years"],"isa":"integer","source":{"table":"contribution","columns":["election_year"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true,"description":"The year of this election."}},"contributionRecipient":{"nicename":["Recipient","Recipients"],"isa":"string","source":{"table":"contribution","columns":["contribution_recipient"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true,"autocomplete":true}},"contributionDate":{"nicename":["Contribution Date","Contribution Dates"],"isa":"datetime","source":{"table":"contribution","columns":["contribution_date"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true,"autocomplete":true}}}},{"name":"Contributor","table":"contributor","id":"id","idType":"integer","renderable":false,"reference":"${name}","attributes":{"name":{"nicename":["Contributor","Contributor"],"isa":"string","source":{"table":"contributor","columns":["name"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true,"autocomplete":true}},"parentOrg":{"nicename":["Contributor Parent Organization","Contributor Parent Organizations"],"isa":"string","source":{"table":"contributor","columns":["parent_org"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true,"description":"The organization this contributor is associated with."}},"area":{"nicename":["Contributor Sector","Contributor Sectors"],"isa":"string","source":{"table":"contributor","columns":["area"]},"metadata":{"searchable":true,"allowMultiple":false,"searchStyle":"range","analyzable":true}}}}]}',
    //   connectionDetails: '{"test" : 1}',
    //   description: "A simple ring for testing and development based on the political contributions data.",
    //   visibility: "public",
    // });
    // await newRing.save();
    // console.log(newRing);
    // // const userwithRings = await sequelize.models.Ring.findOne({
    // //   where: { id: 15 },
    // //   include: ["panels"],
    // // });
    // // console.log(userwithRings);

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
