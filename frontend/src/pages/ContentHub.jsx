import React, { useState, useEffect } from 'react'
import { listCampaigns, generateContent } from '../lib/api'
import toast from 'react-hot-toast'
import { Sparkles, Copy, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

const PLAT_COLORS = { linkedin:'#0077b5', instagram:'#e1306c', twitter:'#1da1f2', email:'#059669', blog:'#d97706', google_ads:'#fbbc04', seo:'#7c3aed', video:'#dc2626' }

function CopyCard({ title, content, platformColor='#2563eb', defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen)
  const text = typeof content === 'object' ? JSON.stringify(content, null, 2) : (content || '')
  const copy = () => { navigator.clipboard.writeText(text); toast.success('Copied!') }
  return (
    <div className="copy-card">
      <div className="copy-card-header">
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:platformColor, display:'inline-block', flexShrink:0 }}/>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#374151' }}>{title}</span>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          <button onClick={copy} className="btn btn-sm btn-ghost" style={{ padding:'3px 8px' }} title="Copy"><Copy size={12}/></button>
          <button onClick={()=>setOpen(!open)} className="btn btn-sm btn-ghost" style={{ padding:'3px 8px' }}>{open?<ChevronUp size={12}/>:<ChevronDown size={12}/>}</button>
        </div>
      </div>
      {open && <div className="copy-card-body">{text || <span style={{color:'#9ca3af'}}>No content</span>}</div>}
    </div>
  )
}

function SLabel({ children, color='#2563eb' }) {
  return <div style={{ fontSize:'11px', fontWeight:700, color, letterSpacing:'0.08em', textTransform:'uppercase', margin:'24px 0 10px', display:'flex', alignItems:'center', gap:'6px' }}>{children}</div>
}

export default function ContentHub({ activeCampaign }) {
  const [campaigns, setCampaigns] = useState([])
  const [selCampaign, setSelCampaign] = useState(null)
  const [topic, setTopic] = useState('')
  const [extra, setExtra] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [refineInstr, setRefineInstr] = useState('')

  useEffect(() => {
    listCampaigns().then(r => { setCampaigns(r.data); if (activeCampaign) setSelCampaign(activeCampaign); else if (r.data.length>0) setSelCampaign(r.data[r.data.length-1]) }).catch(()=>{})
  }, [activeCampaign])

  const generate = async () => {
    if (!selCampaign) return toast.error('Select a campaign')
    if (!topic.trim()) return toast.error('Enter a topic/brief')
    setLoading(true); setResult(null)
    try {
      const r = await generateContent({ campaign_id:selCampaign.id, topic, extra_instructions:extra })
      if (r.data.error) throw new Error(r.data.error)
      setResult(r.data); toast.success('All 8 formats generated!')
    } catch(e) { toast.error(e.message || 'Generation failed — check API key') }
    setLoading(false)
  }

  const refineAll = async () => {
    if (!refineInstr.trim()) return toast.error('Enter refinement instruction')
    setLoading(true)
    try {
      const r = await generateContent({ campaign_id:selCampaign.id, topic, extra_instructions:refineInstr })
      if (r.data.error) throw new Error(r.data.error)
      setResult(r.data); toast.success('Refined!')
    } catch(e) { toast.error(e.message||'Refinement failed') }
    setLoading(false)
  }

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <Sparkles size={16} color="#7c3aed" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#7c3aed', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 2</span>
      </div>
      <h1 className="page-title">Content Generation Hub</h1>
      <p className="page-sub">Generate 8 content formats from a single brief — all respecting your brand tone</p>

      {/* Input card */}
      <div className="card" style={{ marginBottom:'24px' }}>
        <div className="card-header"><span style={{ fontWeight:700, color:'#111827' }}>Campaign Brief</span></div>
        <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div>
              <label className="form-label">Campaign *</label>
              <select className="form-select" value={selCampaign?.id||''} onChange={e=>setSelCampaign(campaigns.find(c=>c.id===+e.target.value))}>
                <option value="">Choose campaign...</option>
                {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Extra Instructions (optional)</label>
              <input className="form-input" placeholder="Focus on ROI, add pricing..." value={extra} onChange={e=>setExtra(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Topic / Campaign Brief *</label>
            <textarea className="form-textarea" rows={3} placeholder="e.g. Launching our AI-powered analytics dashboard for mid-market SaaS — highlight time savings and ROI..." value={topic} onChange={e=>setTopic(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={generate} disabled={loading}>
            {loading ? <><span className="loading-spinner"/>&nbsp;Generating all 8 formats...</> : <><Sparkles size={15}/>Generate All Content Formats</>}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card card-flat" style={{ textAlign:'center', padding:'40px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🤖</div>
          <div className="loading-pulse" style={{ color:'#2563eb', fontWeight:600, fontSize:'14px' }}>Generating LinkedIn, Instagram, Twitter, Video Scripts, Email, Blog, Google Ads & SEO Meta...</div>
          <div style={{ color:'#9ca3af', fontSize:'12px', marginTop:'8px' }}>This may take 15–30 seconds</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="fade-in">
          {/* LinkedIn */}
          {result.linkedin && (<>
            <SLabel color="#0077b5">🔵 LinkedIn Posts (3 variants)</SLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <CopyCard title="LinkedIn — Thought Leadership" content={result.linkedin.thought_leadership} platformColor="#0077b5" />
              <CopyCard title="LinkedIn — Story-Based" content={result.linkedin.story_based} platformColor="#0077b5" defaultOpen={false} />
              <CopyCard title="LinkedIn — Direct CTA" content={result.linkedin.direct_cta} platformColor="#0077b5" defaultOpen={false} />
            </div>
          </>)}

          {/* Instagram */}
          {result.instagram && (<>
            <SLabel color="#e1306c">📸 Instagram</SLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <CopyCard title="Instagram — With Emojis" content={result.instagram.with_emojis} platformColor="#e1306c" />
              <CopyCard title="Instagram — Without Emojis" content={result.instagram.without_emojis} platformColor="#e1306c" />
            </div>
            <div style={{ marginTop:'10px' }}>
              <CopyCard title="Hashtag Set" content={result.instagram.hashtags?.join('  ')} platformColor="#e1306c" />
            </div>
          </>)}

          {/* Twitter */}
          {result.twitter && (<>
            <SLabel color="#1da1f2">🐦 Twitter / X (5 angles)</SLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {Object.entries(result.twitter).map(([angle, text])=>(
                <CopyCard key={angle} title={`Twitter — ${angle.replace(/_/g,' ')}`} content={text} platformColor="#1da1f2" />
              ))}
            </div>
          </>)}

          {/* Video Scripts */}
          {result.video_scripts && (<>
            <SLabel color="#dc2626">🎬 Video Scripts</SLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {Object.entries(result.video_scripts).map(([dur, s])=>(
                <CopyCard key={dur} title={`Video — ${dur.replace(/_/g,' ')}`} content={`HOOK:\n${s.hook}\n\nBODY:\n${s.body}\n\nCTA:\n${s.cta}`} platformColor="#dc2626" />
              ))}
            </div>
          </>)}

          {/* Email */}
          {result.email && (<>
            <SLabel color="#059669">✉️ Email Newsletter</SLabel>
            <CopyCard title={`Email · Subject: ${result.email.subject_line}`} content={`${result.email.body}\n\nCTA: ${result.email.cta}`} platformColor="#059669" />
          </>)}

          {/* Blog */}
          {result.blog_outline && (<>
            <SLabel color="#d97706">📝 Blog Post Outline</SLabel>
            <div className="card card-flat">
              <div style={{ fontWeight:800, fontSize:'15px', color:'#111827', marginBottom:'14px' }}>H1: {result.blog_outline.h1}</div>
              {result.blog_outline.sections?.map((sec,i)=>(
                <div key={i} style={{ marginBottom:'14px', paddingLeft:'14px', borderLeft:'3px solid #bfdbfe' }}>
                  <div style={{ fontWeight:700, color:'#1d4ed8', fontSize:'13px' }}>H2: {sec.h2}</div>
                  <div style={{ fontSize:'11px', color:'#6b7280', margin:'3px 0' }}>~{sec.word_count} words</div>
                  <ul style={{ paddingLeft:'16px', marginTop:'4px' }}>
                    {sec.key_points?.map((pt,j)=><li key={j} style={{ color:'#4b5563', fontSize:'12px', marginBottom:'2px' }}>{pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </>)}

          {/* Google Ads */}
          {result.google_ads && (<>
            <SLabel color="#d97706">📢 Google Ads (3 variants)</SLabel>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {result.google_ads.map((ad,i)=>(
                <CopyCard key={i} title={`Google Ad ${i+1}`} content={`Headline: ${ad.headline}\n\nDescription: ${ad.description}`} platformColor="#fbbc04" />
              ))}
            </div>
          </>)}

          {/* SEO */}
          {result.seo && (<>
            <SLabel color="#7c3aed">🔍 SEO Meta</SLabel>
            <CopyCard title="SEO Title & Meta Description" content={`Meta Title:\n${result.seo.meta_title}\n\nMeta Description:\n${result.seo.meta_description}`} platformColor="#7c3aed" />
          </>)}

          {/* Refine box */}
          <div className="card card-flat" style={{ marginTop:'28px' }}>
            <div style={{ fontWeight:700, color:'#111827', marginBottom:'10px', fontSize:'13px' }}>🔄 Refine & Regenerate with AI</div>
            <div style={{ display:'flex', gap:'10px' }}>
              <input className="form-input" style={{ flex:1 }} placeholder='"Make this more aggressive" / "Shorten everything" / "Add more urgency"'
                value={refineInstr} onChange={e=>setRefineInstr(e.target.value)} />
              <button className="btn btn-outline" onClick={refineAll} disabled={loading} style={{ whiteSpace:'nowrap' }}>
                <RefreshCw size={13}/> Apply & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
