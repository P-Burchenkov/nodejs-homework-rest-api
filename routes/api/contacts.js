const express = require("express");
const router = express.Router();
const { contactCtrl } = require("../../controllers");
const { validateBody, authenticate } = require("../../middlewares");
const { schema } = require("../../models/contact");
const { isValidId } = require("../../middlewares");

router.get("/", authenticate, contactCtrl.getAllContacts);

router.get("/:contactId", authenticate, isValidId, contactCtrl.getContactById);

router.post(
  "/",
  authenticate,
  validateBody(schema.contactAddSchema),
  contactCtrl.addContact
);

router.put(
  "/:contactId",
  authenticate,
  validateBody(schema.contactAddSchema),
  isValidId,
  contactCtrl.updateContact
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  validateBody(schema.changeFavorContactSchema),
  isValidId,
  contactCtrl.updateStatusContact
);

router.delete(
  "/:contactId",
  authenticate,
  isValidId,
  contactCtrl.deleteContact
);

module.exports = router;
