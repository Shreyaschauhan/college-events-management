const express = require("express");
const router = express.Router();

const { register, login, verifyJwtToken } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/verify-token", verifyJwtToken);


module.exports = router;
