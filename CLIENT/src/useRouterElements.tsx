import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import MainLayout from './Layouts/MainLayout/MainLayout'
import { useContext } from 'react'
import { AppContext } from './Context/AppContext'
import Home from './Pages/Home/Home'
import {
  pathAuth,
  pathRoutersProduct,
  pathRoutersService,
  pathRoutersUser,
  pathRoutesCustomers,
  pathUtil
} from './Constants/path'

import Login from './Pages/Auth/Login/Login'
import { RoleUser } from './Constants/enum'
import ProductGeneral from './Pages/Product/ProductGeneral'
import CategoryService from './Pages/Services/Category.service'
import Service from './Pages/Services/Services.service'
import ServicesCard from './Pages/Services/Services.card.service'
import UserGeneral from './Pages/User/UserGeneral'
import Customers from './Pages/customer/customers'
import UserInformation from './Pages/User/UserInformation'
import SellServicesCardService from './Pages/Services/SellServices.card.service'
import SoldServicesCardService from './Pages/Services/SoldServices.card.service'

import StepService from './Pages/Services/Step.service'
import UserCommisionSale from './Pages/User/UserCommisionSale'
import UserCommisionTechnican from './Pages/User/UserommisionTechnican'
import NotFoundPage from './Pages/404/404'
import UserQuantityRequest from './Pages/Services/QuantityRequests/UserQuantityRequests'
import AdminQuantityRequest from './Pages/Services/QuantityRequests/AdminQuantityRequests'
import AdminRefundRequest from './Pages/Services/RefundRequests/AdminRefundRequests'
import UserRefundRequest from './Pages/Services/RefundRequests/UserRefundRequests'

const useRouterElements = () => {
  const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: number[] }) => {
    const { isAuthenticated, profile } = useContext(AppContext)
    const rule = profile?.role as number

    if (!isAuthenticated) {
      return <Navigate to='/login' />
    }

    if (allowedRoles !== undefined && rule && !allowedRoles.includes(rule)) {
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
      element: <ProtectedRoute />,
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
      element: (
        <ProtectedRoute
          allowedRoles={[
            RoleUser.USER,
            RoleUser.ACCOUNTANT,
            RoleUser.MANAGER,
            RoleUser.SALE,
            RoleUser.TECHNICIAN,
            RoleUser.TECHNICAN_MASTER
          ]}
        />
      ),
      children: [
        {
          path: pathUtil.notFound,
          element: <NotFoundPage />
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
      element: (
        <ProtectedRoute
          allowedRoles={[RoleUser.ADMIN, RoleUser.ACCOUNTANT, RoleUser.MANAGER, RoleUser.SALE, RoleUser.TECHNICIAN]}
        />
      ),
      children: [
        {
          path: pathRoutersService.categoryService,
          element: (
            <MainLayout>
              <CategoryService />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.service,
          element: (
            <MainLayout>
              <Service />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.stepService,
          element: (
            <MainLayout>
              <StepService />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.cardService,
          element: (
            <MainLayout>
              <ServicesCard />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.sellCardService,
          element: (
            <MainLayout>
              <SellServicesCardService />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.soldCardService,
          element: (
            <MainLayout>
              <SoldServicesCardService />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.userQuantityRequests,
          element: (
            <MainLayout>
              <UserQuantityRequest />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.userRefundRequests,
          element: (
            <MainLayout>
              <UserRefundRequest />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute allowedRoles={[RoleUser.ADMIN, RoleUser.MANAGER]} />,
      children: [
        {
          path: pathRoutersService.adminQuantityRequests,
          element: (
            <MainLayout>
              <AdminQuantityRequest />
            </MainLayout>
          )
        },
        {
          path: pathRoutersService.adminRefundRequests,
          element: (
            <MainLayout>
              <AdminRefundRequest />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute allowedRoles={[RoleUser.ADMIN]} />,
      children: [
        {
          path: pathRoutersUser.userGeneral,
          element: (
            <MainLayout>
              <UserGeneral />
            </MainLayout>
          )
        },
        {
          path: pathRoutersUser.userCommisionTechnican,
          element: (
            <MainLayout>
              <UserCommisionTechnican />
            </MainLayout>
          )
        },
        {
          path: pathRoutersUser.userCommisionSale,
          element: (
            <MainLayout>
              <UserCommisionSale />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute />,
      children: [
        {
          path: pathRoutesCustomers.customers,
          element: (
            <MainLayout>
              <Customers />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute />,
      children: [
        {
          path: pathRoutersUser.userInformation,
          element: (
            <MainLayout>
              <UserInformation />
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
