const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const router = require("./routes");
const { default: mongoose } = require("mongoose");

const app = express();
dotenv.config();

// middleware
app.use(express.json());
app.use(morgan("common"));
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Router
app.use("/", router);

// Launch

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    const PORT = process.env.PORT || 8800;
    app.listen(PORT, () => {
      console.log(`Running: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
