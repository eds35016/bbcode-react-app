import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { loadSharedTemplate } from '../utils/api'
import parse from 'bbcode-to-html'

export default function SharedPreviewPage() {
  const { shareId } = useParams()
  const [template, setTemplate] = useState(null)
  const [html, setHtml] = useState('')

  useEffect(() => {
    loadSharedTemplate(shareId).then(t => {
      setTemplate(t)
      setHtml(parse(t.content))
    })
  }, [shareId])

  if (!template) return <p>Loading...</p>

  return (
    <div>
      <h2>{template.name}</h2>
      <div className="p-3 border" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
