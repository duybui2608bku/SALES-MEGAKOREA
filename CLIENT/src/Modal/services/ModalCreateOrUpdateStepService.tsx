import { Col, Form, Modal, Row } from 'antd'
import Title from 'src/Components/Title'
import { GetStepService } from 'src/Interfaces/services/services.interfaces'

interface ModalCreateOrUpdateStepServiceProps {
  open: boolean
  onClose: (value: boolean) => void
  stepServiceToEdit?: GetStepService | null
  setStepServiceToEdit?: (value: GetStepService | null) => void
}

const ModalCreateOrUpdateStepService = (props: ModalCreateOrUpdateStepServiceProps) => {
  const { open, onClose, stepServiceToEdit, setStepServiceToEdit } = props
  const [form] = Form.useForm()

  const handleCancel = () => {
    onClose(false)
    setStepServiceToEdit?.(null)
  }

  return (
    <Modal
      onOk={() => form.submit()}
      width='90%'
      style={{ maxWidth: 800 }}
      open={open}
      onCancel={handleCancel}
      centered
      okText={stepServiceToEdit ? 'Cập nhật' : 'Tạo'}
      cancelText='Huỷ'
    >
      <Row>
        <Col span={24}>
          {Title({ title: stepServiceToEdit ? 'Chỉnh sửa thông tin bước dịch vụ' : 'Tạo bước dịch vụ' })}
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateOrUpdateStepService
