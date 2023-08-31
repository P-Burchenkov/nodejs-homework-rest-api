const { Schema, model } = require("mongoose");

const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const emailRejex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      require: true,
      match: emailRejex,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      require: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      require: true,
    },
    verify: {
      type: Boolean,
      default: false,
      require: true,
    },
    verificationCode: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const User = model("user", userSchema);

const registerSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().trim().required().pattern(emailRejex),
  password: Joi.string().trim().required().min(6),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().required().pattern(emailRejex),
  password: Joi.string().trim().required().min(6),
});

const verificationSchema = Joi.object({
  email: Joi.string().trim().required().pattern(emailRejex),
});

userSchema.post("save", handleMongooseError);

const schemas = { registerSchema, loginSchema, verificationSchema };

module.exports = {
  schemas,
  User,
};
