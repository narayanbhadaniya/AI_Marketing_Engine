import React, { useState, useEffect } from 'react'
import { listCampaigns, repurposeContent } from '../lib/api'
import toast from 'react-hot-toast'
import { RefreshCw, Copy } from 'lucide-react'

const TYPES = ['blog','podcast','webinar']

export default function RepurposeEngine({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [sel, setSel] = useState(null)
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('blog')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    listCampaigns().then(r=>{ setCampaigns(r.data); if(activeCampaign) setSel(activeCampaign); else if(r.data.length>0) setSel(r.data[r.data.length-1]) }).catch(()=>{})
  }, [activeCampaign])

  const handle = async () => {
    if (!sel) return toast.error('Select a campaign')
    if (!assetName.trim()) return toast.error('Enter asset name')
    if (content.length < 100) return toast.error('Paste at least 100 chars of content')
    setLoading(true); setResult(null)
    try {
      const r = await repurposeContent({ campaign_id:sel.id, asset_name:assetName, asset_type:assetType, content })
      if (r.data.error) throw new Error(r.data.error)
      setResult(r.data); toast.success('Content repurposed!')
    } catch(e) { toast.error(e.message||'Repurposing failed') }
    setLoading(false)
  }

  const copy = t => { navigator.clipboard.writeText(typeof t==='object'?JSON.stringify(t,null,2):t); toast.success('Copied!') }

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <RefreshCw size={16} color="#0891b2" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#0891b2', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 3</span>
      </div>
      <h1 className="page-title">Content Repurposing Engine</h1>
      <p className="page-sub">Upload a long-form asset and extract maximum value across all formats</p>

      <div className="card" style={{ marginBottom:'24px' }}>
        <div className="card-header"><span style={{ fontWeight:700, color:'#111827' }}>Asset Input</span></div>
        <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
            <div>
              <label className="form-label">Campaign</label>
              <select className="form-select" value={sel?.id||''} onChange={e=>setSel(campaigns.find(c=>c.id===+e.target.value))}>
                <option value="">Choose...</option>
                {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Asset Name</label>
              <input className="form-input" placeholder="e.g. Q1 AI Report" value={assetName} onChange={e=>setAssetName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Asset Type</label>
              <div className="chip-group">
                {TYPES.map(t=><button key={t} className={`chip ${assetType===t?'active':''}`} onClick={()=>setAssetType(t)} style={{ textTransform:'capitalize' }}>{t}</button>)}
              </div>
            </div>
          </div>
          <div>
            <label className="form-label">Paste {assetType} content *</label>
            <textarea className="form-textarea" rows={10} placeholder={`Paste full ${assetType} content here (min 100 chars)...`} value={content} onChange={e=>setContent(e.target.value)} />
            <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>{content.length} chars · {content.split(' ').filter(Boolean).length} words</div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handle} disabled={loading}>
            {loading?<><span className="loading-spinner"/>&nbsp;AI is repurposing...</>:<><RefreshCw size={15}/>Repurpose Across All Formats</>}
          </button>
        </div>
      </div>

      {loading && <div className="card card-flat" style={{ textAlign:'center', padding:'40px' }}><div className="loading-pulse" style={{ color:'#0891b2', fontWeight:600 }}>🤖 Extracting key insights and generating formats...</div></div>}

      {result && !loading && (
        <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {/* Summary */}
          {result.summary && (
            <div className="ai-box">
              <div className="ai-box-title">Main Argument Summary</div>
              <p className="ai-box-text">{result.summary}</p>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            {/* Key insights */}
            {result.key_insights && (
              <div className="card card-flat">
                <div className="section-label" style={{ color:'#d97706' }}>Top 5 Key Insights</div>
                <ol style={{ paddingLeft:'18px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {result.key_insights.map((ins,i)=><li key={i} style={{ color:'#374151', fontSize:'13px', lineHeight:1.6 }}>{ins}</li>)}
                </ol>
              </div>
            )}
            {/* Quotable lines */}
            {result.quotable_lines && (
              <div className="card card-flat">
                <div className="section-label" style={{ color:'#7c3aed' }}>Most Quotable Lines</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {result.quotable_lines.map((q,i)=>(
                    <div key={i} style={{ padding:'10px 12px', background:'#faf5ff', border:'1.5px solid #e9d5ff', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                      <span style={{ color:'#6d28d9', fontSize:'13px', lineHeight:1.5, fontStyle:'italic' }}>"{q}"</span>
                      <button onClick={()=>copy(q)} className="btn btn-sm btn-ghost" style={{ padding:'3px 6px', flexShrink:0 }}><Copy size={11}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coverage map */}
          {result.coverage_map && (
            <div className="card card-flat">
              <div className="section-label" style={{ color:'#059669' }}>Content Coverage Map</div>
              {result.coverage_map.map((item,i)=>(
                <div key={i} className="coverage-item">
                  <div className="coverage-label">
                    <span style={{ fontSize:'13px', fontWeight:600, color:'#111827' }}>{item.section}</span>
                    <span style={{ fontSize:'12px', fontWeight:700, color:'#059669' }}>{item.usage_percentage}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${item.usage_percentage}%`, background:'linear-gradient(90deg,#059669,#34d399)' }}/></div>
                  <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'3px' }}>Used for: {item.used_for?.join(', ')}</div>
                </div>
              ))}
            </div>
          )}

          {/* Generated content */}
          {result.generated_content && (
            <div>
              <div className="section-label" style={{ color:'#0891b2' }}>Generated Content (Based on {assetName})</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  ['LinkedIn Post','linkedin_post','#0077b5'],
                  ['Instagram Caption','instagram_caption','#e1306c'],
                  ['Twitter Thread','twitter_thread','#1da1f2'],
                  ['Email Section','email_section','#059669'],
                  ['Google Ad','google_ad','#fbbc04'],
                ].map(([label, key, color])=>{
                  const val = result.generated_content[key]
                  if (!val) return null
                  const text = Array.isArray(val)?val.join('\n\n---\n\n'):typeof val==='object'?`Subject: ${val.subject}\n\n${val.body}\n\nCTA: ${val.cta}`:val
                  return (
                    <div key={key} style={{ border:`1.5px solid ${color}30`, borderRadius:'12px', overflow:'hidden', background:'#fff' }}>
                      <div style={{ padding:'10px 14px', background:`${color}08`, borderBottom:`1.5px solid ${color}20`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:color, display:'inline-block' }}/>
                          <span style={{ fontSize:'12px', fontWeight:700, color:'#374151' }}>{label}</span>
                        </div>
                        <button onClick={()=>copy(text)} className="btn btn-sm btn-ghost" style={{ padding:'3px 8px' }}><Copy size={11}/></button>
                      </div>
                      <div style={{ padding:'14px', fontSize:'13px', color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap', maxHeight:'200px', overflowY:'auto' }}>{text}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
