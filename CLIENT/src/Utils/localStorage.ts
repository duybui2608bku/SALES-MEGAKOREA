import { User } from 'src/Interfaces/user.interface'

export const saveAccessTokenToLS = (access_token: string) => {
  return localStorage.setItem('access_token', access_token)
}

export const LocalStorageEventTarget = new EventTarget()

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('profile')
  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessTokenFormLS = () => {
  return localStorage.getItem('access_token') || ''
}

export const getProfileFromLS = () => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}

export const setProfileFromLS = (profile: User) => {
  return localStorage.setItem('profile', JSON.stringify(profile))
}
