import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadTemplates, saveTemplate } from '../utils/storage'
import { v4 as uuidv4 } from 'uuid'

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [variables, setVariables] = useState([])
  const [newVar, setNewVar] = useState('')

  const scanVariables = () => {
    const found = [...content.matchAll(/{{(.*?)}}/g)].map(m => m[1])
    const unique = Array.from(new Set([...variables, ...found]))
    setVariables(unique)
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
    if (trimmed && !variables.includes(trimmed)) {
      setVariables([...variables, trimmed])

      setNewVar('')
    }
  }

  const removeVar = v => setVariables(variables.filter(x => x !== v))

  const handleSubmit = e => {
    e.preventDefault()
    const t = {
      id: editing ? id : uuidv4(),
      name,
      content,
      variables
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
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">BBCode Template</label>
          <textarea className="form-control" rows="6" value={content} onChange={e => setContent(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Variables</label>
          <div className="d-flex mb-2">
            <input className="form-control me-2" value={newVar} onChange={e => setNewVar(e.target.value)} />
            <button type="button" className="btn btn-secondary" onClick={addVariable}>Add</button>
            <button type="button" className="btn btn-outline-secondary ms-2" onClick={scanVariables}>Scan Template</button>
          </div>
          <ul className="list-group">
            {variables.map(v => (
              <li key={v} className="list-group-item d-flex justify-content-between align-items-center">
                {v}
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeVar(v)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </div>
  )
}
