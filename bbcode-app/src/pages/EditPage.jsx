import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { loadTemplates, saveTemplate } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'multiline', label: 'Multi-line Text' },
  { value: 'bulleted-list', label: 'Bulleted List' },
  { value: 'numbered-list', label: 'Numbered List' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'link', label: 'Hyperlink' },
  { value: 'image', label: 'Image URL' },
]

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [variables, setVariables] = useState([])
  const [newVar, setNewVar] = useState('')
  const [newType, setNewType] = useState('text')

  const scanVariables = () => {
    const found = [...content.matchAll(/{{(.*?)}}/g)].map(m => m[1])
    const names = variables.map(v => v.name)
    const updated = [...variables]
    found.forEach(f => {
      if (!names.includes(f)) {
        updated.push({ name: f, type: 'text' })
      }
    })
    setVariables(updated)
  }

  useEffect(() => {
    if (editing) {
      const t = loadTemplates().find(t => t.id === id)
      if (t) {
        setName(t.name)
        setContent(t.content)
        setVariables(t.variables)
      }
    }
  }, [editing, id])

  const addVariable = () => {
    const trimmed = newVar.trim()
    if (trimmed && !variables.some(v => v.name === trimmed)) {
      setVariables([...variables, { name: trimmed, type: newType }])
      setNewVar('')
    }
  }

  const removeVar = name => setVariables(variables.filter(v => v.name !== name))

  const updateVarType = (name, type) => {
    setVariables(
      variables.map(v => (v.name === name ? { ...v, type } : v))
    )
  }

  const handleSubmit = e => {
    e.preventDefault()
    const t = {
      id: editing ? id : uuidv4(),
      name,
      content,
      variables,
    }
    saveTemplate(t)
    navigate('/')
  }

  return (
    <div>
      <h2>{editing ? 'Edit Template' : 'New Template'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">BBCode Template</label>
          <textarea
            className="form-control"
            rows="6"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
          <div className="form-text">
            Use <code>{'{{variable}}'}</code> placeholders for values you want to
            edit later.
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Variables</label>
          <div className="form-text mb-2">
            Add names manually or press <strong>Scan Template</strong> to detect
            all <code>{'{{...}}'}</code> tokens in the text area above.
          </div>
          <div className="d-flex mb-2">
            <input
              className="form-control me-2"
              value={newVar}
              onChange={e => setNewVar(e.target.value)}
              placeholder="Variable name"
            />
            <select
              className="form-select me-2"
              style={{ maxWidth: '160px' }}
              value={newType}
              onChange={e => setNewType(e.target.value)}
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary" onClick={addVariable}>
              Add
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={scanVariables}
            >
              Scan Template
            </button>
          </div>
          <ul className="list-group">
            {variables.map(v => (
              <li key={v.name} className="list-group-item">
                <div className="d-flex align-items-center">
                  <span className="me-3">{v.name}</span>
                  <select
                    className="form-select me-3"
                    style={{ maxWidth: '160px' }}
                    value={v.type}
                    onChange={e => updateVarType(v.name, e.target.value)}
                  >
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger ms-auto"
                    onClick={() => removeVar(v.name)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
        {editing && (
          <Link
            to={`/preview/${id}`}
            className="btn btn-outline-secondary ms-2"
          >
            Preview
          </Link>
        )}
      </form>
    </div>
  )
}
