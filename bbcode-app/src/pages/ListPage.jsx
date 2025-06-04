import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadTemplates } from '../utils/storage'

export default function ListPage() {
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    setTemplates(loadTemplates())
  }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Templates</h2>
        <Link to="/edit" className="btn btn-primary">New Template</Link>
      </div>
      {templates.length === 0 ? (
        <p>No templates yet.</p>
      ) : (
        <ul className="list-group">
          {templates.map(t => (
            <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{t.name}</span>
              <span>
                <Link className="btn btn-sm btn-secondary me-2" to={`/edit/${t.id}`}>Edit</Link>
                <Link className="btn btn-sm btn-success" to={`/preview/${t.id}`}>Preview</Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
