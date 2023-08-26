const multer = require("multer");
const path = require("path");

const upLoadDir = path.join(__dirname, "..", "temp");

const storage = multer.diskStorage({
  destination: upLoadDir,
});

const upload = multer({
  storage,
});

module.exports = upload;
