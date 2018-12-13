import api from '@/api'

// 操作类
export const addPiece = async function (params) {
  return (await api.post('/piece/add', params)).data
}
export const updatePiece = async function (params) {
  return (await api.post("/piece/update", params)).data
}
export const updatePieceContent = async function (params) {
  return (await api.post('/piece/content/update', params)).data
}
export const updatePieceRelate = async function (params) {
  return (await api.post('/piece/relate/update', params)).data
}
export const historyPiece = async function (params) {
  return (await api.post('/piece/history', params)).data
}
export const addBookmark = async function (params) {
  return (await api.post('piece/bookmark/add', params)).data
}
export const removeBookmark = async function (params) {
  return (await api.post('piece/bookmark/remove', params)).data
}
export const recordPieceView = async function (params) {
  return (await api.post('/piece/view/record', params)).data
}
// 查询类
export const getPiece = async function (params) {
  return (await api.post('/piece/get', params)).data
}
export const allPiece = async function () {
  return (await api.get('/piece/all')).data
}
export const searchPiece = async function (params) {
  return (await api.post('/piece/search', params)).data
}
export const getPieceContent = async function (params) {
  return (await api.post('/piece/content/get', params)).data
}
export const getPieceRandom = async function (params) {
  return (await api.post('/piece/random', params)).data
}
export const getPieceRecent = async function (params) {
  return (await api.post('/piece/recent', params)).data
}

