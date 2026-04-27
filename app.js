// Start endpoint (local bridge)
const START_URL = '/api/workflow/start'
// Inbox base proxied by Vite: /pia -> YAML base (avoids CORS in dev)
const INBOX_BASE = '/pia'
const el = id=>document.getElementById(id)
const chat = el('chat')
// track seen task ids to avoid rendering duplicates on repeated polling
const seenTaskIds = new Set()
let currentTask = null
const status = el('status')

function setStatus(s){ status.textContent = s }

function appendMsg(text, type='in', meta=''){
  const node = document.createElement('div')
  node.className = 'msg ' + (type==='in' ? 'in' : 'out')
  if(meta) node.innerHTML = `<div class="meta">${meta}</div>${text}`
  else node.textContent = text
  chat.appendChild(node)
  chat.scrollTop = chat.scrollHeight
  return node
}

function safeJSONparse(s){ try{return JSON.parse(s)}catch(e){return null} }

async function executeProcess(){
  const raw = el('processDef').value.trim()
  if(!raw){ alert('Pega un JSON de processDefinition antes de ejecutar'); return }
  const parsed = safeJSONparse(raw)
  if(!parsed){ if(!confirm('El JSON parece inválido. Enviar tal cual?')) return }

  appendMsg('Starting process...', 'out')
  setStatus('starting')

  try{
    // send JSON with explicit Content-Type (proxy avoids CORS preflight in dev)
    const resp = await fetch(START_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: raw })
    if(!resp.ok){ throw new Error(resp.status + ' ' + resp.statusText) }
    const data = await resp.json().catch(()=>null)
    appendMsg('Process started' + (data? ' — ' + JSON.stringify(data):''), 'out')
    setStatus('started')
  }catch(err){
    appendMsg('Error starting process: '+err.message,'out')
    setStatus('error')
  }
}

function extractTasks(data){
  if(!data) return []
  if(Array.isArray(data)) return data
  if(Array.isArray(data.tasks)) return data.tasks
  if(Array.isArray(data.items)) return data.items
  return []
}

function parseIOField(field){
  if(!field) return []
  if(typeof field === 'string'){
    try{ return JSON.parse(field) }catch(e){ return [] }
  }
  return Array.isArray(field) ? field : []
}

async function fetchInbox(){
  setStatus('fetching')
  try{
    const resp = await fetch(INBOX_BASE + '/inbox')
    if(!resp.ok) throw new Error(resp.status + ' '+resp.statusText)
    const data = await resp.json()
    const tasks = extractTasks(data)
    if(tasks.length>0){
      // pick first unseen task only
      const next = tasks.find(t => t && t.id && !seenTaskIds.has(t.id))
      if(next && !currentTask) {
        currentTask = next
        renderInbox([next])
      }
    }
    setStatus('idle')
  }catch(err){
    // on failure, stay silent (do not append empty/error message)
    setStatus('offline')
  }
}

function mockTask(){
  return {
    id: 'mock-1',
    threadId: '0000-0000-mock',
    status: 'PENDING',
    taskName: 'USER-REVIEW',
    prompt: 'Mock: Por favor apruebe o rechace',
    inputs: 'reportDraft',
    interruptId: 'mock-interrupt',
    // example outputs format
    outputs: JSON.stringify([{key:'approved', dataType:'Boolean'}])
  }
}

function parseOutputsField(task){
  // Prefer outputs, fall back to inputs if outputs absent. Both may be stringified.
  const outputs = task.outputs || task.outputsJson
  if(outputs){
    if(typeof outputs === 'string'){ try{ return JSON.parse(outputs) }catch(e){ return [] } }
    return Array.isArray(outputs) ? outputs : []
  }
  // fallback to inputs
  return parseIOField(task.inputs)
}

function parseInputsField(task){
  return parseIOField(task.inputs)
}

function renderInbox(items){
  if(!items || !items.length) { return }
  for(const t of items){
    if(!t || !t.id) continue
    if(seenTaskIds.has(t.id)) continue
    seenTaskIds.add(t.id)
    const container = appendMsg('', 'in', `<strong>${t.taskName || 'task'}</strong> — ${t.threadId || ''}`)
    const body = document.createElement('div')
    body.innerHTML = `<div>${escapeHtml(t.prompt || t.taskName || '')}</div>`
    container.appendChild(body)

    const outputs = parseOutputsField(t)
    const actions = document.createElement('div')
    actions.className = 'task-actions'

    // if outputs contain booleans, render accept/reject
    const booleanOutputs = outputs.filter(o => (o.dataType||'').toLowerCase().includes('boolean'))
    if(booleanOutputs.length){
      const widget = document.createElement('div')
      widget.className = 'widget-boolean'
      const accept = document.createElement('button')
      accept.className = 'pill'
      accept.textContent = 'Aceptar'
      accept.onclick = ()=>sendTaskResponse(t, booleanOutputs[0].key, true)
      const reject = document.createElement('button')
      reject.className = 'pill'
      reject.textContent = 'Rechazar'
      reject.onclick = ()=>sendTaskResponse(t, booleanOutputs[0].key, false)
      widget.appendChild(accept); widget.appendChild(reject)
      actions.appendChild(widget)
    }

    // if any string outputs or inputs, show simple input box
    const textOutputs = outputs.filter(o => !(o.dataType||'').toLowerCase().includes('boolean'))
    if(textOutputs.length){
      const w = document.createElement('div')
      w.className = 'widget-text'
      const input = document.createElement('input')
      input.type = 'text'
      input.className = 'short'
      input.placeholder = textOutputs[0].key || 'respuesta'
      const send = document.createElement('button')
      send.className = 'pill'
      send.textContent = 'Enviar'
      send.onclick = ()=>sendTaskResponse(t, textOutputs[0].key, input.value)
      w.appendChild(input); w.appendChild(send)
      actions.appendChild(w)
    }

    // if no outputs recognized, add a generic acknowledge
    if(outputs.length===0){
      const ack = document.createElement('button')
      ack.className = 'pill'
      ack.textContent = 'Mark Done'
      ack.onclick = ()=>sendTaskResponse(t, null, {ack:true})
      actions.appendChild(ack)
    }

    container.appendChild(actions)
  }
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]) }

async function sendTaskResponse(task, outputKey, value){
  appendMsg(`Responding to ${task.taskName || task.id}...`,'out')
  setStatus('posting')

  const thread = task.threadId || task.thread || task.id
  // build values using outputs (prefer the provided outputKey)
  const outputs = parseOutputsField(task)
  const nameKey = outputKey ? outputKey : (outputs && outputs.length && (outputs[0].key || outputs[0].name))
  const valObj = (nameKey && value !== undefined) ? { name: nameKey, value } : null
  // send values as an array of objects and processDefinition as parsed JSON (object)
  // send values as array of objects and processDefinition as parsed object
  const putInboxRequest = {
    id: task.id,
    interruptId: task.interruptId || task.interrupt || null,
    nodeKey: task.nodeKey || task.nodekey || task.node || null,
    values: valObj ? [valObj] : [],
    processDefinition: (()=>{ try{ return JSON.parse(el('processDef').value || '{}') }catch(e){ return {} } })()
  }
  const payload = {
    PutInboxRequest: putInboxRequest,
    threadId: thread
  }
  try{
    const url = `${INBOX_BASE}/${encodeURIComponent(thread)}/inbox`
    // send JSON with Content-Type
    const resp = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(!resp.ok) throw new Error(resp.status+' '+resp.statusText)
    const data = await resp.json().catch(()=>null)
    appendMsg('Response sent' + (data? (' — '+JSON.stringify(data)) : ''),'out')
    setStatus('idle')
      // mark seen and clear currentTask then request next
      seenTaskIds.add(task.id)
      currentTask = null
      fetchInbox()
  }catch(err){
    appendMsg('Error sending response: '+err.message,'out')
    setStatus('error')
  }
}

// UI wiring
el('executeBtn').addEventListener('click', executeProcess)
el('fetchInboxBtn').addEventListener('click', fetchInbox)

// Auto-poll
let pollTimer = null
function startPoll(){ if(pollTimer) return; pollTimer = setInterval(()=>fetchInbox(), 4000) }
function stopPoll(){ if(!pollTimer) return; clearInterval(pollTimer); pollTimer=null }
el('autoPoll').addEventListener('change', (e)=> e.target.checked ? startPoll() : stopPoll())

// start immediately
if(el('autoPoll').checked) startPoll()
