const express = require("express");
const { userSchema } = require("./../../validators/users");
const {
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
} = require("./../../models/users/users");

const { auth } = require("./../../midlewares/auth_midleware");

const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res, next) => {
  if (req.body === null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });
    return;
  }

  const validation = userSchema.validate(req.body);

  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });
    return;
  }

  const user = await getUserByEmail(req.body.email);
  if (user) {
    res.status(409).json({
      code: 409,
      message: "Email is already in use",
    });

    return;
  }
  try {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      const user = await addUser({
        email: req.body.email,
        password: hash,
      });
      res.status(201).json({
        status: "success",
        code: 201,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  if (req.body === null) {
    res.status(400).json({
      status: "invalid input",
      code: 400,
    });
    return;
  }

  const validation = userSchema.validate(req.body);
  if (validation.error) {
    res.status(400).json({
      status: validation.error,
      code: 400,
    });
    return;
  }

  const user = await getUserByEmail(req.body.email);
  if (!user) {
    res.status(401).json({
      code: 401,
      message: "Email or password is wrong 1",
    });

    return;
  }
  bcrypt.compare(req.body.password, user.password, async (err, result) => {
    if (err) {
    }
    if (result !== true) {
      res.status(401).json({
        code: 401,
        message: "Email or password is wrong 2",
      });

      return;
    }

    const payload = {
      id: user.id,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    user.token = token;
    await updateUser(user.id, user);
    res.json({
      status: "success",
      code: 200,
      data: {
        token,
      },
    });
  });
});

router.get("/logout", auth, async (req, res, next) => {
  const user = req.user;
  user.token = null;
  await updateUser(req.user.id, user);
  res.status(204).json();
});

router.get("/current", auth, async (req, res, next) => {
  const user = await getUserById(req.user.id);
  res.status(200).json({
    user: user,
  });
});

module.exports = router;
