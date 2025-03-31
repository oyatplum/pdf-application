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
module.exports = splitByArticlePattern;
