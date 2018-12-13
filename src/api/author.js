import api from '@/api'
// 操作类
export const addAuthor =  async function (params) {
  await api.post('/author/add', params)
}
export const updateAuthor = async function (params) {
  await api.post('/author/update', params)
}
// 查询类
export const getAuthor = async function (params) {
  return (await api.post('/author/get', params)).data
}
export const getAuthorByDynasty = async function (params) {
  return (await api.post('/author/dynasty', params)).data
}
export const allAuthor = async function () {
  return (await api.get('/author/all')).data
}

