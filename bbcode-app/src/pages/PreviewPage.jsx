import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { loadTemplates } from '../utils/storage'
import parse from 'bbcode-to-html'


export default function PreviewPage() {
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [values, setValues] = useState({})
  const [html, setHtml] = useState('')

  useEffect(() => {
    const t = loadTemplates().find(t => t.id === id)
    if (t) {
      const vars = {}
      t.variables.forEach(v => (vars[v] = ''))
      setValues(vars)
      setTemplate(t)
    }
  }, [id])

  useEffect(() => {
    if (template) {
      let result = template.content
      Object.entries(values).forEach(([k, v]) => {
        const regex = new RegExp(`{{${k}}}`, 'g')
        result = result.replace(regex, v)
      })
      setHtml(parse(result))
    }
  }, [values, template])

  if (!template) return <p>Template not found.</p>

  const updateValue = (name, val) => {
    setValues({ ...values, [name]: val })
  }

  return (
    <div className="row">
      <div className="col-md-4">
        <h3>Variables</h3>
        {template.variables.map(v => (
          <div className="mb-3" key={v}>
            <label className="form-label">{v}</label>
            <input className="form-control" value={values[v] || ''} onChange={e => updateValue(v, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="col-md-8">
        <h3>Preview</h3>
        <div className="p-3 border" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
