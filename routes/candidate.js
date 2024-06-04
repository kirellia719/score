const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const router = express.Router();
const { mappingConst } = require("../mapping");
const Candidate = require("../models/Candidate");
const upload = multer();

router.get("/:SBD", async (req, res) => {
  try {
    const { SBD } = req.params;
    const candidate = await Candidate.findOne({ SBD });
    res.json(candidate);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/duplicated", async (req, res) => {
  try {
    const data = await Candidate.aggregate([
      // Group the documents by SBD
      {
        $group: {
          _id: "$SBD",
          candidates: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      // Filter groups with count > 1 (duplicated SBD)
      { $match: { count: { $gt: 1 } } },
      // Unwind the candidates array
      { $unwind: "$candidates" },
      // Project to only keep the candidate objects
      { $replaceRoot: { newRoot: "$candidates" } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.use((req, res, next) => {
  try {
    const { password } = req.body;
    if (password === process.env.PASSWORD) {
      next();
    } else {
      return res.status(403).json("Không có quyền truy cập");
    }
  } catch (error) {
    return res.status(500).json("Lỗi hệ thống");
  }
});
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // Đọc file Excel
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  // In dữ liệu đọc được từ file Excel ra console
  const newData = jsonData.map((c) => {
    const newObject = {};
    for (key in c) {
      newObject[mappingConst[key].title] = c[key];
    }
    return newObject;
  });

  // Lưu vào database
  const response = await Promise.all(newData.map((c) => Candidate.create(c)));

  res.status(201).json(response);
});

module.exports = router;
