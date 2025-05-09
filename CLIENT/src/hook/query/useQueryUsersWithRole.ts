import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { RoleUser } from 'src/Constants/enum'
import userApi from 'src/Service/user/user.api'
import { UserWithRole } from 'src/Types/user/user.type'

const STALETIME = 5 * 60 * 1000

const useQueryUsersWithRole = (role?: RoleUser) => {
  const [userSWithRole, setUserSWithRole] = useState<UserWithRole[]>([])
  const { data, isLoading } = useQuery({
    queryKey: ['getAllUserSWithRole'],
    queryFn: () => userApi.getUsersWithRole(role),
    staleTime: STALETIME
  })

  useEffect(() => {
    if (data) {
      const result = data.data.result
      setUserSWithRole(result)
    }
  }, [data])
  return {
    userSWithRole,
    isLoading
  }
}

export default useQueryUsersWithRole
