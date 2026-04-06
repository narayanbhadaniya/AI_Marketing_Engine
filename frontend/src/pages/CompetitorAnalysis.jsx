import React, { useState, useEffect } from 'react'
import { listCampaigns, analyzeCompetitor } from '../lib/api'
import toast from 'react-hot-toast'
import { Swords, Copy, TrendingUp, AlertTriangle, Shield } from 'lucide-react'

export default function CompetitorAnalysis({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [sel, setSel] = useState(null)
  const [post, setPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(()=>{ listCampaigns().then(r=>{ setCampaigns(r.data); if(activeCampaign) setSel(activeCampaign); else if(r.data.length>0) setSel(r.data[r.data.length-1]) }).catch(()=>{}) },[activeCampaign])

  const analyze = async () => {
    if (post.trim().length<20) return toast.error('Paste a competitor post (min 20 chars)')
    setLoading(true); setResult(null)
    try {
      const r = await analyzeCompetitor({ campaign_id:sel?.id||null, competitor_post:post })
      if (r.data.error) throw new Error(r.data.error)
      setResult(r.data); toast.success('Analysis complete!')
    } catch(e) { toast.error(e.message||'Analysis failed') }
    setLoading(false)
  }

  const copy = t => { navigator.clipboard.writeText(t); toast.success('Copied!') }

  return (
    <div className="page-container" style={{ maxWidth:'860px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <Swords size={16} color="#dc2626" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#dc2626', textTransform:'uppercase', letterSpacing:'0.08em' }}>⭐ Bonus Module</span>
      </div>
      <h1 className="page-title">Competitor Content Analysis</h1>
      <p className="page-sub">Paste a competitor's post — AI scores their tone, finds weaknesses, and crafts a counter post</p>

      <div className="card" style={{ marginBottom:'24px' }}>
        <div className="card-header">
          <span style={{ fontWeight:700, color:'#111827' }}>Competitor Post Input</span>
          <select className="form-select" style={{ width:'220px' }} value={sel?.id||''} onChange={e=>setSel(campaigns.find(c=>c.id===+e.target.value))}>
            <option value="">No campaign (optional)</option>
            {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label className="form-label">Competitor Post *</label>
            <textarea className="form-textarea" rows={6} placeholder="Paste the competitor's marketing post, ad copy, or campaign message here..." value={post} onChange={e=>setPost(e.target.value)} />
            <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>{post.length} characters</div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={analyze} disabled={loading}>
            {loading?<><span className="loading-spinner"/>&nbsp;Analysing competitor...</>:<><Swords size={15}/>Analyse & Generate Counter Strategy</>}
          </button>
        </div>
      </div>

      {loading && <div className="card card-flat" style={{ textAlign:'center', padding:'40px' }}><div className="loading-pulse" style={{ color:'#dc2626', fontWeight:600 }}>🤖 Analysing tone, identifying weaknesses, crafting counter strategy...</div></div>}

      {result && !loading && (
        <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Score + tone analysis */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'16px' }}>
            <div className="card card-flat" style={{ textAlign:'center' }}>
              <div className="section-label" style={{ color:'#7c3aed' }}>Tone Consistency Score</div>
              <div style={{ position:'relative', width:'110px', height:'110px', margin:'0 auto 14px' }}>
                <svg viewBox="0 0 110 110" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#e9d5ff" strokeWidth="10"/>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#7c3aed" strokeWidth="10"
                    strokeDasharray={`${(result.tone_consistency_score/100)*289} 289`} strokeLinecap="round"/>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'26px', fontWeight:800, color:'#7c3aed' }}>{result.tone_consistency_score}</span>
                  <span style={{ fontSize:'10px', color:'#9ca3af', fontWeight:600 }}>/ 100</span>
                </div>
              </div>
              {result.tone_consistency_notes && <p style={{ fontSize:'12px', color:'#4b5563', lineHeight:1.6 }}>{result.tone_consistency_notes}</p>}
            </div>

            <div className="card card-flat">
              <div className="section-label" style={{ color:'#2563eb' }}>Tone Analysis</div>
              <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.75, marginBottom:'14px' }}>{result.tone_analysis}</p>
              <div className="section-label" style={{ color:'#2563eb', marginTop:'4px' }}>Key Messages</div>
              {result.key_messages?.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'5px' }}>
                  <span style={{ color:'#2563eb', fontWeight:800, flexShrink:0 }}>·</span>
                  <span style={{ fontSize:'13px', color:'#4b5563' }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          {result.weaknesses && (
            <div className="card card-flat">
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <AlertTriangle size={15} color="#d97706" />
                <div className="section-label" style={{ color:'#d97706', margin:0 }}>Competitor Weaknesses to Exploit</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {result.weaknesses.map((w,i)=>(
                  <div key={i} style={{ padding:'10px 14px', background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:'10px', fontSize:'13px', color:'#92400e', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                    <span style={{ fontWeight:800, flexShrink:0 }}>⚡</span> {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counter strategy */}
          {result.counter_strategy && (
            <div className="card card-flat">
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <Shield size={15} color="#059669" />
                <div className="section-label" style={{ color:'#059669', margin:0 }}>Counter Strategy</div>
              </div>
              <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.8 }}>{result.counter_strategy}</p>
            </div>
          )}

          {/* Counter post */}
          {result.counter_post_suggestion && (
            <div className="card card-flat" style={{ border:'1.5px solid #bfdbfe' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <TrendingUp size={15} color="#2563eb" />
                  <div className="section-label" style={{ color:'#2563eb', margin:0 }}>Ready-to-Use Counter Post</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={()=>copy(result.counter_post_suggestion)}><Copy size={12}/> Copy</button>
              </div>
              <div style={{ background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:'10px', padding:'16px 18px', fontSize:'14px', color:'#1e40af', lineHeight:1.8, whiteSpace:'pre-wrap', fontWeight:500 }}>
                {result.counter_post_suggestion}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
