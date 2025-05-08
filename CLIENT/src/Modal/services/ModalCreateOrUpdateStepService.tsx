import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select } from 'antd'
import { useEffect, useState } from 'react'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import Title from 'src/Components/Title'
import { TypeCommision } from 'src/Constants/enum'
import HttpStatusCode from 'src/Constants/httpCode'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import { CreateStepServiceRequestBody, StepServicesInterface } from 'src/Interfaces/services/services.interfaces'
import { queryClient } from 'src/main'
import { servicesApi } from 'src/Service/services/services.api'

interface ModalCreateOrUpdateStepServiceProps {
  open: boolean
  onClose: (value: boolean) => void
  stepServiceToEdit?: StepServicesInterface | null
  setStepServiceToEdit?: (value: StepServicesInterface | null) => void
}

interface FieldsType {
  services_category_id?: string
  name: string
  type: TypeCommision
  commission: number
}

const ModalCreateOrUpdateStepService = (props: ModalCreateOrUpdateStepServiceProps) => {
  const { open, onClose, stepServiceToEdit, setStepServiceToEdit } = props
  const [form] = Form.useForm()
  const [categoryQuery, setCategoryQuery] = useState<string | undefined>(undefined)

  const handleCancel = () => {
    onClose(false)
    setCategoryQuery(undefined)
    setStepServiceToEdit?.(null)
  }

  // Func create a step service
  const { mutate: createStepService, isPending: isCreating } = useMutation({
    mutationFn: servicesApi.createStepService,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['stepServices'])()
    },
    onSuccess: () => {
      message.success('Tạo bước dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['stepServices'] })
      form.resetFields()
      handleCancel()
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['stepServices'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : error.message.includes(`${HttpStatusCode.Unauthorized}`)
          ? 'Bạn không có quyền thực thi hành động này!'
          : `Lỗi khi tạo bước dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stepServices'] })
    },
    retry: 2
  })

  // Xử lý tạo bước dịch vụ mới
  const handleCreateStepService = (value: FieldsType) => {
    try {
      const services_category_id = categoryQuery
      const stepService: CreateStepServiceRequestBody = { ...value, services_category_id }
      createStepService(stepService)
    } catch (error) {
      message.error(`Đã xảy lỗi trong quá trình tạo bước dịch vụ: ${error}`)
    }
  }

  // Fetch data step service to edit
  useEffect(() => {
    if (stepServiceToEdit) {
      form.setFieldsValue(stepServiceToEdit)
      setCategoryQuery(stepServiceToEdit.services_category_id)
    } else {
      form.resetFields()
    }
  }, [stepServiceToEdit, form])

  // Func update step service

  const onFinish = (value: FieldsType) => {
    try {
      if (stepServiceToEdit) {
        console.log('chưa tạo hàm edit')
      } else {
        handleCreateStepService(value)
      }
    } catch (error) {
      message.error(`Đã xảy ra lỗi không xác định: ${error}`)
    }
  }

  // Sự kiện loading
  const isPending = isCreating

  return (
    <Modal
      onOk={() => form.submit()}
      width='90%'
      style={{ maxWidth: 800 }}
      open={open}
      onCancel={handleCancel}
      loading={isPending}
      centered
      okText={stepServiceToEdit ? 'Cập nhật' : 'Tạo'}
      cancelText='Huỷ'
    >
      <Row>
        <Col span={24}>
          {Title({ title: stepServiceToEdit ? 'Chỉnh sửa thông tin bước dịch vụ' : 'Tạo bước dịch vụ' })}
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-update-step-services' form={form}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name='name'
                  label='Tên bước dịch vụ'
                  rules={[{ required: true, message: 'Vui lòng nhập tên bước dịch vụ!' }]}
                >
                  <Input placeholder='Nhập tên bước dịch vụ' />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name='services_category_id' label='Danh mục'>
                  <OptionsCategoryServices
                    initialValue={categoryQuery}
                    placeholder='Chọn danh mục'
                    search
                    onchange={(value) => setCategoryQuery(value)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label='Loại hoa hồng'
                  name='type-price'
                  initialValue={TypeCommision.FIXED}
                  rules={[{ required: true, message: 'Vui lòng chọn loại hoa hồng' }]}
                >
                  <Select>
                    <Select.Option value={TypeCommision.FIXED}>Cố định</Select.Option>
                    <Select.Option value={TypeCommision.PRECENT}>Phần trăm</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label='Hoa hồng'
                  name='commision'
                  initialValue={0}
                  rules={[
                    { required: true, message: 'Vui lòng nhập hoa hồng!' },
                    { type: 'number', min: 0, message: 'Hoa hồng không được nhỏ hơn 0!' }
                  ]}
                >
                  <InputNumber
                    suffix='đ'
                    style={{ minWidth: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    // parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                    placeholder='Nhập hoa hồng'
                    step={1000}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateOrUpdateStepService
