import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import MainLayout from './Layouts/MainLayout/MainLayout'
import { useContext } from 'react'
import { AppContext } from './Context/AppContext'
import Home from './Pages/Home/Home'
import { pathAuth, pathRoutersProduct, pathUtil } from './Constants/path'

import Login from './Pages/Auth/Login/Login'
import { RoleUser } from './Constants/enum'
import ProductGeneral from './Pages/Product/ProductGeneral'

const useRouterElements = () => {
  const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: number[] }) => {
    const { isAuthenticated, profile } = useContext(AppContext)
    const rule = profile?.role as number[]

    if (!isAuthenticated) {
      return <Navigate to='/login' />
    }
    if (allowedRoles && rule && !allowedRoles.some((role) => rule.includes(role))) {
      return <Navigate to='/404' />
    }

    return <Outlet />
  }

  const RejectedRoute = () => {
    const { isAuthenticated } = useContext(AppContext)
    return !isAuthenticated ? <Outlet /> : <Navigate to={pathUtil.home} />
  }

  const routeElemnts = useRoutes([
    {
      path: pathUtil.none,
      element: (
        <ProtectedRoute
          allowedRoles={[RoleUser.ADMIN, RoleUser.USER, RoleUser.ACCOUNTANT, RoleUser.MANAGER, RoleUser.SALE]}
        />
      ),
      children: [
        {
          path: pathUtil.home,
          element: (
            <MainLayout>
              <Home />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute allowedRoles={[RoleUser.ADMIN, RoleUser.ACCOUNTANT, RoleUser.MANAGER, RoleUser.SALE]} />,
      children: [
        {
          path: pathRoutersProduct.productGeneral,
          element: (
            <MainLayout>
              <ProductGeneral />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <RejectedRoute />,
      children: [
        {
          path: pathAuth.login,
          element: <Login />
        }
      ]
    }
  ])
  return routeElemnts
}

export default useRouterElements
