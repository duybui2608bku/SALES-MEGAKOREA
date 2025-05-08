import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Typography, Select, Card, Button } from 'antd'
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
import { generateCode } from 'src/Utils/util.utils'
import { TypeCommision } from 'src/Constants/enum'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import SelectSearchStepServices from 'src/Components/SelectSearchStepServices'
import { MinusCircleOutlined } from '@ant-design/icons'

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

// const validateCommission = (values: FieldsType): boolean => {
//   const servicePrice = values.price || 0
//   const stepServices = values.step_services || []
//   let totalCommission = 0
//   for (const step of stepServices) {
//     if (step.type_step_price === TypeCommision.FIXED && step.price) {
//       totalCommission += step.price
//     } else if (step.type_step_price === TypeCommision.PRECENT && step.rate) {
//       totalCommission += servicePrice * step.rate
//     }
//   }

//   if (totalCommission > servicePrice) {
//     message.error('Tổng giá hoa hồng của nhân viên vượt quá giá gốc của dịch vụ!')
//     return false
//   }
//   return true
// }

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
      setBranchId(branchId)
      form.setFieldsValue({
        ...serviceToEdit,
        branch: branchId,
        service_group_id: service_group_id
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
    const service = { ...values, user_id, branch }
    createService(service as any)
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
        // if (!validateCommission(values)) {
        //   return
        // }
        const serviceId = serviceToEdit._id
        handleUpdateService({
          ...values,
          _id: serviceId
        })
      } else {
        // if (!validateCommission(values)) {
        //   return
        // }
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
      style={{
        overflowY: 'scroll'
      }}
    >
      <Row style={{ height: 'auto' }}>
        <Col span={24}>
          <Typography.Title className='center-div' level={4}>
            {serviceToEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo Dịch Vụ Mới'}
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20, height: '400px', overflowY: 'scroll' }}>
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
                  initialValue={serviceToEdit ? undefined : generateCode()}
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
                  initialValue={[profile?.branch._id]}
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
              {/* <Col span={4}>
                <Form.Item<FieldsType> name='is_active' label='ACTIVE' valuePropName='checked' initialValue={true}>
                  <Switch />
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item<FieldsType>
                  label='Loại hoa hồng'
                  name='type_price'
                  initialValue={TypeCommision.FIXED}
                  rules={[{ required: true, message: 'Vui lòng chọn loại hoa hồng!' }]}
                >
                  <Select disabled>
                    <Select.Option value={TypeCommision.FIXED}>Cố định</Select.Option>
                    <Select.Option value={TypeCommision.PRECENT}>Phần trăm</Select.Option>
                  </Select>
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
                          extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                          bordered
                          className='card-step'
                          hoverable
                          key={key}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'step_services']}
                                label='Mô tả bước'
                                rules={[{ required: true, message: 'Vui lòng chọn bước dịch vụ!' }]}
                              >
                                <SelectSearchStepServices
                                  onHandleChange={(value) => {
                                    if (value) {
                                      // Cập nhật giá trị hoa hồng trực tiếp trong form
                                      form.setFields([
                                        {
                                          name: ['step_services', name, 'commision'],
                                          value: value.commision
                                        }
                                      ])
                                    } else {
                                      form.setFields([
                                        {
                                          name: ['step_services', name, 'commision'],
                                          value: undefined
                                        }
                                      ])
                                    }
                                  }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'commision']} label='Giá'>
                                <InputNumber
                                  disabled
                                  suffix='đ'
                                  style={{ width: '100%', color: '#ff4d4f' }}
                                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Form.Item>
                        <Button type='dashed' onClick={() => add()} block>
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
