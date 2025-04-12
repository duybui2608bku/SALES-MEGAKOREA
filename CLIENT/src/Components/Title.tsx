import { Flex, Typography } from 'antd'
const DEFAULT_LEVEL = 4

const Title = ({ title, level = DEFAULT_LEVEL }: { title: string; level?: 1 | 2 | 3 | 4 | 5 }) => {
  return (
    <Flex justify='center'>
      <Typography.Title level={level}>{title}</Typography.Title>
    </Flex>
  )
}

export default Title
