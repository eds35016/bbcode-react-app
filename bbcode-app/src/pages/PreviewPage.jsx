import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadTemplate, shareTemplate } from '../utils/api'
import parse from 'bbcode-to-html'

export default function PreviewPage() {
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [values, setValues] = useState({})
  const [html, setHtml] = useState('')
  const [activeVar, setActiveVar] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const [shareLink, setShareLink] = useState('')

  const formatValue = (val, type) => {
    if (!val) return ''
    switch (type) {
      case 'multiline':
        return val
      case 'bulleted-list': {
        const items = val.split(/\r?\n/).filter(Boolean)
        return `[list]\n${items.map(i => `[*]${i}`).join('\n')}\n[/list]`
      }
      case 'numbered-list': {
        const items = val.split(/\r?\n/).filter(Boolean)
        return `[list=1]\n${items.map(i => `[*]${i}`).join('\n')}\n[/list]`
      }
      case 'date':
      case 'time':
      case 'datetime':
        return val
      case 'link':
        return `[url]${val}[/url]`
      case 'image':
        return `[img=${val}]`
      default:
        return val
    }
  }

  useEffect(() => {
    loadTemplate(id).then(t => {
      const vars = {}
      t.variables.forEach(v => {
        vars[v.name] = ''
      })
      setValues(vars)
      setTemplate(t)
    })
  }, [id])

  useEffect(() => {
    if (template) {
      let result = template.content
      Object.keys(values).forEach(k => {
        const token = `__VAR_${k}__`
        const regex = new RegExp(`{{${k}}}`, 'g')
        result = result.replace(regex, token)
      })
      let output = parse(result)
        .replace(/(?:\r\n|\r|\n)/g, '<br/>')
      Object.entries(values).forEach(([k, v]) => {
        const token = `__VAR_${k}__`
        const type = template.variables.find(x => x.name === k)?.type || 'text'
        const bb = formatValue(v, type)
        let htmlSeg = bb ? parse(bb) : ''
        htmlSeg = htmlSeg
          .replace(/<\/br>/g, '<br/>')
          .replace(/(?:\r\n|\r|\n)/g, '<br/>')
        const span = `<span data-var="${k}" class="${activeVar === k ? 'highlight' : ''}">${htmlSeg}</span>`
        output = output.replaceAll(token, span)
      })
      setHtml(output)
    }
  }, [values, template, activeVar])

  if (!template) return <p>Template not found.</p>

  const updateValue = (name, val) => {
    setValues({ ...values, [name]: val })
  }

  const buildBBCode = () => {
    if (!template) return ''
    let result = template.content
    Object.entries(values).forEach(([k, v]) => {
      const type = template.variables.find(x => x.name === k)?.type || 'text'
      const bb = formatValue(v, type)
      const regex = new RegExp(`{{${k}}}`, 'g')
      result = result.replace(regex, bb)
    })
    return result
  }

  const copyBBCode = async () => {
    const text = buildBBCode()
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 1500)
    } catch {
      setCopyMsg('Failed to copy')
    }
  }

  const createShare = async () => {
    const res = await shareTemplate(id)
    const url = `${window.location.origin}/share/${res.shareId}`
    await navigator.clipboard.writeText(url)
    setShareLink(url)
  }

  return (
    <div className="row">
      <div className="col-md-4">
        <h3>Variables</h3>
        {template.variables.map(v => (
          <div className="mb-3" key={v.name}>
            <label className="form-label">{v.name}</label>
            {(() => {
              const commonProps = {
                className: 'form-control',
                value: values[v.name] || '',
                onFocus: () => setActiveVar(v.name),
                onBlur: () => setActiveVar(''),
                onChange: e => updateValue(v.name, e.target.value),
              }
              switch (v.type) {
                case 'multiline':
                case 'bulleted-list':
                case 'numbered-list':
                  return <textarea rows="3" {...commonProps} />
                case 'date':
                  return <input type="date" {...commonProps} />
                case 'time':
                  return <input type="time" {...commonProps} />
                case 'datetime':
                  return <input type="datetime-local" {...commonProps} />
                case 'link':
                case 'image':
                  return <input type="url" {...commonProps} />
                default:
                  return <input type="text" {...commonProps} />
              }
            })()}
          </div>
        ))}
      </div>
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mb-0">Preview</h3>
          <div>
            <Link to={`/edit/${id}`} className="btn btn-outline-secondary me-2">
              Edit Template
            </Link>
            <button type="button" className="btn btn-secondary me-2" onClick={copyBBCode}>
              Copy BBCode
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={createShare}>
              Share
            </button>
          </div>
        </div>
        {copyMsg && <div className="text-success mb-2">{copyMsg}</div>}
        {shareLink && (
          <div className="text-success mb-2">Share link copied! {shareLink}</div>
        )}
        <div className="p-3 border" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
