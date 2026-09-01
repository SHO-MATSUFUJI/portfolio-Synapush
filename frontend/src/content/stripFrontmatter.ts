// メタデータはmanifest.jsonに載っているため、本文表示ではfrontmatter部分（---で囲まれたYAML）を取り除くだけでよい
export function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  return match ? raw.slice(match[0].length) : raw
}
