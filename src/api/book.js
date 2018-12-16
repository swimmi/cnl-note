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
// 查询类
export const getBook = async function (params) {
  return (await api.post('/book/get', params)).data
}
export const allBook = async function () {
  return (await api.get('/book/all')).data
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