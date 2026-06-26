import { useEffect } from 'react'

const DEFAULT_TITLE = 'Shahi Scoops — Royal Flavours, Crafted With Love'

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — Shahi Scoops` : DEFAULT_TITLE
    return () => { document.title = prev }
  }, [title])
}
