export const renderName = ({ user, replacementText = null, sessionUser }) => {
  if (!user) return "";
  const replacement = replacementText ? replacementText : "You";

  return user.id === sessionUser.id
    ? replacement
    : `${user.firstName} ${user.lastName}`;
};
