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
module.exports = splitRightBlocks;
