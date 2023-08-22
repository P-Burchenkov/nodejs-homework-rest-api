const express = require("express");

const router = express.Router();

const { schemas } = require("../../models/user");

const { validateBody, authenticate } = require("../../middlewares");

const { authCntrl } = require("../../controllers");

router.post(
  "/register",
  validateBody(schemas.registerSchema),
  authCntrl.authUser
);

router.post("/login", validateBody(schemas.loginSchema), authCntrl.logIn);

router.post("/logout", authenticate, authCntrl.logOut);

router.get("/current", authenticate, authCntrl.getCurrent);

router.patch("/", authenticate, authCntrl.updateSubscription);

module.exports = router;
