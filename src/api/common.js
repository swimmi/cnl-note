import api from '@/api'

export const dashboard = async function () {
  return (await api.get('/util/dashboard')).data
}
export const saveHistory = async function (params) {
  return (await api.post('/util/history', params)).data
}
export const pairText = async function (params) {
  return (await api.post('/util/pairtext', params)).data
}
export const getItemCount = async function (params) {
  return (await api.post('/util/item/count', params)).data
}