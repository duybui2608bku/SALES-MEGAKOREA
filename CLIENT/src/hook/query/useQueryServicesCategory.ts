import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ServicesCategoryType } from 'src/Interfaces/services/services.interfaces'

import { servicesApi } from 'src/Service/services/services.api'

const LIMIT = 1000
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const useQueryServicesCategory = () => {
  const [categoryServices, setCategoryServices] = useState<ServicesCategoryType[]>([])
  const { data, isLoading } = useQuery({
    queryKey: ['getAllCategoryServices'],
    queryFn: () => servicesApi.getAllServicesCategory({ limit: LIMIT, page: PAGE }),
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const result = data.data.result.categoryServices
      setCategoryServices(result)
    }
  }, [data])
  return {
    categoryServices,
    isLoading
  }
}

export default useQueryServicesCategory
