import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import MainLayout from './Layouts/MainLayout/MainLayout'
import { useContext } from 'react'
import { AppContext } from './Context/AppContext'
import Home from './Pages/Home/Home'
import { pathAuth, pathMe, pathUtil } from './Constants/path'
import Profile from './Pages/Profile/Profile'

const useRouterElements = () => {
  const ProtectedRoute = () => {
    const { isAuthenticated } = useContext(AppContext)
    return isAuthenticated ? <Outlet /> : <Navigate to={pathAuth.login} />
  }

  // const RejectedRoute = () => {
  //   const { isAuthenticated } = useContext(AppContext)
  //   return !isAuthenticated ? <Outlet /> : <Navigate to={pathUtil.home} />
  // }

  const routeElemnts = useRoutes([
    {
      path: pathUtil.home,
      element: (
        <MainLayout>
          <Home />
        </MainLayout>
      )
    },
    {
      path: pathUtil.none,
      element: <ProtectedRoute />,
      children: [
        {
          path: pathMe.profile,
          element: (
            <MainLayout>
              <Profile />
            </MainLayout>
          )
        }
      ]
    }
  ])
  return routeElemnts
}

export default useRouterElements
