import React, { useState, useEffect } from 'react'
import { createBrand, listBrands, createCampaign, listCampaigns } from '../lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, Briefcase, Plus } from 'lucide-react'

const TONES = ['Professional','Witty','Warm','Bold','Minimalist','Playful','Authoritative']
const GOALS = ['Awareness','Lead Gen','Retention','Product Launch']
const PLATFORMS = ['LinkedIn','Instagram','Email','Google Ads','Twitter']

export default function BrandSetup({ setActiveCampaign, setCampaigns }) {
  const [step, setStep] = useState(1)
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiVal, setAiVal] = useState('')
  const [created, setCreated] = useState(null)

  const [brand, setBrand] = useState({ name:'', industry:'', target_audience:{ age:'', interests:[], pain_points:[] }, tone:[], keywords_include:[], keywords_avoid:[] })
  const [campaign, setCampaign] = useState({ brand_id:null, name:'', goal:'', duration:'', platforms:[] })

  useEffect(() => { listBrands().then(r=>setBrands(r.data)).catch(()=>{}) }, [])

  const toggleTone = t => {
    if (brand.tone.includes(t)) setBrand({...brand, tone: brand.tone.filter(x=>x!==t)})
    else if (brand.tone.length < 3) setBrand({...brand, tone: [...brand.tone, t]})
    else toast.error('Max 3 tones')
  }
  const togglePlatform = p => setCampaign({...campaign, platforms: campaign.platforms.includes(p) ? campaign.platforms.filter(x=>x!==p) : [...campaign.platforms, p]})

  const handleBrand = async () => {
    if (!brand.name.trim()) return toast.error('Brand name required')
    setLoading(true)
    try {
      const r = await createBrand(brand)
      setBrands(prev=>[...prev, r.data])
      setCampaign(prev=>({...prev, brand_id: r.data.id}))
      toast.success('Brand created!')
      setStep(2)
    } catch { toast.error('Failed to create brand') }
    setLoading(false)
  }

  const handleCampaign = async () => {
    if (!campaign.name.trim()) return toast.error('Campaign name required')
    if (!campaign.goal) return toast.error('Select a goal')
    if (!campaign.brand_id) return toast.error('Select a brand first')
    setLoading(true)
    try {
      const r = await createCampaign(campaign)
      setCreated(r.data)
      setAiVal(r.data.ai_validation || '')
      setActiveCampaign && setActiveCampaign(r.data)
      listCampaigns().then(lr => setCampaigns && setCampaigns(lr.data)).catch(()=>{})
      toast.success('Campaign created!')
      setStep(3)
    } catch { toast.error('Failed to create campaign') }
    setLoading(false)
  }

  const reset = () => {
    setBrand({ name:'', industry:'', target_audience:{ age:'', interests:[], pain_points:[] }, tone:[], keywords_include:[], keywords_avoid:[] })
    setCampaign({ brand_id:null, name:'', goal:'', duration:'', platforms:[] })
    setAiVal(''); setCreated(null); setStep(1)
  }

  const stepState = i => step > i ? 'done' : step === i ? 'active' : 'pending'
  const steps = ['Brand Context','Campaign Setup','AI Validation']

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <Briefcase size={16} color="#2563eb" />
        <span style={{ fontSize:'12px', fontWeight:700, color:'#2563eb', textTransform:'uppercase', letterSpacing:'0.08em' }}>Module 1</span>
      </div>
      <h1 className="page-title">Brand & Campaign Setup</h1>
      <p className="page-sub">Define brand context — every AI output will respect your tone and keywords</p>

      {/* Steps */}
      <div className="steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="step-item">
              <div className={`step-circle ${stepState(i+1)}`}>
                {step > i+1 ? <CheckCircle size={14}/> : i+1}
              </div>
              <span className={`step-label ${stepState(i+1)}`}>{s}</span>
            </div>
            {i < 2 && <div className={`step-line ${step > i+1 ? 'done' : ''}`}/>}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card fade-in">
          <div className="card-header">
            <span style={{ fontWeight:700, color:'#111827' }}>Brand Information</span>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div>
                <label className="form-label">Brand Name *</label>
                <input className="form-input" placeholder="e.g. Acme Corp" value={brand.name} onChange={e=>setBrand({...brand, name:e.target.value})} />
              </div>
              <div>
                <label className="form-label">Industry</label>
                <input className="form-input" placeholder="e.g. SaaS, Healthcare" value={brand.industry} onChange={e=>setBrand({...brand, industry:e.target.value})} />
              </div>
            </div>
            <div>
              <label className="form-label">Target Audience Age Range</label>
              <input className="form-input" placeholder="e.g. 25–40" value={brand.target_audience.age} onChange={e=>setBrand({...brand, target_audience:{...brand.target_audience, age:e.target.value}})} />
            </div>
            <div>
              <label className="form-label">Interests (comma separated)</label>
              <input className="form-input" placeholder="e.g. technology, startups, productivity" onChange={e=>setBrand({...brand, target_audience:{...brand.target_audience, interests:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div>
              <label className="form-label">Pain Points (comma separated)</label>
              <input className="form-input" placeholder="e.g. high costs, tool overload" onChange={e=>setBrand({...brand, target_audience:{...brand.target_audience, pain_points:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}})} />
            </div>
            <div>
              <label className="form-label">Brand Tone — pick up to 3</label>
              <div className="chip-group">
                {TONES.map(t => <button key={t} className={`chip ${brand.tone.includes(t)?'active':''}`} onClick={()=>toggleTone(t)}>{t}</button>)}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div>
                <label className="form-label">Keywords to Always Include</label>
                <input className="form-input" placeholder="e.g. innovation, results" onChange={e=>setBrand({...brand, keywords_include:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
              </div>
              <div>
                <label className="form-label">Words to Always Avoid</label>
                <input className="form-input" placeholder="e.g. cheap, basic" onChange={e=>setBrand({...brand, keywords_avoid:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
              </div>
            </div>
            {brands.length > 0 && (
              <div style={{ paddingTop:'12px', borderTop:'1.5px solid #f3f4f6' }}>
                <label className="form-label">Or use existing brand:</label>
                <div className="chip-group">
                  {brands.map(b=>(
                    <button key={b.id} className="chip" onClick={()=>{ setCampaign(p=>({...p, brand_id:b.id})); setStep(2) }}>{b.name}</button>
                  ))}
                </div>
              </div>
            )}
            <button className="btn btn-primary btn-full btn-lg" onClick={handleBrand} disabled={loading}>
              {loading ? <><span className="loading-spinner"/>&nbsp;Creating...</> : 'Save Brand & Continue →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="card fade-in">
          <div className="card-header">
            <span style={{ fontWeight:700, color:'#111827' }}>Campaign Setup</span>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div>
                <label className="form-label">Campaign Name *</label>
                <input className="form-input" placeholder="e.g. Q1 Product Launch" value={campaign.name} onChange={e=>setCampaign({...campaign, name:e.target.value})} />
              </div>
              <div>
                <label className="form-label">Duration</label>
                <input className="form-input" placeholder="e.g. 4 weeks / Jan–Feb" value={campaign.duration} onChange={e=>setCampaign({...campaign, duration:e.target.value})} />
              </div>
            </div>
            <div>
              <label className="form-label">Campaign Goal *</label>
              <div className="chip-group">
                {GOALS.map(g=><button key={g} className={`chip ${campaign.goal===g?'active':''}`} onClick={()=>setCampaign({...campaign, goal:g})}>{g}</button>)}
              </div>
            </div>
            <div>
              <label className="form-label">Target Platforms</label>
              <div className="chip-group">
                {PLATFORMS.map(p=><button key={p} className={`chip ${campaign.platforms.includes(p)?'active':''}`} onClick={()=>togglePlatform(p)}>{p}</button>)}
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleCampaign} disabled={loading}>
                {loading ? <><span className="loading-spinner"/>&nbsp;AI is validating...</> : 'Create Campaign & Validate with AI →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="card fade-in">
          <div className="card-header">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontWeight:700, color:'#111827' }}>Campaign Created Successfully!</span>
            </div>
          </div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {created && (
              <div className="success-box">
                <div style={{ fontWeight:700, marginBottom:'2px' }}>{created.name}</div>
                <div style={{ fontSize:'12px', opacity:0.8 }}>{created.goal} · {created.platforms?.join(', ')}</div>
              </div>
            )}
            {aiVal && (
              <div className="ai-box">
                <div className="ai-box-title">🤖 AI Validation Feedback</div>
                <div className="ai-box-text">{aiVal}</div>
              </div>
            )}
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-outline" onClick={reset}><Plus size={14}/> New Brand</button>
              <a href="/content" className="btn btn-primary" style={{ flex:1, justifyContent:'center', textDecoration:'none' }}>Go to Content Hub →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
