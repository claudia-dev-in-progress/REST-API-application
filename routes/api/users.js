const express = require("express");
const { userSchema } = require("./../../validators/users");
const {
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
} = require("./../../models/users/users");

const { auth } = require("./../../midlewares/auth_midleware");

var gravatar = require("gravatar");
const sha256 = require("js-sha256");
const { upload } = require("./../../config/image_upload_config");

const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Jimp = require("jimp");

require("dotenv").config();
const apiBaseUrl = process.env.API_BASE_URL;

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
      const avatarURL = gravatar.url(
        sha256(req.body.email),
        {
          s: 300,
        },
        true
      );
      const user = await addUser({
        email: req.body.email,
        password: hash,
        avatarURL: avatarURL,
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

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const tempPath = path.join(process.cwd(), "tmp");
    const avatarName = `${req.user._id}-${uuidv4()}`;
    const avatarPath = path.join(process.cwd(), "public/avatars", avatarName);

    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    await Jimp.read(req.file.path)
      .then((image) => {
        return image.resize(250, 250).writeAsync(tempPath + "/" + avatarName);
      })
      .then(() => {
        fs.renameSync(tempPath + "/" + avatarName, avatarPath);
        fs.unlinkSync(req.file.path);
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    req.user.avatarURL = apiBaseUrl + "/avatars/" + avatarName;
    await updateUser(req.user._id, req.user);

    res.status(200).json({ avatarURL: req.user.avatarURL });
  }
);

module.exports = router;
