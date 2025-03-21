import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import branchApi from 'src/Service/branch/branch.api'

const useQueryBranch = () => {
  const [branchList, setBranchList] = useState<BranchType[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['getAllBranch'],
    queryFn: branchApi.getAllBranch,
    staleTime: 100 * 1000 * 60
  })

  useEffect(() => {
    if (data) {
      setBranchList(data.data.result)
    }
  }, [data])
  return { branchList, isLoading }
}

export default useQueryBranch
