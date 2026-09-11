// frontmatter付きの index.md 本文を組み立てる。docs/frontmatter-spec.md の5項目仕様に準拠。
// 本文（body）は提案フォーム側で自由記述（見出しは著者が「## 」で自分で付ける）のため、
// ここでは節立てをせずそのまま差し込む。

/**
 * @param {{ id: string, title: string, category: string, tags: string[], updated: string, body: string }} article
 * @returns {string}
 */
export function buildMarkdown(article) {
  const tagsLine = `[${article.tags.join(', ')}]`

  return `---
id: ${article.id}
title: ${article.title}
category: ${article.category}
tags: ${tagsLine}
updated: ${article.updated}
---

${article.body}
`
}
