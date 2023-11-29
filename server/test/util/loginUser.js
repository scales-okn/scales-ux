const { makeRequest } = require("../util/makeRequest.js");

const loginUser = async () => {
  try {
    const res = await makeRequest({
      method: "post",
      endpoint: `/api/users/login`,
      body: {
        email: "satyrnplatform-admin@gmail.com",
        password: process.env.SEED_ADMIN_PASSWORD,
      },
    });

    const token = `Bearer ${res.body.data.token}`;
    return token;
  } catch (error) {
    throw error;
  }
};

module.exports = { loginUser };
