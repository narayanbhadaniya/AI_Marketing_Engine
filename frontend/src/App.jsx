import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BrandSetup from './pages/BrandSetup'
import ContentHub from './pages/ContentHub'
import RepurposeEngine from './pages/RepurposeEngine'
import AdCopyAB from './pages/AdCopyAB'
import SentimentIntelligence from './pages/SentimentIntelligence'
import ContentCalendar from './pages/ContentCalendar'
import CompetitorAnalysis from './pages/CompetitorAnalysis'
import { listCampaigns } from './lib/api'

export default function App() {
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    listCampaigns().then(r => {
      setCampaigns(r.data)
      if (r.data.length > 0) setActiveCampaign(r.data[r.data.length - 1])
    }).catch(() => {})
  }, [])

  const handleSetCampaign = (c) => {
    setActiveCampaign(c)
    // refresh campaign list
    listCampaigns().then(r => setCampaigns(r.data)).catch(() => {})
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar activeCampaign={activeCampaign} setActiveCampaign={setActiveCampaign} campaigns={campaigns} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard setActiveCampaign={handleSetCampaign} activeCampaign={activeCampaign} campaigns={campaigns} setCampaigns={setCampaigns} />} />
          <Route path="/brand" element={<BrandSetup setActiveCampaign={handleSetCampaign} setCampaigns={setCampaigns} />} />
          <Route path="/content" element={<ContentHub activeCampaign={activeCampaign} />} />
          <Route path="/repurpose" element={<RepurposeEngine activeCampaign={activeCampaign} />} />
          <Route path="/adcopy" element={<AdCopyAB activeCampaign={activeCampaign} />} />
          <Route path="/sentiment" element={<SentimentIntelligence activeCampaign={activeCampaign} />} />
          <Route path="/calendar" element={<ContentCalendar activeCampaign={activeCampaign} />} />
          <Route path="/competitor" element={<CompetitorAnalysis activeCampaign={activeCampaign} />} />
        </Routes>
      </div>
    </div>
  )
}
