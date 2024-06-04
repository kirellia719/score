const express = require("express");

const router = express.Router();
const candidateRouter = require("./candidate");

router.use("/candidates", candidateRouter);

module.exports = router;
