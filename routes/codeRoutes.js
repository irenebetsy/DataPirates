const express = require("express");
const router = express.Router();

const {
    getCode,
    getCodeById,
    createCode,
    updateCode,
    deleteCode
} = require("../controllers/codeController");

router.get("/", getCode);
router.get("/:id", getCodeById);
router.post("/", createCode);
router.put("/:id", updateCode);
router.delete("/:id", deleteCode);

module.exports = router;
