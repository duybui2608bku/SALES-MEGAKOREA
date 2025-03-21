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
  categoryService: '/category-service'
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
  getAllCategoryService: '/services/category-all',
  createCategoryService: 'services/category-create',
  updateCategoryService: 'services/category-update',
  deleteCategoryService: 'services/category-delete'
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
  pathServices
}
