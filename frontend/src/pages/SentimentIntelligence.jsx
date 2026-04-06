import React, { useState, useEffect, useRef } from 'react'
import { listCampaigns, analyzeSentiment, uploadCSV } from '../lib/api'
import toast from 'react-hot-toast'
import { BarChart2, Upload, Plus, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function SentimentIntelligence({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [sel, setSel] = useState(null)
  const [reviews, setReviews] = useState(['','',''])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    listCampaigns().then(r=>{ setCampaigns(r.data); if(activeCampaign) setSel(activeCampaign); else if(r.data.length>0) setSel(r.data[r.data.length-1]) }).catch(()=>{})
  }, [activeCampaign])

  const handleCSV = async e => {
    const file = e.target.files?.[0]; if(!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await uploadCSV(fd)
      setReviews(r.data.reviews)
      toast.success(`Loaded ${r.data.count} reviews`)
    } catch { toast.error('CSV parse failed') }
    setUploading(false)
  }

  const analyze = async () => {
    const clean = reviews.filter(r=>r.trim().length>3)
    if (clean.length<3) return toast.error('Add at least 3 reviews')
    if (!sel) return toast.error('Select a campaign')
    setLoading(true); setResult(null)
    try {
      const r = await analyzeSentiment({ campaign_id:sel.id, data:clean })
      if (r.data.error) throw new Error(r.data.error)
      setResult(r.data); toast.success('Analysis complete!')
    } catch(e) { toast.error(e.message||'Analysis failed') }
    setLoading(false)
  }

  const sentData = result?.sentiment_score ? [
    { name:'Positive', value:result.sentiment_score.positive, color:'#16a34a' },
    { name:'Neutral',  value:result.sentiment_score.neutral,  color:'#2563eb' },
    { name:'Negative', value:result.sentiment_score.negative, color:'#dc2626' },
  ] : []

  const wordFreqs = result?.word_frequencies ? Object.entries(result.word_frequencies).sort((a,b)=>b[1]-a[1]) : []
  const maxF = wordFreqs[0]?.[1] || 1

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <BarChart2 size={16} color="#059669" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 5</span>
      </div>
      <h1 className="page-title">Audience & Sentiment Intelligence</h1>
      <p className="page-sub">Upload reviews or comments — AI extracts actionable marketing intelligence</p>

      <div className="card" style={{ marginBottom:'24px' }}>
        <div className="card-header">
          <span style={{ fontWeight:700, color:'#111827' }}>Input Reviews / Comments</span>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <select className="form-select" style={{ width:'200px' }} value={sel?.id||''} onChange={e=>setSel(campaigns.find(c=>c.id===+e.target.value))}>
              <option value="">Choose campaign...</option>
              {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current?.click()} disabled={uploading}>
              <Upload size={13}/> {uploading?'Parsing...':'Upload CSV'}
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV} />
          </div>
        </div>
        <div className="card-body">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <label className="form-label" style={{ margin:0 }}>Reviews ({reviews.filter(r=>r.trim()).length} added)</label>
            <button className="btn btn-sm btn-ghost" onClick={()=>setReviews(p=>[...p,''])}><Plus size={12}/> Add</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'260px', overflowY:'auto', marginBottom:'14px' }}>
            {reviews.map((r,i)=>(
              <div key={i} style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <input className="form-input" style={{ flex:1 }} placeholder={`Review ${i+1}...`} value={r} onChange={e=>setReviews(p=>p.map((x,j)=>j===i?e.target.value:x))} />
                {reviews.length>1 && <button onClick={()=>setReviews(p=>p.filter((_,j)=>j!==i))} className="btn btn-sm btn-ghost" style={{ padding:'6px' }}><X size={13}/></button>}
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={analyze} disabled={loading}>
            {loading?<><span className="loading-spinner"/>&nbsp;Analysing sentiment...</>:<><BarChart2 size={15}/>Analyse {reviews.filter(r=>r.trim()).length} Reviews</>}
          </button>
        </div>
      </div>

      {loading && <div className="card card-flat" style={{ textAlign:'center', padding:'40px' }}><div className="loading-pulse" style={{ color:'#059669', fontWeight:600 }}>🤖 Detecting themes, emotional patterns, Voice of Customer...</div></div>}

      {result && !loading && (
        <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Sentiment pie + VoC */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'16px' }}>
            <div className="card card-flat" style={{ textAlign:'center' }}>
              <div className="section-label" style={{ color:'#059669', marginBottom:'12px' }}>Overall Sentiment</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {sentData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`${v}%`} contentStyle={{ background:'#fff', border:'1.5px solid #e5e7eb', fontSize:'12px', borderRadius:'8px' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginTop:'8px' }}>
                {sentData.map(s=>(
                  <div key={s.name} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:800, color:s.color }}>{s.value}%</div>
                    <div style={{ fontSize:'11px', color:'#6b7280', fontWeight:600 }}>{s.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-flat">
              <div className="section-label" style={{ color:'#2563eb' }}>Voice of Customer Summary</div>
              {result.voice_of_customer_summary && <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.8, fontStyle:'italic', marginBottom:'14px' }}>"{result.voice_of_customer_summary}"</p>}
              <div className="section-label" style={{ color:'#2563eb', marginTop:'4px' }}>Suggested Campaign Angles</div>
              {result.campaign_angles?.map((a,i)=>(
                <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'6px' }}>
                  <span style={{ color:'#2563eb', fontWeight:800 }}>→</span>
                  <span style={{ fontSize:'13px', color:'#374151' }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            {result.positive_themes && (
              <div className="card card-flat">
                <div className="section-label" style={{ color:'#059669' }}>✅ Top Positive Themes</div>
                {result.positive_themes.map((t,i)=>(
                  <div key={i} style={{ marginBottom:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{t.theme}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#059669' }}>{t.count}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min(100,(t.count/15)*100)}%`, background:'linear-gradient(90deg,#059669,#34d399)' }}/></div>
                    {t.example && <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>e.g. "{t.example}"</div>}
                  </div>
                ))}
              </div>
            )}
            {result.negative_themes && (
              <div className="card card-flat">
                <div className="section-label" style={{ color:'#dc2626' }}>⚠️ Top Negative Themes</div>
                {result.negative_themes.map((t,i)=>(
                  <div key={i} style={{ marginBottom:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{t.theme}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#dc2626' }}>{t.count}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min(100,(t.count/10)*100)}%`, background:'linear-gradient(90deg,#dc2626,#f87171)' }}/></div>
                    {t.example && <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>e.g. "{t.example}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High impact */}
          {result.high_impact_comments && (
            <div className="card card-flat">
              <div className="section-label" style={{ color:'#d97706' }}>⚡ High-Impact Comments</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {result.high_impact_comments.map((c,i)=>(
                  <div key={i} style={{ padding:'12px 16px', background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:'10px', fontSize:'13px', color:'#92400e', lineHeight:1.6, fontStyle:'italic' }}>"{c}"</div>
                ))}
              </div>
            </div>
          )}

          {/* Word cloud */}
          {wordFreqs.length>0 && (
            <div className="card card-flat">
              <div className="section-label" style={{ color:'#7c3aed' }}>☁️ Word Cloud</div>
              <div className="word-cloud">
                {wordFreqs.map(([word,count])=>{
                  const ratio = count/maxF
                  const size = 12+Math.round(ratio*22)
                  const colors = ['#2563eb','#059669','#d97706','#7c3aed','#dc2626','#0891b2']
                  const color = colors[word.length%colors.length]
                  return <span key={word} style={{ fontSize:`${size}px`, fontWeight:size>26?800:size>20?700:600, color, opacity:0.6+ratio*0.4, cursor:'default' }}>{word}</span>
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
