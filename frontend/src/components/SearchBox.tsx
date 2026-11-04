import { useEffect, useRef, useState } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

/**
 * 検索欄。
 *
 * 入力欄には、URLの値ではなく自分用の入力値（draft）を表示する。
 * URLの更新はルーターが後回しにするため、URLの値を表示すると、その一瞬だけ古い値に戻り、
 * 日本語入力（IME）の変換が崩れるため。
 *
 * また、変換中はURLに保存せず、確定してから保存する（未確定の文字で絞り込まないため）。
 */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)
  const composingRef = useRef(false)
  // 自分がURLに保存した最後の値（URLが外から変わったのかを見分けるため）
  const lastSentRef = useRef(value)

  // URLが外から変わったとき（ヘッダーのリンクなど）だけ、入力欄を合わせる
  useEffect(() => {
    if (value === lastSentRef.current) return
    lastSentRef.current = value
    setDraft(value)
  }, [value])

  function send(newValue: string) {
    lastSentRef.current = newValue
    onChange(newValue)
  }

  function handleChange(newValue: string) {
    setDraft(newValue)
    if (!composingRef.current) send(newValue)
  }

  function handleCompositionEnd(newValue: string) {
    composingRef.current = false
    setDraft(newValue)
    send(newValue)
  }

  return (
    <input
      type="search"
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onCompositionStart={() => {
        composingRef.current = true
      }}
      onCompositionEnd={(e) => handleCompositionEnd(e.currentTarget.value)}
      placeholder="タイトル・タグ・本文で検索"
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    />
  )
}
