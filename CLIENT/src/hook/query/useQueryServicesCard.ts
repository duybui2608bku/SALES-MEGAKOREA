import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ServicesType } from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'

const LIMIT = 1000
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const useQueryServices = () => {
  const [services, setServices] = useState<ServicesType[]>([])
  const { data, isLoading } = useQuery({
    queryKey: ['getAllServices'],
    queryFn: () => servicesApi.getAllServices({ limit: LIMIT, page: PAGE }),
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const result = data.data.result.services
      setServices(result)
    }
  }, [data])
  return {
    services,
    isLoading
  }
}

export default useQueryServices
