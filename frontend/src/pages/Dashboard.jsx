import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBrands, listCampaigns, deleteCampaign } from '../lib/api'
import { Sparkles, Briefcase, Target, BarChart2, ArrowRight, Zap, RefreshCw, CalendarDays, Swords, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const modules = [
  { label: 'Brand & Campaign', to: '/brand', icon: Briefcase, desc: 'Set up brand voice, tones & campaign goals', color: '#2563eb' },
  { label: 'Content Hub', to: '/content', icon: Sparkles, desc: 'Generate 8 content formats from one brief', color: '#7c3aed' },
  { label: 'Repurpose Engine', to: '/repurpose', icon: RefreshCw, desc: 'Turn blogs & podcasts into all formats', color: '#0891b2' },
  { label: 'Ad Copy A/B', to: '/adcopy', icon: Target, desc: '5 ad variants, compare & find winners', color: '#d97706' },
  { label: 'Sentiment AI', to: '/sentiment', icon: BarChart2, desc: 'Analyse customer reviews at scale', color: '#059669' },
  { label: 'Content Calendar', to: '/calendar', icon: CalendarDays, desc: 'Schedule & manage all content', color: '#db2777' },
  { label: 'Competitor Analysis', to: '/competitor', icon: Swords, desc: 'Counter competitor campaigns with AI', color: '#dc2626' },
]

export default function Dashboard({ setActiveCampaign, activeCampaign, campaigns, setCampaigns }) {
  const [brands, setBrands] = useState([])

  useEffect(() => {
    listBrands().then(r => setBrands(r.data)).catch(() => {})
  }, [])

  const handleDelete = async (id, e) => {
    e.preventDefault()
    if (!confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)
      const updated = campaigns.filter(c => c.id !== id)
      setCampaigns(updated)
      if (activeCampaign?.id === id) setActiveCampaign(updated[0] || null)
      toast.success('Campaign deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Marketing Engine</span>
          </div>
          <h1 className="page-title">Marketing Dashboard</h1>
          <p className="page-sub">Your AI-powered workspace — all 6 modules in one place</p>
        </div>
        <Link to="/brand" className="btn btn-primary btn-lg">
          <Zap size={16} /> New Campaign
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '36px' }}>
        {[
          { n: brands.length, label: 'Brands', sub: 'configured', icon: Briefcase, color: '#2563eb' },
          { n: campaigns.length, label: 'Campaigns', sub: 'created', icon: Target, color: '#7c3aed' },
          { n: campaigns.length * 14, label: 'AI Outputs', sub: 'generated', icon: Sparkles, color: '#059669' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${s.color}12`, border: `1.5px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div className="stat-number" style={{ color: s.color }}>{s.n}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active campaign banner */}
      {activeCampaign && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '18px 22px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>Active Campaign</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af' }}>{activeCampaign.name}</div>
            <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
              {activeCampaign.goal} · {activeCampaign.platforms?.join(', ')} · {activeCampaign.duration}
            </div>
          </div>
          <Link to="/content" className="btn btn-primary">
            Generate Content <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Modules grid */}
      <div style={{ marginBottom: '16px' }}>
        <div className="section-label">All Modules</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '40px' }}>
        {modules.map(({ label, to, icon: Icon, desc, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${color}10`, border: `1.5px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{desc}</div>
              </div>
              <ArrowRight size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent campaigns */}
      {campaigns.length > 0 && (
        <div>
          <div className="section-label">Recent Campaigns</div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Goal</th>
                    <th>Platforms</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice().reverse().map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{c.name}</td>
                      <td><span className="badge badge-blue">{c.goal}</span></td>
                      <td style={{ color: '#6b7280' }}>{c.platforms?.join(', ')}</td>
                      <td style={{ color: '#6b7280' }}>{c.duration || '—'}</td>
                      <td>
                        <button onClick={() => setActiveCampaign(c)}
                          className={`btn btn-sm ${activeCampaign?.id === c.id ? 'btn-primary' : 'btn-outline'}`}>
                          {activeCampaign?.id === c.id ? '✓ Active' : 'Set Active'}
                        </button>
                      </td>
                      <td>
                        <button onClick={(e) => handleDelete(c.id, e)} className="btn btn-sm btn-danger">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Zap size={24} color="#2563eb" /></div>
            <div className="empty-title">No campaigns yet</div>
            <div className="empty-sub">Start by setting up your brand and creating your first campaign</div>
            <Link to="/brand" className="btn btn-primary">Get Started →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
