import axios from 'axios'
const http = axios.create({ baseURL: '/api' })
export const Sessions = {
  create:      (d)    => http.post('/sessions', d).then(r => r.data),
  getAll:      ()     => http.get('/sessions').then(r => r.data),
  logEvent:    (id,e) => http.post(`/sessions/${id}/events`, e).then(r => r.data),
  genFollowUp: (id,b) => http.post(`/followup/${id}/generate`, b).then(r => r.data),
  submitOral:  (id,b) => http.post(`/followup/${id}/submit`, b).then(r => r.data),
}
export const Scores = {
  getAll: () => http.get('/scores').then(r => r.data),
  getOne: (id) => http.get(`/scores/${id}`).then(r => r.data),
}
