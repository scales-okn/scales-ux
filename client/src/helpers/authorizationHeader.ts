export const authorizationHeader = (token = "") => {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
};
