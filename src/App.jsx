import React, { useEffect, useRef, useState } from 'react'

// Start endpoint (local bridge)
const START_URL = '/api/workflow/start'
// Inbox base proxied by Vite: /pia -> YAML base (avoids CORS in dev)
const INBOX_BASE = '/pia'

function useAutoScroll(dep){
  const ref = useRef()
  useEffect(()=>{ if(ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [dep])
  return ref
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]) }

export default function App(){
  const [processDef, setProcessDef] = useState('')
  const processDefRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [autoPoll, setAutoPoll] = useState(true)
  const containerRef = useAutoScroll(messages)
  const seenRef = useRef(new Set())
  const [currentTask, setCurrentTask] = useState(null)
  const currentTaskRef = useRef(null)
  const [responseText, setResponseText] = useState('')

  function push(msg){ setMessages(m=>[...m,{id:Date.now()+Math.random(),...msg}]) }

  function cleanJson(str){
    return str
      .replace(/\u00A0/g, ' ')
      .replace(/^\uFEFF/, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
  }

  async function executeProcess(){
    if(!processDef.trim()){ alert('Pega el JSON del processDefinition'); return }
    setStatus('starting'); push({type:'out', text:'Starting process...'})
    try{
      const resp = await fetch(START_URL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: cleanJson(processDef) })
      if(!resp.ok) throw new Error(resp.status+' '+resp.statusText)
      const data = await resp.json().catch(()=>null)
      push({type:'out', text:'Process started' + (data? (' — '+JSON.stringify(data)) : '')})
      setStatus('started')
    }catch(e){ push({type:'out', text:'Error starting process: '+e.message}); setStatus('error') }
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

  function parseInputsField(t){
    return parseIOField(t.inputs)
  }

  async function fetchInbox(){
    setStatus('fetching')
    try{
      const resp = await fetch(INBOX_BASE + '/inbox')
      if(!resp.ok) throw new Error(resp.status+' '+resp.statusText)
      const data = await resp.json()
      const tasks = extractTasks(data)
      if(tasks && tasks.length>0){
        // pick the first unseen task only
        const next = tasks.find(t => t && t.id && !seenRef.current.has(t.id))
        if(next) renderTask(next)
      }
      setStatus('idle')
    }catch(e){ push({type:'out', text:'No pude conectar al inbox: '+e.message}); setStatus('offline') }
  }

  function mockTask(){ return { id:'mock-1', threadId:'mock-thread', status:'PENDING', taskName:'MOCK-REVIEW', prompt:'Mock: Apruebe o rechace', outputs: JSON.stringify([{key:'approved', dataType:'Boolean'}]) } }

  function parseOutputsField(t){
    // Prefer outputs, fall back to inputs; handle stringified arrays
    const outputs = t.outputs || t.outputsJson
    if(outputs){
      if(typeof outputs === 'string'){
        try{ return JSON.parse(outputs) }catch(e){ return [] }
      }
      return Array.isArray(outputs) ? outputs : []
    }
    return parseIOField(t.inputs)
  }

  function renderTask(t){
    if(!t || !t.id) return
    // if we already have an active task (use ref for immediate check), skip assigning new ones
    if(currentTaskRef.current) return
    if(seenRef.current.has(t.id)) return
    // set as current task (do not mark seen until answered)
    currentTaskRef.current = t
    setCurrentTask(t)
    push({type:'in', text:t.prompt || t.taskName || '', meta:`${t.taskName || 'task'} — ${t.threadId||''}`, task:t})
  }

  async function sendTaskResponse(task, outputKey, value){
    push({type:'out', text:`Responding to ${task.taskName || task.id}...`})
    setStatus('posting')
    const thread = task.threadId || task.thread || task.id
    const outputs = parseOutputsField(task)
    // Prefer the provided outputKey, otherwise take the first output's key/name
    const nameKey = outputKey ? outputKey : (outputs && outputs.length && (outputs[0].key || outputs[0].name))
    const valObj = (nameKey && value !== undefined) ? { name: nameKey, value } : null
    // send values as array of objects and processDefinition as parsed object
    let parsedProcessDef = {}
    try { parsedProcessDef = JSON.parse(cleanJson(processDef)) } catch(e) {}
    const putInboxRequest = {
      id: task.id,
      interruptId: task.interruptId || task.interrupt || null,
      nodeKey: task.nodeKey || task.nodekey || task.node || null,
      values: valObj ? [valObj] : [],
      processDefinition: parsedProcessDef
    }
    const payload = {
      PutInboxRequest: putInboxRequest,
      threadId: thread
    }
    try{
      const url = `${INBOX_BASE}/${encodeURIComponent(thread)}/inbox`
      const resp = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if(!resp.ok) throw new Error(resp.status+' '+resp.statusText)
      const data = await resp.json().catch(()=>null)
      push({type:'out', text:'Response sent' + (data? (' — '+JSON.stringify(data)) : '')})
      // mark task as seen so it won't be re-displayed
      seenRef.current.add(task.id)
      setCurrentTask(null)
      currentTaskRef.current = null
      setResponseText('')
      setStatus('idle')
      // fetch next task immediately
      fetchInbox()
    }catch(e){ push({type:'out', text:'Error sending response: '+e.message}); setStatus('error') }
  }

  useEffect(()=>{
    let t
    if(autoPoll && !currentTaskRef.current){ fetchInbox(); t = setInterval(()=>fetchInbox(), 4000) }
    return ()=>{ if(t) clearInterval(t) }
  }, [autoPoll, currentTask])

  return (
    <div className="container">
      <header>
        <h1>Test Inbox — LangGraph POC</h1>
        <p className="muted">Pega el JSON de <strong>processDefinition</strong> y presiona <strong>Execute</strong></p>
      </header>

      <section className="controls">
        <textarea value={processDef} onChange={e=>setProcessDef(e.target.value)} id="processDef" placeholder='Pega aquí el JSON del processDefinition...' spellCheck={false}></textarea>
        <div className="controls-row">
          <button className="primary" onClick={executeProcess}>Execute</button>
          <button onClick={fetchInbox}>Fetch Inbox</button>
          <label className="poll"><input type="checkbox" checked={autoPoll} onChange={e=>setAutoPoll(e.target.checked)} /> Auto-poll</label>
          <span className="status">{status}</span>
        </div>
      </section>

      <section className="chat" ref={containerRef}>
        {messages.map(m=> (
          <Message key={m.id} msg={m} onRespond={sendTaskResponse} />
        ))}
      </section>

      {/* Composer shown when there's a current task */}
      {currentTask ? (
        <div style={{marginTop:12,display:'flex',gap:8,alignItems:'center'}}>
          <input
            className="short"
            style={{flex:1}}
            placeholder="Escribí tu respuesta aquí..."
            value={responseText}
            onChange={e=>setResponseText(e.target.value)}
            onKeyDown={e=>{ if(e.key === 'Enter'){ e.preventDefault(); sendTaskResponse(currentTask, (currentTask.outputs && JSON.parse(currentTask.outputs || '[]')[0]?.key) || null, responseText || true) } }}
          />
          <button className="primary" onClick={()=>sendTaskResponse(currentTask, (currentTask.outputs && JSON.parse(currentTask.outputs || '[]')[0]?.key) || null, responseText || true)}>Enviar</button>
        </div>
      ) : null}

      <footer className="footer"><small>Frontend POC — Posts to <code>http://localhost:8000/api/workflow/start</code></small></footer>
    </div>
  )
}

function Message({msg, onRespond}){
  const { type, text, meta, task } = msg
  const outputs = task ? (Array.isArray(task.outputs) ? task.outputs : (typeof task.outputs === 'string' ? (()=>{try{return JSON.parse(task.outputs)}catch(e){return []}})() : [])) : []
  const booleanOutputs = outputs.filter(o=> (o.dataType||'').toLowerCase().includes('boolean'))
  const textOutputs = outputs.filter(o=> !((o.dataType||'').toLowerCase().includes('boolean')))

  return (
    <div className={"msg "+(type==='in' ? 'in' : 'out')}>
      {meta ? <div className="meta" dangerouslySetInnerHTML={{__html: meta}} /> : null}
      <div>{text}</div>
      {task ? (
        <div className="task-actions">
          {booleanOutputs.length ? (
            <div className="widget-boolean">
              <button className="pill" onClick={()=>onRespond(task, booleanOutputs[0].key, true)}>Aceptar</button>
              <button className="pill" onClick={()=>onRespond(task, booleanOutputs[0].key, false)}>Rechazar</button>
            </div>
          ) : null}

          {textOutputs.length ? (
            <div className="widget-text">
              <input className="short" type="text" placeholder={textOutputs[0].key||'respuesta'} id={"in-"+task.id}
                onKeyDown={e=>{ if(e.key === 'Enter'){ e.preventDefault(); const v = document.getElementById('in-'+task.id).value; onRespond(task, textOutputs[0].key, v) } }} />
              <button className="pill" onClick={()=>{ const v = document.getElementById('in-'+task.id).value; onRespond(task, textOutputs[0].key, v) }}>Enviar</button>
            </div>
          ) : null}

          {outputs.length===0 ? (
            <button className="pill" onClick={()=>onRespond(task, null, {ack:true})}>Mark Done</button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
