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
    // [1, 2].forEach(async (value) => {
    //   const notebook = await sequelize.models.Notebook.build({
    //     title: "test221112313122",
    //     userId: value,
    //     description: "testing3123121112222",
    //   });
    //   await notebook.save();
    // });

    // const user = await sequelize.models.Panel.findOne({
    //   where: { id: 1 },
    //   include: "rings",
    // });

    // console.log(user);
    // const newRing = await sequelize.models.Ring.build({
    //   name: "test",
    //   userId: 1,
    //   panelId: 1,
    //   sourceType: "test",
    //   contents: '{"test" : 1}',
    //   connectionDetails: '{"test" : 1}',
    //   description: "desc",
    //   visibility: "private",
    // });
    // await newRing.save();
    // console.log(newRing);
    // const userwithRings = await sequelize.models.Ring.findOne({
    //   where: { id: 15 },
    //   include: ["panels"],
    // });
    // console.log(userwithRings);

    // const panelForTesting = await sequelize.models.Panel.build({
    //   title: "test",
    //   userId: 1,
    //   notebookId: 1,
    //   collaborators: [],
    //   contents: '{"test" : 1}',
    //   ringId: 1,
    // });
    // await panelForTesting.save();
  } catch (error) {
    console.log(error);
  }
};
