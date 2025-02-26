import { useContext, useEffect } from 'react'
import { LocalStorageEventTarget } from './Utils/localStorage'
import { AppContext } from './Context/AppContext'
import useRouterElements from './useRouterElements'
import './Scss/base.scss'
const App = () => {
  const routElemnet = useRouterElements()
  const { reset } = useContext(AppContext)
  useEffect(() => {
    LocalStorageEventTarget.addEventListener('clearLS', reset)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLS', reset)
    }
  }, [reset])
  return (
    <>
      <div>{routElemnet}</div>
    </>
  )
}

export default App
