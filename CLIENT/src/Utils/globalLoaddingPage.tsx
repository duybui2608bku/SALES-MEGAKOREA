import { useIsFetching } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
// import { RingLoader } from 'react-spinners'
import LoaderComponent from 'src/Components/GlobalLoadingPageComponent'

const GlobalLoadingPage = () => {
  const isFetching = useIsFetching()
  const [showSpiner, setShowSpinner] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined

    if (isFetching) {
      timeout = setTimeout(() => setShowSpinner(true), 200)
    } else {
      setShowSpinner(false)
      if (timeout) clearTimeout(timeout)
    }

    return () => clearTimeout(timeout)
  }, [isFetching])

  return showSpiner ? (
    <div className='global-spinner'>
      <LoaderComponent />
    </div>
  ) : null
}

export default GlobalLoadingPage
