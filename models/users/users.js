const User = require("./schema");

const getUserByEmail = async (email) => {
  return User.findOne({ email: email });
};

const getUserByVerificationToken = async (verificationToken) => {
  return User.findOne({ verificationToken: verificationToken });
};

const getUserById = async (userId) => {
  return User.findOne({ _id: userId }, { email: 1, subscription: 1 });
};

const addUser = async ({ email, password, avatarURL, verificationToken }) => {
  return User.create({ email, password, avatarURL, verificationToken });
};

const updateUser = async (userId, user) => {
  return User.findByIdAndUpdate({ _id: userId }, user, { new: true });
};

module.exports = {
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
  getUserByVerificationToken,
};
