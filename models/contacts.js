const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data.toString());
    return contacts;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const getContactById = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data.toString());
    const contact = contacts.find((c) => c.id == contactId);
    return contact;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const removeContact = async (contactId) => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data.toString());
    const contactIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (contactIndex === -1) {
      return null;
    }

    contacts.splice(contactIndex, 1);

    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return contacts;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const addContact = async (body) => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data.toString());
    const contact = {
      id: uuidv4(),
      name: body.name,
      email: body.email,
      phone: body.phone,
    };

    contacts.push(contact);

    await fs.writeFile(contactsPath, JSON.stringify(contacts));

    return contact;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const updateContact = async (contactId, body) => {
  try {
    const data = await fs.readFile(contactsPath);
    const contacts = JSON.parse(data.toString());
    const contactIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (contactIndex === -1) {
      return null;
    }

    const updatedContact = { ...contacts[contactIndex], ...body };
    contacts[contactIndex] = updatedContact;

    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return updatedContact;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
