import React, { useState } from 'react'
import { Button, Space, message } from 'antd'
import { PlusOutlined, HistoryOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ModalRequestQuantity from 'src/Modal/services/ModalRequestQuantity'

interface ServiceDetailActionsProps {
  serviceId: string
  showRequestButton?: boolean
}

const ServiceDetailActions: React.FC<ServiceDetailActionsProps> = ({ serviceId, showRequestButton = true }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const navigate = useNavigate()

  const handleOpenModal = () => {
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
  }

  const handleSuccess = () => {
    message.success('Yêu cầu tăng số lần đã được gửi thành công!')
    navigate('/services/quantity-requests/user')
  }

  const viewMyRequests = () => {
    navigate('/services/quantity-requests/user')
  }

  return (
    <>
      <Space>
        {showRequestButton && (
          <Button type='primary' icon={<PlusOutlined />} onClick={handleOpenModal}>
            Yêu cầu tăng số lần
          </Button>
        )}
        <Button icon={<HistoryOutlined />} onClick={viewMyRequests}>
          Yêu cầu của tôi
        </Button>
      </Space>

      <ModalRequestQuantity
        isOpen={modalVisible}
        onClose={handleCloseModal}
        serviceId={serviceId}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ServiceDetailActions
