const { Schema, model } = require("mongoose");

const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model("contact", contactSchema);

const contactAddSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().required().trim(),
  phone: Joi.string().required().trim(),
  favorite: Joi.bool(),
});

const changeFavorContactSchema = Joi.object({
  favorite: Joi.bool().required(),
});

contactSchema.post("save", handleMongooseError);

const schema = { contactAddSchema, changeFavorContactSchema };

module.exports = { schema, Contact };
