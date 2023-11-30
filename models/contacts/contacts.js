const Contact = require("./schema");

const listContacts = async (ownerId) => {
  return Contact.find({ owner: ownerId });
};

const getContactById = (contactId, ownerId) => {
  return Contact.findOne({ _id: contactId, owner: ownerId });
};

const removeContact = async (contactId, ownerId) => {
  return Contact.findOneAndDelete({ _id: contactId, owner: ownerId });
};

const addContact = async ({ name, email, phone, favorite, owner }) => {
  return Contact.create({ name, email, phone, favorite, owner });
};

const updateContact = async (contactId, ownerId, body) => {
  return Contact.findOneAndUpdate({ _id: contactId, owner: ownerId }, body, {
    new: true,
  });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
