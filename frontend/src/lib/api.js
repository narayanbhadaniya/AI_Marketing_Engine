import axios from 'axios'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

export const createBrand = d => api.post('/api/brand/', d)
export const listBrands = () => api.get('/api/brand/')
export const updateBrand = (id, d) => api.put(`/api/brand/${id}`, d)
export const deleteBrand = id => api.delete(`/api/brand/${id}`)

export const createCampaign = d => api.post('/api/campaign/', d)
export const listCampaigns = () => api.get('/api/campaign/')
export const getCampaign = id => api.get(`/api/campaign/${id}`)
export const deleteCampaign = id => api.delete(`/api/campaign/${id}`)

export const generateContent = d => api.post('/api/content/generate', d)
export const refineContent = d => api.post('/api/content/refine', d)
export const getCampaignContent = id => api.get(`/api/content/campaign/${id}`)
export const updateContentStatus = (id, status) => api.put(`/api/content/${id}/status?status=${encodeURIComponent(status)}`)
export const deleteContent = id => api.delete(`/api/content/${id}`)

export const repurposeContent = d => api.post('/api/repurpose/', d)

export const generateAdCopy = d => api.post('/api/adcopy/generate', d)
export const updateVariantStatus = (id, d) => api.put(`/api/adcopy/${id}/status`, d)
export const getAdVariants = id => api.get(`/api/adcopy/campaign/${id}`)
export const exportVariants = id => api.get(`/api/adcopy/export/${id}`)

export const analyzeSentiment = d => api.post('/api/sentiment/analyze', d)
export const uploadCSV = fd => api.post('/api/sentiment/upload-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

export const getCalendar = id => api.get(`/api/calendar/${id}`)
export const scheduleContent = d => api.put('/api/calendar/schedule', d)
export const analyzeCompetitor = d => api.post('/api/calendar/competitor-analysis', d)
