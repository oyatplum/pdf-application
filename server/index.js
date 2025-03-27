const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

//테스트용 API 엔드포인트
app.get("/api", (req, res) => {
  res.json({ message: "hello" });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
