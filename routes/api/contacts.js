const express = require("express");
const {
  listContacts,
  addContact,
  getContactById,
  removeContact,
  updateContact,
} = require("../../models/contacts/contacts");
const { auth } = require("./../../midlewares/auth_midleware");

const {
  contactSchema,
  favoriteSchema,
} = require("./../../validators/contacts");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  const contacts = await listContacts(req.user.id);
  res.json({
    status: "success",
    code: 200,
    data: {
      contacts,
    },
  });
});

router.get("/:contactId", auth, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId, req.user.id);
    if (contact === null) {
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
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  if (req.body === null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });
    return;
  }

  const validation = contactSchema.validate(req.body);
  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });

    return;
  }

  const contact = await addContact({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
    owner: req.user.id,
  });

  res.status(201).json({
    status: "success",
    code: 201,
    data: { contact },
  });
});

router.delete("/:contactId", auth, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contacts = await removeContact(contactId, req.user.id);
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
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = req.body;
    if (contact == null) {
      res.status(400).json({
        status: "invalid input",
        code: 400,
      });

      return;
    }

    const validation = contactSchema.validate(contact);
    if (validation.error) {
      res.status(400).json({
        status: validation.error,
        code: 400,
      });

      return;
    }

    const updatedContact = await updateContact(contactId, req.user.id, contact);

    if (updatedContact == null) {
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
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  const { contactId } = req.params;
  const contact = req.body;
  if (contact == null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });

    return;
  }

  const validation = favoriteSchema.validate(contact);
  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });

    return;
  }

  const updatedContact = await updateContact(contactId, req.user.id, contact);

  if (updatedContact == null) {
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
