import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Zap, LayoutDashboard, Briefcase, Sparkles, RefreshCw, Target, BarChart2, CalendarDays, Swords, ChevronDown } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/brand', icon: Briefcase, label: 'Brand & Campaign' },
  { to: '/content', icon: Sparkles, label: 'Content Hub' },
  { to: '/repurpose', icon: RefreshCw, label: 'Repurpose' },
  { to: '/adcopy', icon: Target, label: 'Ad Copy A/B' },
  { to: '/sentiment', icon: BarChart2, label: 'Sentiment AI' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/competitor', icon: Swords, label: 'Competitor' },
]

export default function Navbar({ activeCampaign, setActiveCampaign, campaigns }) {
  const [showCampaigns, setShowCampaigns] = useState(false)

  return (
    <nav className="navbar">
      {/* Brand */}
      <NavLink to="/" className="navbar-brand">
        <div className="navbar-logo">
          <Zap size={17} color="#fff" />
        </div>
        <div>
          <div className="navbar-title">MarketingAI</div>
          <div className="navbar-subtitle">Intelligence Engine</div>
        </div>
      </NavLink>

      {/* Nav links */}
      <div className="nav-links">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* Active campaign selector */}
      {campaigns && campaigns.length > 0 && (
        <div style={{ position: 'relative', marginLeft: '12px', flexShrink: 0 }}>
          <button
            onClick={() => setShowCampaigns(!showCampaigns)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
              background: 'var(--blue-50)', border: '1.5px solid var(--blue-200)',
              fontSize: '12px', fontWeight: 600, color: 'var(--blue-700)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeCampaign ? activeCampaign.name : 'Select Campaign'}
            </span>
            <ChevronDown size={12} />
          </button>
          {showCampaigns && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '6px',
              background: '#fff', border: '1.5px solid var(--gray-200)',
              borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              minWidth: '200px', zIndex: 200, overflow: 'hidden',
            }}>
              {campaigns.map(c => (
                <button key={c.id} onClick={() => { setActiveCampaign(c); setShowCampaigns(false) }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                    background: activeCampaign?.id === c.id ? 'var(--blue-50)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: '13px',
                    color: activeCampaign?.id === c.id ? 'var(--blue-700)' : 'var(--gray-700)',
                    fontWeight: activeCampaign?.id === c.id ? 600 : 400,
                    borderBottom: '1px solid var(--gray-100)',
                  }}>
                  {c.name}
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '1px' }}>{c.goal}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
