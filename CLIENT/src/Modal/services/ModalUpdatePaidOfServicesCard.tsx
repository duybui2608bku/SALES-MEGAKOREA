import { Modal } from 'antd'
import { Fragment } from 'react/jsx-runtime'

interface ModalUpdatePaidOfServicesCardProps {
  open: boolean
  onClose: () => void
  data: unknown
}

const ModalUpdatePaidOfServicesCard = (props: ModalUpdatePaidOfServicesCardProps) => {
  const { open, onClose, data } = props
  return (
    <Fragment>
      <Modal open={open} onCancel={onClose} width={800} footer={null} title='Cập nhật thanh toán'></Modal>
    </Fragment>
  )
}

export default ModalUpdatePaidOfServicesCard
