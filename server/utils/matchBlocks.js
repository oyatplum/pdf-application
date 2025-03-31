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
module.exports = matchBlocks;
