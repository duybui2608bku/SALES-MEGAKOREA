const pathAuth = {
  login: '/login',
  register: '/register'
}

const pathUtil = {
  home: '/',
  notFound: '/404',
  none: '',
  admin: '/admin'
}

const pathMe = {
  profile: '/profile'
}

const pathApi = {
  login: '/users/login'
}

const pathRoutersProduct = {
  productGeneral: '/product-general'
}

const pathRoutersService = {
  categoryService: '/category-service',
  service: '/service',
  cardService: '/card-service',
  sellCardService: '/card-service-sell',
  soldCardService: '/card-service-sold',
  stepService: '/step-service',
  userQuantityRequests: '/services/quantity-requests/user',
  adminQuantityRequests: '/services/quantity-requests/admin',
  userRefundRequests: '/services/refund-requests/user',
  adminRefundRequests: '/services/refund-requests/admin'
}

const pathRoutersUser = {
  userGeneral: '/user-general',
  userInformation: '/user-information',
  userCommisionTechnican: '/user-commision-technican',
  userCommisionSale: '/user-commision-sale'
}

const pathApiProduct = {
  createProduct: '/products',
  getAllProduct: '/products',
  deleteProduct: '/products',
  updateProduct: '/products',
  searchProduct: '/products/search',
  importProduct: '/products/import',
  updateProductStock: '/products/update/stock'
}

const pathApiUsers = {
  getUser: '/users/me',
  getAllUser: '/users/all',
  getAllUsersWithRole: '/users/with-role',
  updateUser: '/users/update',
  createUser: '/users/register',
  deleteUserById: '/users'
}

const pathApiUploadAvatarUser = {
  uploadAvatar: '/upload/image'
}

const pathApiBranch = {
  createBranch: '/branch/create',
  getAllBranch: '/branch/all',
  deleteBranch: '/branch',
  updateBranch: '/branch'
}

const pathServices = {
  getAllServices: '/services/all',
  createServices: '/services/detail-create',
  deleteServices: '/services/detail-delete',
  updateServices: '/services/detail-update',
  getAllStepService: '/services/step/all',
  createStepService: 'services/step/create',
  updateStepService: 'services/step/update',
  deleteStepService: 'services/step/delete',
  getAllServicesCard: '/services-card/all',
  updateServicesCard: '/services-card/update',
  createServicesCard: '/services-card/create',
  updateHistoryPaid: '/services-card/sold-of-customer/paid-history',
  getAllCategoryService: '/services/category-all',
  createCategoryService: 'services/category-create',
  updateCategoryService: 'services/category-update',
  deleteCategoryService: 'services/category-delete',
  createSoldServicesCard: 'services-card/sold/create',
  getAllSoldServicesCardOfCustomer: 'services-card/sold-of-customer',
  createServiceCardSoldOfCustomer: 'services-card/sold-of-customer/create',
  updateServiceCardSoldOfCustomer: 'services-card/sold-of-customer/update',
  updateUsedOfServices: '/services-card/sold/update-used',
  updateQuantityOfServices: '/services-card/sold/update-quantity',
  // Quantity Request
  createQuantityRequest: 'services-quantity/request',
  getUserQuantityRequests: 'services-quantity/user-requests',
  getRequestHistory: '/api/service-quantity/request/:requestId/history',
  getAdminRequests: 'services-quantity/admin/requests',
  getRequestStats: 'services-quantity/admin/stats',
  approveRequest: 'services-quantity/admin/approve',
  rejectRequest: 'services-quantity/admin/reject',
  // Refund Request
  getUserRefundRequests: 'refund/user-requests',
  createRefundRequest: 'refund/request',
  getAdminRefundRequests: 'refund/admin/requests',
  getRequestRefundStats: 'refund/admin/stats',
  approveRefundRequest: 'refund/admin/approve',
  rejectRefundRequest: 'refund/admin/reject'
}

const pathRoutesCustomers = {
  customers: '/customer'
}

const pathApiCustomer = {
  searchCustomer: '/search/by-phone',
  getCustomersSchedule: '/customers/schedule-telesales-success',
  searchCustomerschedule: '/search/by-phone-success-schedule',
  createCustomer: '/customers/create'
}

const pathCommision = {
  createCommisionTechnician: '/commision/technican/create',
  getCommisionTechnican: '/commision/technican/report',
  getCommisionSale: '/commision/seller/report',
  createCommisionSeller: '/commision/seller/create'
}

const pathDashBoard = {
  home: '/'
}

export {
  pathAuth,
  pathUtil,
  pathMe,
  pathApi,
  pathRoutersProduct,
  pathApiProduct,
  pathApiBranch,
  pathRoutersService,
  pathServices,
  pathApiUsers,
  pathRoutersUser,
  pathRoutesCustomers,
  pathApiUploadAvatarUser,
  pathApiCustomer,
  pathCommision,
  pathDashBoard
}
