import { createContext, useState } from 'react'
import { User } from 'src/Interfaces/user.interface'
import { getAccessTokenFormLS, getProfileFromLS } from 'src/Utils/localStorage'

interface AppContext {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  isProductsDetail: boolean
  setIsProductsDetail: React.Dispatch<React.SetStateAction<boolean>>
  reset: () => void
}

const initialAppContext: AppContext = {
  isAuthenticated: Boolean(getAccessTokenFormLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  isProductsDetail: false,
  setIsProductsDetail: () => null,
  reset: () => null
}

export const AppContext = createContext<AppContext>(initialAppContext)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAppContext.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(initialAppContext.profile)
  const [isProductsDetail, setIsProductsDetail] = useState<boolean>(initialAppContext.isProductsDetail)
  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
    setIsProductsDetail(false)
  }
  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        isProductsDetail,
        setIsProductsDetail,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
