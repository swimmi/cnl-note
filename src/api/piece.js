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
export const savePieceHistory = async function (params) {
  return (await api.post('/piece/history/save', params)).data
}
export const recordPiece = async function (params) {
  return (await api.post('/upload', params)).data
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
export const getAuthorPieces = async function (params) {
  return (await api.post('/piece/author', params)).data
}
export const getCategoryPieces = async function (params) {
  return (await api.post('/piece/category', params)).data
}
export const getRecentPieces = async function (params) {
  return (await api.post('/piece/recent', params)).data
}

