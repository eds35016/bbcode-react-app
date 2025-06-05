import express from 'express'
import cors from 'cors'
import { promises as fs } from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const SECRET = process.env.JWT_SECRET || 'change_this_secret'
const USERS_FILE = new URL('./data/users.json', import.meta.url).pathname
const TEMPLATES_FILE = new URL('./data/templates.json', import.meta.url).pathname

async function readJson(path, def) {
  try {
    const data = await fs.readFile(path, 'utf8')
    return JSON.parse(data)
  } catch {
    return def
  }
}

async function writeJson(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2))
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' })
}

async function loadUsers() {
  return readJson(USERS_FILE, [])
}

async function saveUsers(users) {
  await writeJson(USERS_FILE, users)
}

async function loadTemplates() {
  return readJson(TEMPLATES_FILE, [])
}

async function saveTemplates(tpls) {
  await writeJson(TEMPLATES_FILE, tpls)
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Missing token' })
  const [, token] = header.split(' ')
  try {
    const payload = jwt.verify(token, SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' })
  const users = await loadUsers()
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' })
  }
  const id = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)
  const user = { id, username, passwordHash }
  users.push(user)
  await saveUsers(users)
  const token = generateToken(user)
  res.json({ token })
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' })
  const users = await loadUsers()
  const user = users.find(u => u.username === username)
  if (!user) return res.status(400).json({ error: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' })
  const token = generateToken(user)
  res.json({ token })
})

// Templates routes
app.get('/api/templates', authMiddleware, async (req, res) => {
  const templates = await loadTemplates()
  const userTemplates = templates.filter(t => t.userId === req.user.id)
  res.json(userTemplates)
})

app.post('/api/templates', authMiddleware, async (req, res) => {
  const { name, content, variables } = req.body
  if (!name || !content) return res.status(400).json({ error: 'Missing fields' })
  const templates = await loadTemplates()
  const id = uuidv4()
  const template = { id, userId: req.user.id, name, content, variables: variables || [], shareId: null }
  templates.push(template)
  await saveTemplates(templates)
  res.json(template)
})

app.get('/api/templates/:id', authMiddleware, async (req, res) => {
  const templates = await loadTemplates()
  const template = templates.find(t => t.id === req.params.id && t.userId === req.user.id)
  if (!template) return res.status(404).json({ error: 'Not found' })
  res.json(template)
})

app.put('/api/templates/:id', authMiddleware, async (req, res) => {
  const { name, content, variables } = req.body
  const templates = await loadTemplates()
  const idx = templates.findIndex(t => t.id === req.params.id && t.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  templates[idx] = { ...templates[idx], name, content, variables }
  await saveTemplates(templates)
  res.json(templates[idx])
})

app.post('/api/templates/:id/share', authMiddleware, async (req, res) => {
  const templates = await loadTemplates()
  const idx = templates.findIndex(t => t.id === req.params.id && t.userId === req.user.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const shareId = uuidv4()
  templates[idx].shareId = shareId
  await saveTemplates(templates)
  res.json({ shareId })
})

app.get('/api/share/:shareId', async (req, res) => {
  const templates = await loadTemplates()
  const template = templates.find(t => t.shareId === req.params.shareId)
  if (!template) return res.status(404).json({ error: 'Not found' })
  res.json({ name: template.name, content: template.content, variables: template.variables })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
