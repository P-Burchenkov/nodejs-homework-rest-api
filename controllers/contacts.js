const { HttpError, ctrlWrapper } = require("../helpers");
const { Contact } = require("../models/contact");

const getAllContacts = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;
  const { _id: owner } = req.user;
  const result = await Contact.find({ owner }, null, { skip, limit });
  res.json(result);
};

const getFavoriteContacts = async (req, res) => {
  const { favorite } = req.query;
  const { _id: owner } = req.user;

  if (!favorite) {
    throw HttpError(400, "Bad request");
  }

  const result = await Contact.find({ owner, favorite });

  res.json(result);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findById(contactId);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const newcontact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newcontact);
};

const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndRemove(contactId);

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updateContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    req.body,
    { new: true }
  );

  if (!updateContact) {
    throw HttpError(404, "Not found");
  }
  res.json(updateContact);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;
  const updateContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    req.body,
    { new: true }
  );

  if (!updateContact) {
    throw HttpError(404, "Not found");
  }
  res.json(updateContact);
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  deleteContact: ctrlWrapper(deleteContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  getFavoriteContacts: ctrlWrapper(getFavoriteContacts),
};
