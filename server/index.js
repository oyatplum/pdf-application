const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const parsePdfRoute = require("./routes/parsePdf");

app.use("/api", parsePdfRoute);

const PORT = 8080;
app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
