const express = require("express");

const authController = require("./../controllers/authController");
const authMiddleware = require("./../../middlewares/authMiddleware");

const router = new express.Router();

router
  .route("/login")
  .post(authMiddleware.validateSigninInput, authController.signin);
router
  .route("/signup")
  .post(authMiddleware.validateSignupInput, authController.signup);
router
  .route("/forget-password")
  .post(
    authMiddleware.validateForgetPasswordInput,
    authController.forgetPassword
  );
router
  .route("/reset-password/:resetToken")
  .patch(
    authMiddleware.validateResetPasswordInput,
    authController.resetPassword
  );

module.exports = router;
