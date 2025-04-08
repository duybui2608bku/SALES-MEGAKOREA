import { createContext, useState } from 'react'
import { getAccessTokenFormLS, getProfileFromLS } from 'src/Utils/localStorage'
import { notification } from 'antd'
import { NotificationInstance } from 'antd/es/notification/interface'
import { User } from 'src/Interfaces/user/user.interface'
interface AppContext {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  reset: () => void
  notificationApi: NotificationInstance | null
  notificationContextHolder: React.ReactNode
}

const initialAppContext: AppContext = {
  isAuthenticated: Boolean(getAccessTokenFormLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  reset: () => null,
  notificationApi: null,
  notificationContextHolder: null
}

export const AppContext = createContext<AppContext>(initialAppContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
  }
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        reset,
        notificationApi,
        notificationContextHolder
      }}
    >
      {notificationContextHolder}
      {children}
    </AppContext.Provider>
  )
}
