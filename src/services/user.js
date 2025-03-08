import axiosInstance from './header'

const userServices = axiosInstance.get('/users/authUser')

export default userServices
