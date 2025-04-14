import { Col, Typography } from 'antd'
const { Text, Paragraph } = Typography

type ValueInforProps = {
  title: string
  value: string
}

const ShowInforUserComponent = ({ title, value }: ValueInforProps) => {
  return (
    <Col span={11}>
      <Text>{title}</Text>
      <Paragraph
        style={{
          color: 'rgba(0,0,0,50%)',
          fontSize: '13px',
          backgroundColor: '#ffffff',
          padding: '15px 18px',
          marginTop: '10px',
          borderRadius: '8px'
        }}
      >
        {value}
      </Paragraph>
    </Col>
  )
}

export default ShowInforUserComponent
