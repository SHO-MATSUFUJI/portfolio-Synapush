// 提案フォーム(Excel)から frontmatter 付き記事データを読み取る。
//
// フォームのレイアウト（先頭シート「提案フォーム」、A列=項目名・B列=入力値、
// A4:id A5:title A6:category A7:tags A8:本文）は
// synapush-knowledge-proposal-template.xlsx に準拠。シート名ではなく並び順
// （先頭 = 提案フォーム）で対象シートを判定する。
//
// 入力ヒントは「セルコメント」ではなく「データの入力規則」の入力時メッセージで
// 実装している（テンプレート側の仕様）。旧形式のセルコメントは exceljs の高レベルAPI
// （Workbook#xlsx.load）が関連付け解決で例外を投げるため使えなかったが、入力時メッセージは
// この問題を起こさないため、一時ファイル書き出し＋ストリーミングAPIの回避策は不要になった。
//
// updated（最終更新日）はフォームに項目がない（提出日をそのまま使う想定）ため、
// JST基準の今日の日付を自動で設定する。

import ExcelJS from 'exceljs'

export class ValidationError extends Error {}

const REQUIRED_LABELS = ['id', 'title', 'category', 'tags', '本文']

/**
 * @param {Buffer} buffer アップロードされたExcelファイルの中身
 * @returns {Promise<{ id: string, title: string, category: string, tags: string[], updated: string, body: string }>}
 */
export async function parseExcelToArticle(buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0] // 提案フォームは常に先頭シート
  const values = {}
  worksheet.eachRow((row) => {
    const label = typeof row.values[1] === 'string' ? row.values[1].trim() : undefined
    if (label && REQUIRED_LABELS.includes(label)) {
      values[label] = row.values[2]
    }
  })

  for (const label of REQUIRED_LABELS) {
    if (values[label] === undefined || values[label] === '') {
      throw new ValidationError(`提案フォームの "${label}" が入力されていません`)
    }
  }

  return {
    id: String(values.id).trim(),
    title: String(values.title).trim(),
    category: String(values.category).trim(),
    tags: String(values.tags)
      .split(/[,、]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    updated: todayJst(),
    body: String(values['本文']).trim(),
  }
}

function todayJst() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())
}
