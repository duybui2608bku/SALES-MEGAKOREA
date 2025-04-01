import { useMutation } from '@tanstack/react-query'
import {
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Typography,
  Switch,
  Select,
  Button,
  Space,
  Card
} from 'antd'
import { HttpStatusCode } from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import OptionsBranch from 'src/Components/OptionsBranch'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import { queryClient } from 'src/main'
import {
  EmployeeOfServices,
  ProductOfServices,
  ServicesType,
  StepServicesFieldType,
  UpdateServicesRequestBody
} from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { generateProductCode } from 'src/Utils/util.utils'
import { PriceType, RoleUser } from 'src/Constants/enum'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'

interface ModalCreateServiceProps {
  visible: boolean
  onClose: (value: boolean) => void
  serviceToEdit?: ServicesType | null
  setServiceToEdit?: (value: ServicesType | null) => void
}

interface FieldsType {
  _id: string
  is_active: boolean
  code?: string
  name: string
  user_id: string
  branch: string[]
  employee: EmployeeOfServices[]
  descriptions?: string
  price?: number
  service_group_id?: string
  step_services?: StepServicesFieldType[]
  products?: ProductOfServices[]
  [key: string]: unknown
}

interface FieldsCreateType {
  _id: string
  is_active: boolean
  code?: string
  name: string
  user_id: string
  branch: string[]
  employee: EmployeeOfServices[]
  descriptions?: string
  price?: number
  service_group_id?: string
  step_services?: StepServicesFieldType[]
  products?: ProductOfServices[]
  [key: string]: unknown
}

const SELECT_ALL_BRANCH = 'all'

const validateCommission = (values: FieldsType): boolean => {
  const servicePrice = values.price || 0
  const stepServices = values.step_services || []
  let totalCommission = 0
  for (const step of stepServices) {
    if (step.type_step_price === PriceType.FIXED && step.price) {
      totalCommission += step.price
    } else if (step.type_step_price === PriceType.PRECENT && step.rate) {
      totalCommission += servicePrice * step.rate
    }
  }

  if (totalCommission > servicePrice) {
    message.error('Tổng giá hoa hồng của nhân viên vượt quá giá gốc của dịch vụ!')
    return false
  }
  return true
}

const ModalCreateService = (props: ModalCreateServiceProps) => {
  const { visible, onClose, serviceToEdit, setServiceToEdit } = props
  const { profile } = useContext(AppContext)
  const [form] = Form.useForm()
  const { branchList } = useQueryBranch()
  const [branchId, setBranchId] = useState<string[]>([])

  useEffect(() => {
    if (serviceToEdit && branchList.length > 0) {
      const branchId = serviceToEdit?.branch?.map((branch) => (typeof branch === 'string' ? branch : branch._id)) || []
      const service_group_id = serviceToEdit?.service_group._id || ''
      const servicesStep = serviceToEdit?.step_services?.map((step) => ({
        id_employee: step.employee._id,
        type_step_price: step.type_step_price,
        price: step.price,
        descriptions: step.descriptions,
        rate: step.rate || undefined
      }))
      setBranchId(branchId)
      form.setFieldsValue({
        ...serviceToEdit,
        branch: branchId,
        service_group_id: service_group_id,
        step_services: servicesStep
      })
    } else {
      form.resetFields()
    }
  }, [serviceToEdit, form, branchList])

  const getBranchList = (branch: string[]): string[] => {
    if (branch.includes(SELECT_ALL_BRANCH)) {
      return branchList.map((branch) => branch._id)
    }
    return branch
  }

  const { mutate: createService, isPending: isCreating } = useMutation({
    mutationFn: servicesApi.createServices,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServices'])()
    },
    onSuccess: () => {
      message.success('Tạo dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServices'] })
      form.resetFields()
      onClose(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getAllServices'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi tạo dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllServices'] })
    },
    retry: 2
  })

  const handleCreateService = (values: FieldsCreateType) => {
    if (!profile?._id) {
      message.error('Không thể tạo dịch vụ: User ID không hợp lệ!')
      return
    }
    const user_id = profile._id
    const branch = getBranchList(values.branch || [])
    const service = { ...values, user_id, branch, descriptions: values.descriptions || '' }
    createService(service)
  }

  const handleUpdateService = (values: FieldsType) => {
    if (!serviceToEdit?._id) {
      message.error('Không thể cập nhật dịch vụ: User ID không hợp lệ!')
      return
    }
    updateService(values)
  }

  const { mutate: updateService, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateServicesRequestBody) => servicesApi.updateServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServices'])()
    },
    onSuccess: () => {
      message.success('Cập nhật dịch vụ thành công!')
      form.resetFields()
      setServiceToEdit?.(null)
      onClose(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getAllServices'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi cập nhật dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllServices'] })
    },
    retry: 2
  })

  const onFinish = (values: FieldsType) => {
    try {
      if (serviceToEdit) {
        if (!validateCommission(values)) {
          return
        }
        const serviceId = serviceToEdit._id
        handleUpdateService({
          ...values,
          _id: serviceId
        })
      } else {
        if (!validateCommission(values)) {
          return
        }
        handleCreateService(values)
      }
    } catch (error) {
      console.error(error)
      message.error('Đã xảy ra lỗi không xác định!')
    }
  }

  const isPending = isCreating || isUpdating

  const handleCancelModal = () => {
    onClose(false)
    setServiceToEdit?.(null)
    setBranchId([])
    form.resetFields()
  }

  return (
    <Modal
      onCancel={handleCancelModal}
      centered
      onOk={() => form.submit()}
      okText={serviceToEdit ? 'Cập nhật' : 'Tạo'}
      confirmLoading={isPending}
      cancelText='Hủy'
      open={visible}
      width={700}
    >
      <Row style={{ height: 'auto', overflowY: 'auto' }}>
        <Col span={24}>
          <Typography.Title className='center-div' level={4}>
            {serviceToEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo Dịch Vụ Mới'}
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-service' form={form}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='name'
                  label='Tên dịch vụ'
                  rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
                >
                  <Input placeholder='Nhập tên dịch vụ' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='code'
                  label='Mã dịch vụ'
                  initialValue={serviceToEdit ? undefined : generateProductCode()}
                >
                  <Input placeholder='Nhập mã dịch vụ' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType> name='price' label='Giá dịch vụ' initialValue={0}>
                  <InputNumber
                    suffix='đ'
                    style={{ minWidth: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                    placeholder='Nhập giá dịch vụ'
                    min={0}
                    step={1000}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<FieldsType>
                  rules={[{ required: true, message: 'Vui lòng chi nhánh!' }]}
                  name='branch'
                  label='Chi nhánh'
                >
                  <OptionsBranch
                    initialValue={branchId}
                    placeholder={serviceToEdit ? 'Toàn bộ' : 'Chọn chi nhánh'}
                    mode='multiple'
                    search
                    onchange={(value) => form.setFieldsValue({ branch: value })}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType> name='service_group_id' label='Nhóm dịch vụ'>
                  <OptionsCategoryServices
                    initialValue={serviceToEdit?.service_group._id}
                    placeholder='Chọn nhóm dịch vụ'
                    search
                    onchange={(value) => form.setFieldsValue({ service_group_id: value })}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='is_active'
                  label='Trạng thái hoạt động'
                  valuePropName='checked'
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item<FieldsType> name='descriptions' label='Mô tả'>
                  <Input.TextArea rows={4} placeholder='Nhập mô tả dịch vụ' />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.List name='step_services'>
                  {(fields, { add, remove }) => (
                    <Fragment>
                      <Typography.Title level={5}>Các bước dịch vụ</Typography.Title>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card
                          style={{ marginBottom: 16 }}
                          title={`Bước ${name + 1}` || 'Bước 1'}
                          size='small'
                          extra={
                            <Space>
                              <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                          }
                          bordered
                          className='card-step'
                          hoverable
                          key={key}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'descriptions']}
                                label='Mô tả bước'
                                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                              >
                                <Input placeholder='Nhập mô tả bước' />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'id_employee']} label='Nhân viên'>
                                <OptionsGetUsersWithRole
                                  role={RoleUser.TECHNICIAN}
                                  initialValue={serviceToEdit?.step_services?.[name]?.id_employee}
                                  placeholder='Chọn nhân viên'
                                  search
                                  onchange={(value) =>
                                    form.setFieldsValue({
                                      step_services: {
                                        [name]: {
                                          ...form.getFieldValue('step_services')?.[name],
                                          id_employee: value
                                        }
                                      }
                                    })
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'type_step_price']}
                                label='Loại giá'
                                rules={[{ required: true, message: 'Vui lòng chọn loại giá!' }]}
                                initialValue={PriceType.FIXED}
                              >
                                <Select>
                                  <Select.Option value={PriceType.FIXED}>Cố định</Select.Option>
                                  <Select.Option value={PriceType.PRECENT}>Phần trăm</Select.Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'commision']}
                                label='Giá'
                                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                              >
                                <InputNumber
                                  suffix='đ'
                                  style={{ width: '100%' }}
                                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                  min={0}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Form.Item>
                        <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                          Thêm bước dịch vụ
                        </Button>
                      </Form.Item>
                    </Fragment>
                  )}
                </Form.List>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateService
