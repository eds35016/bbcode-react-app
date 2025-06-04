const KEY = 'bbcode-templates'

export function loadTemplates() {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveTemplate(template) {
  const templates = loadTemplates()
  const idx = templates.findIndex(t => t.id === template.id)
  if (idx >= 0) {
    templates[idx] = template
  } else {
    templates.push(template)
  }
  localStorage.setItem(KEY, JSON.stringify(templates))
}
