import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Typography, Button, Card, Select } from 'antd'
import { HttpStatusCode } from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import OptionsBranch from 'src/Components/OptionsBranch'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import { queryClient } from 'src/main'
import { CreateServicesCardRequestBody, ServicesOfCardType } from 'src/Interfaces/services/services.interfaces'
import { servicesApi } from 'src/Service/services/services.api'
import { generateProductCode } from 'src/Utils/util.utils'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import OptionsCategoryServices from 'src/Components/OptionsCategoryServices'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import { PriceType, RoleUser } from 'src/Constants/enum'
import OptionsServices from 'src/Components/OptionsGetServices'

interface ModalCreateServiceCardProps {
  visible: boolean
  onClose: (value: boolean) => void
  serviceCardToEdit?: ServicesOfCardType | null
  setServiceCardToEdit?: (value: ServicesOfCardType | null) => void
}

const SELECT_ALL_BRANCH = 'all'

const ModalCreateServiceCard = (props: ModalCreateServiceCardProps) => {
  const { visible, onClose, serviceCardToEdit, setServiceCardToEdit } = props
  const { profile } = useContext(AppContext)
  const [form] = Form.useForm()
  const { branchList } = useQueryBranch()
  const [branchId, setBranchId] = useState<string[]>([])

  useEffect(() => {
    if (serviceCardToEdit && branchList.length > 0) {
      const branchId =
        serviceCardToEdit?.branch?.map((branch) => (typeof branch === 'string' ? branch : branch._id)) || []
      const service_group_id = serviceCardToEdit?.service_group?._id || undefined
      const employee = serviceCardToEdit?.employee?.map((emp) => ({
        id_employee: emp.id_employee
      }))
      const services_of_card = serviceCardToEdit?.services_of_card?.map((service) => ({
        services_id: service.services_id,
        quantity: service.quantity,
        discount: service.discount
      }))
      setBranchId(branchId)
      form.setFieldsValue({
        ...serviceCardToEdit,
        branch: branchId,
        service_group_id,
        employee,
        services_of_card
      })
    } else {
      form.resetFields()
    }
  }, [serviceCardToEdit, form, branchList])

  const getBranchList = (branch: string[]): string[] => {
    if (branch.includes(SELECT_ALL_BRANCH)) {
      return branchList.map((branch) => branch._id)
    }
    return branch
  }

  const { mutate: createServiceCard, isPending: isCreating } = useMutation({
    mutationFn: servicesApi.createServicesCard,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServicesCard'])()
    },
    onSuccess: () => {
      message.success('Tạo thẻ dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
      form.resetFields()
      onClose(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getAllServicesCard'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi tạo thẻ dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
    },
    retry: 2
  })

  const handleCreateServiceCard = (values: CreateServicesCardRequestBody) => {
    if (!profile?._id) {
      message.error('Không thể tạo thẻ dịch vụ: User ID không hợp lệ!')
      return
    }
    const user_id = profile._id
    const branch = getBranchList(values.branch || [])
    const serviceCard = { ...values, user_id, branch }
    createServiceCard(serviceCard)
  }

  const { mutate: updateServiceCard, isPending: isUpdating } = useMutation({
    mutationFn: (data: CreateServicesCardRequestBody & { _id: string }) => servicesApi.updateServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServicesCard'])()
    },
    onSuccess: () => {
      message.success('Cập nhật dịch vụ thành công!')
      form.resetFields()
      setServiceCardToEdit?.(null)
      onClose(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getAllServicesCard'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi cập nhật dịch vụ: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllServicesCard'] })
    },
    retry: 2
  })

  const handleUpdateServiceCard = (values: CreateServicesCardRequestBody & { _id: string }) => {
    if (!serviceCardToEdit?._id) {
      message.error('Không thể cập nhật dịch vụ: Service ID không hợp lệ!')
      return
    }
    updateServiceCard({ ...values, _id: serviceCardToEdit._id })
  }

  const onFinish = (values: CreateServicesCardRequestBody & { _id?: string }) => {
    try {
      const branch = getBranchList(values.branch || [])
      const serviceData = { ...values, branch }
      if (serviceCardToEdit) {
        handleUpdateServiceCard(serviceData as CreateServicesCardRequestBody & { _id: string })
      } else {
        handleCreateServiceCard(serviceData)
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi không xác định !')
    }
  }

  const isPending = isCreating || isUpdating

  const handleCancelModal = () => {
    onClose(false)
    setServiceCardToEdit?.(null)
    setBranchId([])
    form.resetFields()
  }

  console.log('serviceCardToEdit', serviceCardToEdit)

  return (
    <Modal
      onCancel={handleCancelModal}
      centered
      onOk={() => form.submit()}
      okText={serviceCardToEdit ? 'Cập nhật' : 'Tạo'}
      confirmLoading={isPending}
      cancelText='Hủy'
      open={visible}
      width={750}
    >
      <Row style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <Col span={24}>
          <Typography.Title className='center-div' level={4}>
            {serviceCardToEdit ? 'Chỉnh sửa thẻ dịch vụ' : 'Tạo thẻ dịch vụ'}
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-service' form={form}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='code'
                  label='Mã dịch vụ'
                  initialValue={serviceCardToEdit ? undefined : generateProductCode()}
                  rules={[{ type: 'string', message: 'Mã dịch vụ phải là chuỗi!' }]}
                >
                  <Input placeholder='Nhập mã dịch vụ' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='name'
                  label='Tên thẻ dịch vụ'
                  rules={[
                    { required: true, message: 'Tên không được để trống' },
                    { type: 'string', message: 'Tên dịch vụ phải là chuỗi!' }
                  ]}
                >
                  <Input placeholder='Nhập tên dịch vụ' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody> name='price_paid' label='Thanh toán'>
                  <InputNumber
                    suffix='đ'
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                    min={0}
                    defaultValue={0}
                    placeholder='Số tiền thanh toán'
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='branch'
                  label='Chi nhánh'
                  rules={[{ required: true, message: 'Vui lòng chọn chi nhánh!' }]}
                >
                  <OptionsBranch
                    initialValue={branchId}
                    placeholder={serviceCardToEdit ? 'Toàn bộ' : 'Chọn chi nhánh'}
                    mode='multiple'
                    search
                    onchange={(value) => form.setFieldsValue({ branch: value })}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='session_time'
                  label='Số buổi'
                  rules={[{ type: 'number', min: 0, message: 'Số buổi phục vụ phải là số không âm!' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder='Nhập buổi phục vụ' min={0} step={5} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='service_group_id'
                  label='Nhóm dịch vụ'
                  rules={[{ type: 'string', message: 'Nhóm dịch vụ phải là chuỗi!' }]}
                >
                  <OptionsCategoryServices
                    initialValue={serviceCardToEdit?.service_group?._id}
                    placeholder='Chọn nhóm dịch vụ'
                    search
                    onchange={(value) => form.setFieldsValue({ service_group_id: value })}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item<CreateServicesCardRequestBody>
                  name='descriptions'
                  label='Mô tả'
                  rules={[{ type: 'string', message: 'Mô tả phải là chuỗi!' }]}
                >
                  <Input.TextArea rows={2} placeholder='Nhập mô tả dịch vụ' />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.List name='services_of_card'>
                  {(fields, { add, remove }) => (
                    <Fragment>
                      <Typography.Title level={5}>Dịch vụ</Typography.Title>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card
                          style={{ marginBottom: 16 }}
                          title={`Dịch vụ ${name + 1}`}
                          size='small'
                          extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                          bordered
                          hoverable
                          key={key}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'services_id']}
                                label='Dịch vụ'
                                rules={[{ required: true, message: 'Vui lòng nhập dịch vụ!' }]}
                              >
                                <OptionsServices
                                  initialValue={`${String(serviceCardToEdit?.services_of_card?.[name]?.service_details?._id)}-${String(serviceCardToEdit?.services_of_card?.[name]?.price)}`}
                                  placeholder='Chọn dịch vụ'
                                  search
                                  onchange={(value) =>
                                    form.setFieldsValue({
                                      services_of_card: {
                                        [name]: { services_id: value.split('-')[0], price: Number(value.split('-')[1]) }
                                      }
                                    })
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'quantity']}
                                label='Số lượng'
                                rules={[
                                  { required: true, message: 'Vui lòng nhập số lượng!' },
                                  { type: 'number', min: 0, message: 'Số lượng phải không âm!' }
                                ]}
                              >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder='Số lượng' />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'discount']}
                                label='Giảm giá'
                                // rules={[
                                //   { required: true, message: 'Vui lòng nhập giảm giá!' },
                                //   { type: 'number', min: 0, message: 'Giảm giá phải không âm!' }
                                // ]}
                              >
                                <InputNumber
                                  suffix='đ'
                                  style={{ width: '100%' }}
                                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value) => (value ? Number(value.replace(/\$\s?|(,*)/g, '')) : 0)}
                                  min={0}
                                  defaultValue={0}
                                  placeholder='Giảm giá'
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Form.Item>
                        <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                          Thêm dịch vụ
                        </Button>
                      </Form.Item>
                    </Fragment>
                  )}
                </Form.List>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.List name='employee'>
                  {(fields, { add, remove }) => (
                    <Fragment>
                      <Typography.Title level={5}>Nhân viên tư vấn</Typography.Title>
                      {fields.map(({ key, name, ...restField }) => (
                        <Card
                          style={{ marginBottom: 16 }}
                          title={`Nhân viên ${name + 1}`}
                          size='small'
                          extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                          bordered
                          hoverable
                          key={key}
                        >
                          <Row gutter={[16, 16]}>
                            <Col span={8}>
                              <Form.Item
                                {...restField}
                                name={[name, 'id_employee']}
                                label='Nhân viên'
                                rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
                              >
                                <OptionsGetUsersWithRole
                                  initialValue={serviceCardToEdit?.employee?.[name]?.employee_details._id}
                                  role={RoleUser.TECHNICIAN}
                                  placeholder='Chọn nhân viên'
                                  search
                                  onchange={(value) =>
                                    form.setFieldsValue({
                                      employee: {
                                        [name]: { id_employee: value }
                                      }
                                    })
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                {...restField}
                                name={[name, 'type_price']}
                                label='Loại giá'
                                rules={[{ required: true, message: 'Vui lòng chọn loại giá! ' }]}
                                initialValue={PriceType.FIXED}
                              >
                                <Select>
                                  <Select.Option value={PriceType.FIXED}>Cố định</Select.Option>
                                  <Select.Option value={PriceType.PRECENT}>Phần trăm</Select.Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) =>
                                  prevValues.employee?.[name]?.type_price !== currentValues.employee?.[name]?.type_price
                                }
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, 'price']}
                                  label='Giá'
                                  // rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                                >
                                  <InputNumber
                                    suffix='đ'
                                    style={{ width: '100%' }}
                                    defaultValue={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                    min={0}
                                  />
                                </Form.Item>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Form.Item>
                        <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                          Thêm nhân viên
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

export default ModalCreateServiceCard
