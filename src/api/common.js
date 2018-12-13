import api from '@/api'

export const dashboard = async function () {
  return (await api.get('/util/dashboard')).data
}
export const saveHistory = async function (params) {
  return (await api.post('/util/history', params)).data
}