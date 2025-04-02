const pathAuth = {
  login: '/login',
  register: '/register'
}

const pathUtil = {
  home: '/',
  notFound: '/404',
  none: ''
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
  cardService: '/card-service'
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
  getAllServicesCard: '/services-card/all',
  updateServicesCard: '/services-card/update',
  createServicesCard: '/services-card/create',
  updateHistoryPaid: '/services-card/update-paid',
  getAllCategoryService: '/services/category-all',
  createCategoryService: 'services/category-create',
  updateCategoryService: 'services/category-update',
  deleteCategoryService: 'services/category-delete'
}

const pathApiUsers = {
  getAllUsersWithRole: '/users/with-role'
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
  pathApiUsers
}
