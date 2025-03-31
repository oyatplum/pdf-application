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
module.exports = mergeAfterNumberWithPrevious;
