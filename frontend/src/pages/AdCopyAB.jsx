import React, { useState, useEffect } from 'react'
import { listCampaigns, generateAdCopy } from '../lib/api'
import toast from 'react-hot-toast'
import { Target, Download, Trophy, Copy } from 'lucide-react'

const TONE_COLORS = { Emotional:'#db2777', Logical:'#2563eb', Urgency:'#d97706', 'Social Proof':'#059669', Curiosity:'#7c3aed' }
const STATUS_STYLES = {
  Testing: { bg:'#fefce8', color:'#a16207', border:'#fde68a' },
  Winner:  { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0' },
  Rejected:{ bg:'#fff1f2', color:'#be123c', border:'#fecdd3' },
}
const PLATFORMS = ['LinkedIn','Instagram','Google Ads','Twitter','Email']
const GOALS = ['Awareness','Lead Gen','Conversions','Retargeting']

export default function AdCopyAB({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [sel, setSel] = useState(null)
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [platform, setPlatform] = useState('LinkedIn')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState([])
  const [statuses, setStatuses] = useState({})
  const [topPick, setTopPick] = useState(null)
  const [topReason, setTopReason] = useState('')

  useEffect(() => {
    listCampaigns().then(r=>{ setCampaigns(r.data); if(activeCampaign) setSel(activeCampaign); else if(r.data.length>0) setSel(r.data[r.data.length-1]) }).catch(()=>{})
  }, [activeCampaign])

  const generate = async () => {
    if (!product.trim()) return toast.error('Enter product/service')
    if (!audience.trim()) return toast.error('Enter target audience')
    if (!goal.trim()) return toast.error('Enter goal')
    setLoading(true); setVariants([])
    try {
      const r = await generateAdCopy({ campaign_id:sel?.id||null, product, audience, platform, goal })
      if (r.data.error) throw new Error(r.data.error)
      const vars = r.data.variants || []
      setVariants(vars)
      setTopPick(r.data.top_pick_index??null)
      setTopReason(r.data.top_pick_reason||'')
      const s = {}; vars.forEach((_,i)=>{ s[i]='Testing' }); setStatuses(s)
      toast.success('5 ad variants generated!')
    } catch(e) { toast.error(e.message||'Generation failed') }
    setLoading(false)
  }

  const exportCSV = () => {
    if (!variants.length) return
    const rows = ['Variant,Headline,Description,Tone,Status']
    variants.forEach((v,i)=>rows.push(`${i+1},"${v.headline}","${v.description}",${v.tone_label},${statuses[i]||'Testing'}`))
    const b = new Blob([rows.join('\n')],{type:'text/csv'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`ads-${platform.toLowerCase()}.csv`; a.click()
    toast.success('Exported!')
  }

  const copy = text => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <Target size={16} color="#d97706" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#d97706', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 4</span>
      </div>
      <h1 className="page-title">Ad Copy & A/B Testing</h1>
      <p className="page-sub">Generate 5 variants per platform, compare side-by-side, mark winners</p>

      <div className="card" style={{ marginBottom:'24px' }}>
        <div className="card-header"><span style={{ fontWeight:700, color:'#111827' }}>Ad Copy Generator</span></div>
        <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div>
              <label className="form-label">Product / Service *</label>
              <input className="form-input" placeholder="e.g. AI analytics dashboard" value={product} onChange={e=>setProduct(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Target Audience *</label>
              <input className="form-input" placeholder="e.g. SaaS founders, 30–50" value={audience} onChange={e=>setAudience(e.target.value)} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div>
              <label className="form-label">Campaign Goal *</label>
              <div className="chip-group">
                {GOALS.map(g=><button key={g} className={`chip ${goal===g?'active':''}`} onClick={()=>setGoal(g)}>{g}</button>)}
              </div>
            </div>
            <div>
              <label className="form-label">Platform</label>
              <div className="chip-group">
                {PLATFORMS.map(p=><button key={p} className={`chip ${platform===p?'active':''}`} onClick={()=>setPlatform(p)}>{p}</button>)}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn btn-primary btn-lg" style={{ flex:1, justifyContent:'center' }} onClick={generate} disabled={loading}>
              {loading?<><span className="loading-spinner"/>&nbsp;Generating 5 variants...</>:<><Target size={15}/>Generate 5 Ad Variants</>}
            </button>
            {variants.length>0 && <button className="btn btn-outline" onClick={exportCSV}><Download size={14}/> Export CSV</button>}
          </div>
        </div>
      </div>

      {loading && <div className="card card-flat" style={{ textAlign:'center', padding:'40px' }}><div className="loading-pulse" style={{ color:'#d97706', fontWeight:600 }}>🤖 Generating 5 variants across Emotional, Logical, Urgency, Social Proof & Curiosity angles...</div></div>}

      {/* AI Top Pick */}
      {topPick!==null && topReason && (
        <div className="success-box" style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'16px' }}>
          <Trophy size={16} color="#15803d" style={{ flexShrink:0, marginTop:'1px' }} />
          <div>
            <div style={{ fontWeight:700, marginBottom:'2px' }}>AI Recommendation — Variant {topPick+1}</div>
            <div style={{ fontSize:'13px', opacity:0.85 }}>{topReason}</div>
          </div>
        </div>
      )}

      {/* Variants grid */}
      {variants.length>0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px' }}>
          {variants.map((v,i)=>{
            const status = statuses[i]||'Testing'
            const st = STATUS_STYLES[status]
            const tc = TONE_COLORS[v.tone_label]||'#2563eb'
            const isWinner = i===topPick
            return (
              <div key={i} className={`variant-card ${status==='Winner'?'winner':''} ${status==='Rejected'?'rejected':''}`} style={{ border:isWinner?'2px solid #16a34a':undefined }}>
                <div style={{ padding:'12px 14px', borderBottom:'1.5px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', background:isWinner?'#f0fdf4':'#f9fafb' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontWeight:800, color:'#111827' }}>Variant {i+1}</span>
                    {isWinner && <span className="badge badge-green">🏆 AI Pick</span>}
                  </div>
                  <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'999px', fontWeight:700, background:`${tc}15`, color:tc, border:`1.5px solid ${tc}30` }}>{v.tone_label}</span>
                </div>
                <div style={{ padding:'16px' }}>
                  <div style={{ fontWeight:800, fontSize:'14px', color:'#111827', marginBottom:'8px', lineHeight:1.4 }}>{v.headline}</div>
                  <div style={{ fontSize:'13px', color:'#4b5563', lineHeight:1.65, marginBottom:'14px' }}>{v.description}</div>
                  <button onClick={()=>copy(`${v.headline}\n\n${v.description}`)} className="btn btn-sm btn-ghost" style={{ marginBottom:'12px', width:'100%', justifyContent:'center' }}><Copy size={12}/> Copy Ad Copy</button>
                  {/* Status buttons */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
                    {['Testing','Winner','Rejected'].map(s=>{
                      const sst=STATUS_STYLES[s]
                      return (
                        <button key={s} onClick={()=>setStatuses(p=>({...p,[i]:s}))}
                          style={{ padding:'6px', borderRadius:'8px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'1.5px solid',
                            background:status===s?sst.bg:'transparent',
                            color:status===s?sst.color:'#9ca3af',
                            borderColor:status===s?sst.border:'#e5e7eb' }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      {variants.length>0 && (
        <div className="card card-flat" style={{ marginTop:'16px', display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'12px', color:'#6b7280', fontWeight:600 }}>Persuasion angles:</span>
          {Object.entries(TONE_COLORS).map(([tone,color])=>(
            <div key={tone} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:color, display:'inline-block' }}/>
              <span style={{ fontSize:'12px', color:'#374151' }}>{tone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
