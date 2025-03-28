const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfjsLib = require("pdfjs-dist");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

function splitRightBlocks(texts) {
  const sorted = [...texts].sort((a, b) => a.page - b.page || b.y - a.y);
  const blocks = [];
  let current = [];
  let mode = null;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const text = item.text;
    const isArticleStart = /^제\d+조(\(|의)/.test(text);
    const isNumbered = /^[\u2460-\u2473]|^\d+\./.test(text);
    const isSubNumber = /^\d+\./.test(text);

    if (isArticleStart) {
      if (current.length > 0) blocks.push(current);
      current = [item];
      mode = "article";
      continue;
    }

    if (isNumbered && mode !== "article") {
      if (current.length > 0) blocks.push(current);
      current = [item];
      mode = "numbered";
      continue;
    }

    if (mode === "article") {
      current.push(item);
      if (/\.|\(현행과 같음\)/.test(text)) {
        blocks.push(current);
        current = [];
        mode = null;
      }
      continue;
    }

    if (mode === "numbered") {
      if (isArticleStart) {
        blocks.push(current);
        current = [item];
        mode = "article";
      } else if (/^[\u2460-\u2473]/.test(text)) {
        blocks.push(current);
        current = [item];
      } else {
        current.push(item);
      }
      continue;
    }

    current.push(item);
  }

  if (current.length > 0) blocks.push(current);

  return blocks.map((group) => {
    const page = group[0].page;
    const top = Math.max(...group.map((g) => g.y));
    const bottom = Math.min(...group.map((g) => g.y));
    return {
      text: group
        .map((g) => g.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
      page,
      top,
      bottom,
    };
  });
}

function matchBlocks(leftBlocks, rightBlocks) {
  const used = new Set();
  return leftBlocks.map((left) => {
    const { top, bottom, page } = left;
    let bestMatch = null;
    let bestScore = Infinity;

    for (let i = 0; i < rightBlocks.length; i++) {
      const right = rightBlocks[i];
      if (used.has(i) || right.page !== page) continue;
      const centerDist = Math.abs(right.top - top);
      if (centerDist < bestScore) {
        bestScore = centerDist;
        bestMatch = { index: i, block: right };
      }
    }

    if (bestMatch) {
      used.add(bestMatch.index);
      return { left: left.text, right: bestMatch.block.text };
    } else {
      return { left: left.text, right: "" };
    }
  });
}

function splitByArticlePattern(text) {
  const blocks = [];
  const sentences = text.split(/(?<=\.)|(?<=\))/);
  let current = "";
  let insideArticle = false;

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;

    if (/^제\d+조/.test(sentence)) {
      if (current) blocks.push(current.trim());
      current = sentence;
      insideArticle = true;
    } else if (insideArticle) {
      current += " " + sentence;
      if (/다\.$/.test(sentence) || /\(생 략\)/.test(sentence)) {
        blocks.push(current.trim());
        current = "";
        insideArticle = false;
      }
    } else {
      blocks.push(sentence);
    }
  }
  if (current) blocks.push(current.trim());
  return blocks;
}

app.post("/api/parse-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const loadingTask = pdfjsLib.getDocument({ data: fileBuffer });
    const pdf = await loadingTask.promise;

    let parsingStarted = false;
    const leftTexts = [],
      rightTexts = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      for (const item of content.items) {
        const text = item.str.trim();
        const x = item.transform[4];
        const y = item.transform[5];

        if (!parsingStarted && text.includes("신·구조문대비표")) {
          parsingStarted = true;
          continue;
        }
        if (!parsingStarted || !text || /^-?\s*\d+\s*-?$/.test(text)) continue;

        const entry = { text, x, y, page: pageNum };
        (x < 300 ? leftTexts : rightTexts).push(entry);
      }
    }

    const fullLeftText = leftTexts
      .map((t) => t.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const blocks = [];
    let restText = fullLeftText;
    if (restText.includes("현 행")) {
      blocks.push("현 행");
      restText = restText.split("현 행")[1].trim();
    }
    const rawParts = restText.split(/<\s*신\s*설\s*>/);
    for (let i = 0; i < rawParts.length; i++) {
      const part = rawParts[i].trim();
      if (part) blocks.push(...splitByArticlePattern(part));
      if (i !== rawParts.length - 1) blocks.push("<신 설>");
    }

    const blocksWithY = [];
    let remainingLeft = [...leftTexts];
    for (const block of blocks) {
      const words = block.split(/\s+/);
      let startObj = null,
        endObj = null;
      for (let i = 0; i < remainingLeft.length; i++) {
        const t = remainingLeft[i];
        if (
          !startObj &&
          words.some((w) => w.includes(t.text) || t.text.includes(w))
        ) {
          startObj = t;
        }
        if (block.endsWith(t.text)) {
          endObj = t;
          remainingLeft = remainingLeft.slice(i + 1);
          break;
        }
      }
      if (startObj && endObj) {
        const top = Math.max(startObj.y, endObj.y);
        const bottom = Math.min(startObj.y, endObj.y);
        blocksWithY.push({ text: block, top, bottom, page: startObj.page });
      } else {
        blocksWithY.push({ text: block, top: -1, bottom: -9999, page: -1 });
      }
    }

    const rightBlockObjects = splitRightBlocks(rightTexts);
    const matchedBlocks = matchBlocks(blocksWithY, rightBlockObjects);

    res.json(matchedBlocks);
  } catch (err) {
    console.error("PDF 파싱 실패:", err);
    res.status(500).json({ error: "PDF 파싱 중 오류 발생" });
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
