const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfjsLib = require("pdfjs-dist");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
function splitRightBlocks(texts) {
  const mergedTexts = [];
  for (let i = 0; i < texts.length; i++) {
    const cur = texts[i];
    const next = texts[i + 1];

    const isNumberOnly = /^\d+$/.test(cur.text.trim());
    const isUnitLike =
      next && /^(회|명|건|일|개|차|이상|이내)/.test(next.text.trim());

    if (isNumberOnly && isUnitLike) {
      mergedTexts.push({
        text: cur.text + next.text,
        x: cur.x,
        y: cur.y,
        page: cur.page,
      });
      i++;
    } else {
      mergedTexts.push(cur);
    }
  }

  const sorted = [...mergedTexts].sort((a, b) => a.page - b.page || b.y - a.y);

  const blocks = [];
  let current = [];
  let mode = null;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const text = item.text.trim();

    const isArticleStart = /^제\d+조(\(|의)/.test(text);
    const isMainNumber = /^[\u2460-\u2473]/.test(text);

    if (isArticleStart) {
      if (current.length > 0) blocks.push(current);
      current = [item];
      mode = "article";
      continue;
    }

    if (isMainNumber && mode !== "article") {
      const temp = [...current];

      current = [item, ...temp];

      mode = "numbered";

      let j = i + 1;
      while (
        j < sorted.length &&
        sorted[j].page === item.page &&
        !/^[\u2460-\u2473]/.test(sorted[j].text.trim()) &&
        !/^제\d+조(\(|의)/.test(sorted[j].text.trim())
      ) {
        current.push(sorted[j]);
        j++;
      }

      i = j - 1;
      blocks.push(current);
      current = [];
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
      const isNewMainNumber = /^[\u2460-\u2473]/.test(text);
      const isNewArticle = /^제\d+조(\(|의)/.test(text);

      if (isNewMainNumber || isNewArticle) {
        blocks.push(current);
        current = [item];
        mode = isNewArticle ? "article" : "numbered";
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
    const text = group
      .map((g) => g.text.trim())
      .join(" ")
      .replace(/(\d)\s+(회|일|건|명|개|차|이상|이내)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim();

    return { text, page, top, bottom };
  });
}

function mergeAfterNumberWithPrevious(blocks) {
  const merged = [];
  for (let i = 0; i < blocks.length; i++) {
    const current = blocks[i];
    const prev = merged[merged.length - 1];

    const startsWithSubNumber = /^\d+\./.test(current.text.trim());
    const prevStartsWithNumber = /^[\u2460-\u2473]/.test(prev?.text?.trim());

    if (startsWithSubNumber && prevStartsWithNumber) {
      prev.text += " " + current.text;
      prev.top = Math.max(prev.top, current.top);
      prev.bottom = Math.min(prev.bottom, current.bottom);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function mergeSubItemsToMainNumber(blocks) {
  const merged = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const isMainNumber = /^[\u2460-\u2473]/.test(block.text.trim());

    if (isMainNumber) {
      let combinedText = block.text;
      let j = i + 1;

      while (j < blocks.length) {
        const nextText = blocks[j].text.trim();

        const isNextMainStart = /^(제\d+조|\d+항|\d+\)|^[\u2460-\u2473])/.test(
          nextText
        );
        if (isNextMainStart) break;

        const isStandaloneNumber = /^\d+$/.test(nextText);
        if (isStandaloneNumber && j + 1 < blocks.length) {
          const nextNext = blocks[j + 1].text.trim();
          if (/^(회|이상|받은|경우)/.test(nextNext)) {
            combinedText += " " + blocks[j].text + " " + blocks[j + 1].text;
            j += 2;
            continue;
          }
        }

        combinedText += " " + blocks[j].text;
        j++;
      }

      merged.push({
        ...block,
        text: combinedText.replace(/\s+/g, " ").trim(),
      });

      i = j;
    } else {
      merged.push(block);
      i++;
    }
  }

  return merged;
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

const PORT = 8080;
app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
