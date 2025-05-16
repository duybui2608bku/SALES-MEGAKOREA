import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Typography, Select, Card, Button } from 'antd'
import { HttpStatusCode } from 'axios'
import { Fragment, useContext, useEffect, useCallback, useRef, useState } from 'react'
import OptionsBranch from 'src/Components/OptionsBranch'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import { queryClient } from 'src/main'
import { EmployeeOfServices, ProductOfServices, ServicesType } from 'src/Interfaces/services/services.interfaces'
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

interface StepServiceFormType {
  _id: string
  commision: number
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
  step_services?: StepServiceFormType[]
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
  step_services?: StepServiceFormType[]
  products?: ProductOfServices[]
  [key: string]: unknown
}

const SELECT_ALL_BRANCH = 'all'

// const validateCommision = (values: FieldsType): boolean => {
//   const servicePrice = values.price || 0
//   const stepServices = values.step_services || []
//   let totalCommision = 0
//   for (const step of stepServices) {
//     if (step.type_step_price === TypeCommision.FIXED && step.price) {
//       totalCommision += step.price
//     } else if (step.type_step_price === TypeCommision.PRECENT && step.rate) {
//       totalCommision += servicePrice * step.rate
//     }
//   }

//   if (totalCommision > servicePrice) {
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
  const [categoryValue, setCategoryValue] = useState('')
  const [stepServicesKey, setStepServicesKey] = useState(0)

  // force re-render khi categoryValue thay đổi
  useEffect(() => {
    if (categoryValue) {
      setStepServicesKey((prev) => prev + 1)
    }
  }, [categoryValue])

  // Khi tồn tại serviceToEdit, toạ cấu trúc dữ liệu đúng cho step_services
  const structuredStepServices = []
  if (serviceToEdit?.step_services_details && Array.isArray(serviceToEdit?.step_services_details)) {
    for (const step of serviceToEdit.step_services_details) {
      if (typeof step === 'string') {
        structuredStepServices.push({
          _id: step,
          commision: 0 // Giá trị mặc định
        })
      } else if (step && typeof step === 'object') {
        structuredStepServices.push({
          _id: step._id,
          commision: step.commision || 0
        })
      }
    }
  }

  // Use a ref to track if the form has been initialized
  const formInitialized = useRef(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields()
      formInitialized.current = false
    }
  }, [visible, form])

  // Initialize form with serviceToEdit data only once when needed
  useEffect(() => {
    // Only set form values if the modal is visible, we have serviceToEdit data,
    // branch data is loaded, and we haven't already initialized
    if (!visible || formInitialized.current) {
      return
    }

    if (serviceToEdit && branchList.length > 0) {
      try {
        console.log('Service to edit:', JSON.stringify(serviceToEdit))

        const branchIds =
          serviceToEdit.branch?.map((branch) => (typeof branch === 'string' ? branch : branch._id)) || []

        const service_group_id = serviceToEdit.service_group?._id || ''

        // Set category value for filtering step services
        setCategoryValue(service_group_id)

        // Convert step_services_details to structured format with _id and commision
        const structuredStepServices: StepServiceFormType[] = []

        // First check step_services_details (from API response)
        if (serviceToEdit.step_services_details && Array.isArray(serviceToEdit.step_services_details)) {
          for (const step of serviceToEdit.step_services_details) {
            if (typeof step === 'string') {
              structuredStepServices.push({
                _id: step,
                commision: 0
              })
            } else if (step && typeof step === 'object' && step._id) {
              structuredStepServices.push({
                _id: step._id,
                commision: step.commision || 0
              })
            }
          }
        }

        console.log('Step service IDs:', structuredStepServices)

        setTimeout(() => {
          form.setFieldsValue({
            ...serviceToEdit,
            branch: branchIds,
            service_group_id,
            step_services: structuredStepServices
          })
        }, 0)
      } catch (error) {
        console.error('Error setting form values:', error)
      }
    } else {
      // For new service, just reset fields
      form.resetFields()
    }

    // Mark as initialized to prevent repeated initialization
    formInitialized.current = true
  }, [visible, serviceToEdit, branchList, form])

  const getBranchList = useCallback(
    (branch: string[]): string[] => {
      if (branch.includes(SELECT_ALL_BRANCH)) {
        return branchList.map((branch) => branch._id)
      }
      return branch
    },
    [branchList]
  )

  const { mutate: createService, isPending: isCreating } = useMutation({
    mutationFn: servicesApi.createServices,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServices'])()
    },
    onSuccess: () => {
      message.success('Tạo dịch vụ thành công!')
      setCategoryValue('')
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

  const { mutate: updateService, isPending: isUpdating } = useMutation({
    mutationFn: (data: any) => servicesApi.updateServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getAllServices'])()
    },
    onSuccess: () => {
      message.success('Cập nhật dịch vụ thành công!')
      form.resetFields()
      setCategoryValue('')
      setServiceToEdit?.(null)
      onClose(false)
      formInitialized.current = false
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

  const handleCreateService = useCallback(
    (values: FieldsCreateType) => {
      if (!profile?._id) {
        message.error('Không thể tạo dịch vụ: User ID không hợp lệ!')
        return
      }

      if (values.step_services?.length === undefined || values.step_services?.length === 0) {
        message.error('Bạn chưa thêm bước dịch vụ!')
        return
      }

      const user_id = profile._id
      const branch = getBranchList(values.branch || [])
      const stepServiceIds = values.step_services?.map((step) => step._id) || []

      // Create service data with user_id and branch
      const serviceData = { ...values, user_id, branch, step_services: stepServiceIds }

      // Filter out empty arrays and strings
      const filteredData = Object.entries(serviceData).reduce((acc, [key, value]) => {
        // Skip empty arrays or empty strings
        if ((Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value === '')) {
          return acc
        }

        // Keep non-empty values
        return { ...acc, [key]: value }
      }, {})

      // Call create API with filtered data
      createService(filteredData as any)
    },
    [profile, getBranchList, createService]
  )

  const handleUpdateService = useCallback(
    (values: FieldsType) => {
      if (!serviceToEdit?._id) {
        message.error('Không thể cập nhật dịch vụ: ID dịch vụ không hợp lệ!')
        return
      }

      // Ensure step_services is an array of IDs
      const stepServiceIds = values.step_services?.map((step) => step._id) || []

      // Create update data with the service ID
      const updateData = {
        ...values,
        _id: serviceToEdit._id,
        step_services: stepServiceIds
      }

      // Filter out empty arrays and strings
      const filteredData = Object.entries(updateData).reduce((acc, [key, value]) => {
        // Skip empty arrays or empty strings
        if ((Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value === '')) {
          return acc
        }

        // Keep non-empty values
        return { ...acc, [key]: value }
      }, {})

      // Call update API with filtered data
      updateService(filteredData)
    },
    [serviceToEdit, updateService]
  )

  const onFinish = useCallback(
    (values: FieldsType) => {
      try {
        if (serviceToEdit) {
          handleUpdateService(values)
        } else {
          handleCreateService(values)
        }
      } catch (error) {
        console.error(error)
        message.error('Đã xảy ra lỗi không xác định!')
      }
    },
    [serviceToEdit, handleUpdateService, handleCreateService]
  )

  const handleCancelModal = useCallback(() => {
    onClose(false)
    setServiceToEdit?.(null)
    form.resetFields()
    setCategoryValue('')
    formInitialized.current = false
  }, [onClose, setServiceToEdit, form])

  const handleOptionsCategoryServices = (value: string) => {
    if (categoryValue !== value) {
      setCategoryValue(value)
      form.setFieldsValue({ service_group_id: value })

      // Khi đang ở Create hoặc khi category thay đổi khác so với giá trị ban đầu
      // thì miows reset step_services
      if (!serviceToEdit || serviceToEdit.service_group?._id !== value) {
        const currentStepServies = form.getFieldValue('step_services') || []
        if (currentStepServies.length > 0) {
          const resetStepServices = currentStepServies.map(() => ({
            _id: '',
            commision: 0
          }))
          form.setFieldsValue({ step_services: resetStepServices })
        }
      }
      setStepServicesKey((prev) => prev + 1)
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Modal
      onCancel={handleCancelModal}
      centered
      onOk={() => form.submit()}
      okText={serviceToEdit ? 'Cập nhật' : 'Tạo'}
      confirmLoading={isPending}
      cancelText='Hủy'
      open={visible}
      width={900}
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
        <Col span={24} style={{ marginTop: 20, height: '450px', overflowY: 'scroll' }}>
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
                    initialValue={
                      serviceToEdit?.branch?.map((branch) => (typeof branch === 'string' ? branch : branch._id)) || []
                    }
                    placeholder={serviceToEdit ? 'Toàn bộ' : 'Chọn chi nhánh'}
                    mode='multiple'
                    search
                    onchange={(value) => form.setFieldsValue({ branch: value })}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='service_group_id'
                  label='Nhóm dịch vụ'
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm dịch vụ!' }]}
                >
                  <OptionsCategoryServices
                    initialValue={serviceToEdit?.service_group?._id}
                    placeholder='Chọn nhóm dịch vụ'
                    search
                    onchange={(value) => handleOptionsCategoryServices(value)}
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
                      <input type='hidden' id='current-category-value' value={categoryValue} />
                      {fields.map(({ key, name, ...restField }) => {
                        const stepService = form.getFieldValue(['step_services', name]) || {}
                        return (
                          <Card
                            style={{ marginBottom: 16, border: 'none' }}
                            title={`Bước ${name + 1}` || 'Bước 1'}
                            size='small'
                            extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                            className='card-step'
                            hoverable
                            key={key}
                          >
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, '_id']}
                                  label='Chọn bước'
                                  rules={[{ required: true, message: 'Vui lòng chọn bước dịch vụ!' }]}
                                >
                                  <SelectSearchStepServices
                                    key={`step-service-${key}-${name}-${categoryValue}-${stepServicesKey}`}
                                    cateValue={categoryValue}
                                    initialValue={stepService._id}
                                    onHandleChange={(value) => {
                                      if (value) {
                                        console.log('Selected step service:', value)

                                        // // Get current form data
                                        // const currentStepServices = form.getFieldValue('step_services') || []
                                        // const updatedStepServices = [...currentStepServices]

                                        // // Store only the ID at this position
                                        // updatedStepServices[name] = {
                                        //   _id: value._id,
                                        //   commision: value.commision || 0
                                        // }

                                        // // Update form field
                                        // form.setFieldsValue({ step_services: updatedStepServices })
                                        // Cập nhật giá trị hiện tại mà không ảnh hưởng đến các giá trị khác
                                        const fieldValue = {
                                          _id: value._id,
                                          commision: value.commision || 0
                                        }

                                        form.setFields([
                                          {
                                            name: ['step_services', name],
                                            value: fieldValue
                                          }
                                        ])
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item {...restField} name={[name, 'commision']} label='Giá bước dịch vụ'>
                                  <InputNumber
                                    suffix='đ'
                                    disabled
                                    style={{ width: '100%', color: '#ff4d4f' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Card>
                        )
                      })}
                      <Form.Item>
                        <Button type='dashed' onClick={() => add({ _id: '', commision: 0 })} block>
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
