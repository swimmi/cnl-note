import api from '@/api'
// 操作类
export const addBook =  async function (params) {
  return (await api.post('/book/add', params)).data
}
export const updateBook = async function (params) {
  return (await api.post('/book/update', params)).data
}
export const getCatalog = async function (params) {
  return (await api.post('/book/catalog/get', params)).data
}
export const updateCatalog = async function (params) {
  return (await api.post('/book/catalog/update', params)).data
}
export const addBookmark = async function (params) {
  return (await api.post('/book/bookmark/add', params)).data
}
export const removeBookmark = async function (params) {
  return (await api.post('/book/bookmark/remove', params)).data
}
export const saveBookHistory = async function (params) {
  return (await api.post('/book/history/save', params)).data
}
// 查询类
export const getBook = async function (params) {
  return (await api.post('/book/get', params)).data
}
export const allBook = async function () {
  return (await api.get('/book/all')).data
}
export const searchBook = async function (params) {
  return (await api.post('/book/search', params)).data
}
export const getBookContent = async function (params) {
  return (await api.post('/book/content', params)).data
}
export const getAuthorBooks = async function (params) {
  return (await api.post('/book/author', params)).data
}
export const getCategoryBooks = async function (params) {
  return (await api.post('/book/category', params)).data
}
export const getRecentBooks = async function (params) {
  return (await api.post('/book/recent', params)).data
}