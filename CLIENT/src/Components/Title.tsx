import { Flex, Typography } from 'antd'
const DEFAULT_LEVEL = 4

interface TitleProps {
  title: string
  level?: 1 | 2 | 3 | 4 | 5
  justify?: 'left' | 'center' | 'right'
}

const Title = ({ title, level = DEFAULT_LEVEL, justify }: TitleProps) => {
  return (
    <Flex
      justify={justify || 'center'}
      style={{
        width: '100%'
      }}
    >
      <Typography.Title level={level}>{title}</Typography.Title>
    </Flex>
  )
}

export default Title
