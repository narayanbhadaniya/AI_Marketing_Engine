import React, { useState, useEffect } from 'react'
import { listCampaigns, getCalendar, scheduleContent, updateContentStatus } from '../lib/api'
import toast from 'react-hot-toast'
import { CalendarDays, Download } from 'lucide-react'

const PC = { linkedin:'#0077b5', instagram:'#e1306c', twitter:'#1da1f2', email:'#059669', blog:'#d97706', google_ads:'#fbbc04', seo:'#7c3aed', video:'#dc2626' }
const STATUS_OPT = ['Draft','Ready','Scheduled','Published']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getWeeks(year, month) {
  const weeks = []; const first = new Date(year,month,1); const last = new Date(year,month+1,0)
  let cur = new Date(first); while(cur.getDay()!==0) cur.setDate(cur.getDate()-1)
  while(cur<=last) { const w=[]; for(let i=0;i<7;i++){ w.push(new Date(cur)); cur.setDate(cur.getDate()+1) } weeks.push(w) }
  return weeks
}

export default function ContentCalendar({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [sel, setSel] = useState(null)
  const [contents, setContents] = useState([])
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [pfFilter, setPfFilter] = useState('All')
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  useEffect(()=>{ listCampaigns().then(r=>{ setCampaigns(r.data); const c=activeCampaign||(r.data.length>0?r.data[r.data.length-1]:null); if(c) setSel(c) }).catch(()=>{}) },[activeCampaign])
  useEffect(()=>{ if(sel) load() },[sel])

  const load = async () => {
    setLoading(true)
    try { const r=await getCalendar(sel.id); setContents(r.data.contents||[]); setSuggestion(r.data.schedule_suggestion||'') } catch { toast.error('Failed to load') }
    setLoading(false)
  }

  const weeks = getWeeks(year, month)
  const monthName = new Date(year,month).toLocaleString('default',{month:'long',year:'numeric'})

  const forDate = d => {
    const ds = d.toISOString().split('T')[0]
    return contents.filter(c=>c.scheduled_date===ds && (pfFilter==='All'||c.platform===pfFilter))
  }
  const unscheduled = contents.filter(c=>!c.scheduled_date && (pfFilter==='All'||c.platform===pfFilter))

  const handleDrop = async (date) => {
    if (!dragging) return
    const ds = date.toISOString().split('T')[0]
    try {
      await scheduleContent({ content_id:dragging.id, scheduled_date:ds, status:'Scheduled' })
      setContents(prev=>prev.map(c=>c.id===dragging.id?{...c,scheduled_date:ds,status:'Scheduled'}:c))
      toast.success(`Scheduled for ${ds}`)
    } catch { toast.error('Failed to schedule') }
    setDragging(null); setDragOver(null)
  }

  const exportCSV = () => {
    const rows = ['Title,Platform,Type,Status,Date']
    contents.forEach(c=>rows.push(`"${c.title}",${c.platform},${c.content_type},${c.status},${c.scheduled_date||''}`))
    const b=new Blob([rows.join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='calendar.csv'; a.click()
    toast.success('Exported!')
  }

  const platforms = ['All',...new Set(contents.map(c=>c.platform))]
  const allPlats = sel?.platforms||[]
  const scheduledPlats = [...new Set(contents.filter(c=>c.scheduled_date).map(c=>c.platform))]
  const gaps = allPlats.filter(p=>!scheduledPlats.map(s=>s.toLowerCase()).includes(p.toLowerCase()))

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <CalendarDays size={16} color="#db2777" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#db2777', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 6</span>
      </div>
      <h1 className="page-title">Content Calendar</h1>
      <p className="page-sub">Drag content onto dates to schedule. Filter by platform, export as CSV.</p>

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <select className="form-select" style={{ width:'220px' }} value={sel?.id||''} onChange={e=>setSel(campaigns.find(c=>c.id===+e.target.value))}>
          <option value="">Choose campaign...</option>
          {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {platforms.map(p=><button key={p} className={`chip ${pfFilter===p?'active':''}`} onClick={()=>setPfFilter(p)} style={{ textTransform:'capitalize' }}>{p}</button>)}
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV} style={{ marginLeft:'auto' }}><Download size={13}/> Export CSV</button>
      </div>

      {/* Gaps */}
      {gaps.length>0 && <div className="warn-box" style={{ marginBottom:'14px' }}>⚠️ No content scheduled for: <strong>{gaps.join(', ')}</strong></div>}

      {/* AI suggestion */}
      {suggestion && (
        <div className="ai-box" style={{ marginBottom:'20px' }}>
          <div className="ai-box-title">🤖 AI Posting Schedule Suggestion</div>
          <div className="ai-box-text">{suggestion}</div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:'20px', alignItems:'start' }}>
        {/* Calendar */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <button className="btn btn-ghost btn-sm" onClick={()=>{ if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }}>← Prev</button>
            <span style={{ fontWeight:800, color:'#111827', fontSize:'16px' }}>{monthName}</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>{ if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }}>Next →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'4px' }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:'center', fontSize:'11px', fontWeight:700, color:'#9ca3af', padding:'6px 0', textTransform:'uppercase' }}>{d}</div>)}
          </div>
          {weeks.map((week,wi)=>(
            <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'4px' }}>
              {week.map((day,di)=>{
                const inMonth = day.getMonth()===month
                const isToday = day.toDateString()===now.toDateString()
                const isDragOver = dragOver===day.toISOString().split('T')[0]
                const dayC = forDate(day)
                return (
                  <div key={di}
                    onDragOver={e=>{ e.preventDefault(); setDragOver(day.toISOString().split('T')[0]) }}
                    onDragLeave={()=>setDragOver(null)}
                    onDrop={()=>handleDrop(day)}
                    style={{ minHeight:'80px', padding:'6px', borderRadius:'10px', border:`1.5px solid ${isDragOver?'#2563eb':isToday?'#93c5fd':inMonth?'#e5e7eb':'#f3f4f6'}`, background:isDragOver?'#eff6ff':isToday?'#eff6ff':inMonth?'#fff':'#f9fafb', opacity:inMonth?1:0.45, transition:'all 0.1s' }}>
                    <div style={{ fontSize:'11px', fontWeight:isToday?800:500, color:isToday?'#2563eb':'#6b7280', marginBottom:'4px' }}>{day.getDate()}</div>
                    {dayC.map(c=>{
                      const pc=PC[c.platform]||'#2563eb'
                      return <div key={c.id} style={{ fontSize:'10px', padding:'2px 6px', borderRadius:'4px', marginBottom:'2px', background:`${pc}15`, color:pc, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', border:`1px solid ${pc}30` }} title={c.title}>{c.platform}</div>
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Unscheduled panel */}
        <div>
          <div style={{ fontWeight:700, color:'#374151', fontSize:'13px', marginBottom:'4px' }}>Unscheduled ({unscheduled.length})</div>
          <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'10px' }}>Drag onto calendar →</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'540px', overflowY:'auto' }}>
            {loading && <div className="loading-pulse" style={{ color:'#9ca3af', fontSize:'12px', textAlign:'center', padding:'20px 0' }}>Loading...</div>}
            {unscheduled.map(c=>{
              const pc=PC[c.platform]||'#2563eb'
              return (
                <div key={c.id} draggable onDragStart={()=>setDragging(c)} onDragEnd={()=>setDragging(null)}
                  style={{ padding:'10px 12px', borderRadius:'10px', cursor:'grab', border:`1.5px solid ${pc}30`, background:`${pc}08`, transition:'all 0.15s', boxShadow:dragging?.id===c.id?'0 4px 14px rgba(0,0,0,0.1)':'none' }}>
                  <div style={{ fontWeight:700, color:pc, fontSize:'11px', textTransform:'capitalize', marginBottom:'2px' }}>{c.platform} · {c.content_type?.replace(/_/g,' ')}</div>
                  <div style={{ fontSize:'11px', color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'6px' }}>{c.title||'Untitled'}</div>
                  <select style={{ fontSize:'10px', background:'#fff', border:'1px solid #e5e7eb', color:'#6b7280', borderRadius:'6px', padding:'2px 4px', cursor:'pointer', width:'100%' }}
                    value={c.status} onChange={async e=>{
                      try { await updateContentStatus(c.id, e.target.value); setContents(prev=>prev.map(x=>x.id===c.id?{...x,status:e.target.value}:x)) } catch {}
                    }}>
                    {STATUS_OPT.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )
            })}
            {unscheduled.length===0 && !loading && <div style={{ textAlign:'center', color:'#9ca3af', fontSize:'12px', padding:'30px 0' }}>All content scheduled! 🎉</div>}
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="card card-flat" style={{ marginTop:'20px', display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
        <span style={{ fontSize:'12px', color:'#6b7280', fontWeight:600 }}>Platforms:</span>
        {Object.entries(PC).map(([p,c])=>(
          <div key={p} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, display:'inline-block' }}/>
            <span style={{ fontSize:'12px', color:'#374151', textTransform:'capitalize' }}>{p.replace('_',' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
