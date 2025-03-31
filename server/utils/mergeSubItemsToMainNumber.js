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
module.exports = mergeSubItemsToMainNumber;
