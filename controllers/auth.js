const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const { HttpError, ctrlWrapper } = require("../helpers");

const { User } = require("../models/user");

const { SECRET_KEY } = process.env;

const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashedPassword });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const logIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
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

  // if (
  //   subscription !== "starter" &&
  //   subscription !== "pro" &&
  //   subscription !== "business"
  // ) {
  //   throw HttpError(400, "Bad request");
  // }
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

module.exports = {
  authUser: ctrlWrapper(authUser),
  logIn: ctrlWrapper(logIn),
  logOut: ctrlWrapper(logOut),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
};
