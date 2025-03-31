const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfjsLib = require("pdfjs-dist");

const upload = multer({ storage: multer.memoryStorage() });

const {
  splitRightBlocks,
  mergeAfterNumberWithPrevious,
  mergeSubItemsToMainNumber,
  matchBlocks,
  splitByArticlePattern,
} = require("../utils");

router.post("/parse-pdf", upload.single("pdf"), async (req, res) => {
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
        if (!parsingStarted || !text) continue;

        const isLeft = x < 300;
        const isPageNumber = /^-?\s*\d+\s*-?$/.test(text);
        const isLikelyPageNumberRight =
          /^\d+$/.test(text) && x > 200 && x < 400 && y < 100;

        if (isLeft && isPageNumber) continue;
        if (!isLeft && isLikelyPageNumberRight) continue;

        const entry = { text, x, y, page: pageNum };
        (isLeft ? leftTexts : rightTexts).push(entry);
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
    const withMergedSubs = mergeSubItemsToMainNumber(rightBlockObjects);
    const fullyMerged = mergeAfterNumberWithPrevious(withMergedSubs);
    const matchedBlocks = matchBlocks(blocksWithY, fullyMerged);

    res.json(matchedBlocks);
  } catch (err) {
    console.error("PDF 파싱 실패:", err);
    res.status(500).json({ error: "PDF 파싱 중 오류 발생" });
  }
});
module.exports = router;
