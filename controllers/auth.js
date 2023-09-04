const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const avatarsDir = path.join(__dirname, "..", "public", "avatars");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");

const { User } = require("../models/user");

const { SECRET_KEY, BASE_URL } = process.env;

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationCode = nanoid();

  const verifyEmail = {
    to: email,
    subject: "Verification email",
    html: `<a trget=_blank href=${BASE_URL}/api/users/verify/${verificationCode}>Verify your email</a>`,
  };

  await sendEmail(verifyEmail).catch((err) => {
    throw HttpError(err.status, err.message);
  });

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationCode,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationCode } = req.params;

  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: null,
  });

  res.json({
    message: "Virification is successful",
  });
};

const resendEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "This email is not registered");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verification email",
    html: `<a trget=_blank href=${BASE_URL}/api/users/verify/${user.verificationCode}>Verify your email</a>`,
  };

  await sendEmail(verifyEmail).catch((err) => {
    throw HttpError(err.status, err.message);
  });

  res.json({
    message: "Email sent succeessful",
  });
};

const logIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email is not verified");
  }

  const comparePasswod = await bcrypt.compare(password, user.password);

  if (!comparePasswod) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logOut = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json(null);
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;

  if (
    subscription !== "starter" &&
    subscription !== "pro" &&
    subscription !== "business"
  ) {
    throw HttpError(400, "Bad request");
  }
  const user = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );

  res.json({
    name: user.name,
    email: user.email,
    subscription: user.subscription,
  });
};

const addAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const resultUpload = path.join(avatarsDir, originalname);

  await fs.rename(tempUpload, resultUpload);

  await Jimp.read(resultUpload)
    .then((image) => {
      image.resize(250, 250).write(resultUpload);
    })
    .catch((err) => {
      console.log(err);
    });

  const avatarURL = path.join("public", "avatars", originalname);

  const user = await User.findByIdAndUpdate(_id, { avatarURL }, { new: true });

  res.json({
    avatarURL: user.avatarURL,
  });
};

module.exports = {
  authUser: ctrlWrapper(authUser),
  logIn: ctrlWrapper(logIn),
  logOut: ctrlWrapper(logOut),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  addAvatar: ctrlWrapper(addAvatar),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendEmail: ctrlWrapper(resendEmail),
};
