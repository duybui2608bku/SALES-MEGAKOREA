import { Col, Modal, Row, Typography } from 'antd'
import { useContext } from 'react'
import Title from 'src/Components/Title'
import { AppContext } from 'src/Context/AppContext'
import { clearLS } from 'src/Utils/localStorage'

const { Text } = Typography

interface ModalLogoutProps {
  open: boolean
  onClose: (value: boolean) => void
}

const ModalLogout = (props: ModalLogoutProps) => {
  const { open, onClose } = props
  const { reset } = useContext(AppContext)

  const handleLogout = () => {
    reset()
    clearLS()
  }

  const handleCancel = () => {
    onClose(false)
  }

  return (
    <Modal
      className='modal-logout'
      onOk={handleLogout}
      centered
      open={open}
      onCancel={handleCancel}
      okButtonProps={{ style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } }}
      okText='Đăng xuất'
      cancelText='Huỷ'
    >
      {Title({ title: 'Đăng xuất', level: 4 })}
      <Row style={{ margin: '10px 0 20px' }}>
        <Col span={24}>
          <Text className='center-div'>Bạn có chắc chắn muốn đăng xuất không?</Text>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalLogout
