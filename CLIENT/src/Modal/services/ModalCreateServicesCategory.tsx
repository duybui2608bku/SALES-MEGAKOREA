import { Modal, Form, Input, Button, message } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateServicesCategoryRequestBody,
  UpdateServicesCategoryRequestBody,
  ServicesCategoryType
} from 'src/Interfaces/services/services.interfaces'
import { HttpStatusCode } from 'axios'
import { servicesApi } from 'src/Service/services/services.api'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import { useEffect } from 'react' // Thêm useEffect

interface ModalCreateServicesCategoryProps {
  visible: boolean
  onClose: () => void
  category?: ServicesCategoryType | null
  setCategoryServices: (value: ServicesCategoryType | null) => void
}

const ModalCreateServicesCategory = ({
  visible,
  onClose,
  category,
  setCategoryServices
}: ModalCreateServicesCategoryProps) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const isEditMode = !!category

  // Đồng bộ form với category mỗi khi category thay đổi
  useEffect(() => {
    if (visible) {
      if (isEditMode) {
        form.setFieldsValue({ name: category?.name, descriptions: category?.descriptions })
      } else {
        form.resetFields() // Reset form khi tạo mới
      }
    }
  }, [category, visible, form, isEditMode])

  // Mutation để tạo mới danh mục
  const createMutation = useMutation({
    mutationFn: (body: CreateServicesCategoryRequestBody) => servicesApi.createServicesCategory(body),
    onSuccess: () => {
      message.success('Tạo danh mục dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCategory'] })
      form.resetFields()
      onClose()
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.Conflict
            ? 'Tên danh mục đã tồn tại!'
            : `Lỗi khi tạo danh mục: ${error.message}`
      message.error(errorMsg)
    }
  })

  // Mutation để cập nhật danh mục
  const updateMutation = useMutation({
    mutationFn: (body: UpdateServicesCategoryRequestBody) =>
      servicesApi.updateServicesCategory({
        ...body,
        _id: category?._id
      } as UpdateServicesCategoryRequestBody & { _id: string }),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServicesCategory'])()
    },
    onSuccess: () => {
      message.success('Cập nhật danh mục dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCategory'] })
      onClose()
    },
    onError: (error: any, _, context) => {
      queryClient.setQueryData(['getAllServicesCategory'], context?.previousData)
      const errorMsg =
        error.response?.status === HttpStatusCode.BadRequest
          ? 'Dữ liệu không hợp lệ!'
          : error.response?.status === HttpStatusCode.NotFound
            ? 'Danh mục không tồn tại!'
            : `Lỗi khi cập nhật danh mục: ${error.message}`
      message.error(errorMsg)
    }
  })

  // Xử lý submit form
  const handleFinish = (values: CreateServicesCategoryRequestBody | UpdateServicesCategoryRequestBody) => {
    if (isEditMode) {
      updateMutation.mutate(values as UpdateServicesCategoryRequestBody)
    } else {
      createMutation.mutate(values as CreateServicesCategoryRequestBody)
    }
  }

  const handleCloseModal = () => {
    setCategoryServices?.(null)
    form.resetFields() // Reset form khi đóng modal
    onClose()
  }

  return (
    <Modal
      centered
      title={isEditMode ? 'Chỉnh sửa danh mục dịch vụ' : 'Tạo mới danh mục dịch vụ'}
      open={visible}
      onCancel={handleCloseModal}
      footer={null}
      destroyOnClose // Hủy toàn bộ trạng thái khi modal đóng
    >
      <Form form={form} layout='vertical' onFinish={handleFinish}>
        <Form.Item
          name='name'
          label='Tên danh mục'
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder='Nhập tên danh mục' />
        </Form.Item>

        <Form.Item
          name='descriptions'
          label='Mô tả'
          rules={[{ max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }]}
        >
          <Input.TextArea rows={4} placeholder='Nhập mô tả (tùy chọn)' />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button type='primary' htmlType='submit' loading={createMutation.isPending || updateMutation.isPending}>
              {isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ModalCreateServicesCategory
