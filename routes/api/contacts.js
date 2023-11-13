const express = require("express");
const {
  listContacts,
  addContact,
  getContactById,
  removeContact,
  updateContact,
} = require("./../../models/contacts");

const { schema } = require("./../../validators/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const contacts = await listContacts();
  res.json({
    status: "success",
    code: 200,
    data: {
      contacts,
    },
  });
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (contact == undefined) {
    res.json({
      status: "not found",
      code: 404,
    });
  } else {
    res.json({
      status: "success",
      code: 200,
      data: { contact },
    });
  }
});

router.post("/", async (req, res, next) => {
  if (req.body === null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });
    return;
  }

  const validation = schema.validate(req.body);
  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });

    return;
  }

  const contact = await addContact(req.body);

  res.status(201).json({
    status: "success",
    code: 201,
    data: { contact },
  });
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contacts = await removeContact(contactId);
  if (contacts == null) {
    res.status(404).json({
      status: "not found",
      code: 404,
    });
  } else {
    res.status(200).json({
      status: "contact deleted",
      code: 200,
    });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = req.body;
  if (contact == null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });

    return;
  }

  const validation = schema.validate(contact);
  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });

    return;
  }

  const updatedContact = await updateContact(contactId, contact);
  if (updateContact == null) {
    res.json({
      status: "not found",
      code: 404,
    });

    return;
  }

  res.json({
    status: "success",
    code: 200,
    data: { updatedContact },
  });
});

module.exports = router;
