import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload
} from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  GetServicesCardSoldOfCustomer,
  UpdateUsedServicesData,
  UpdateUsedServicesRequestBody,
  UpdateQuantityServicesRequestBody
} from 'src/Interfaces/services/services.interfaces'
const { Title, Text } = Typography
import {
  DollarOutlined,
  InboxOutlined,
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  InfoCircleOutlined,
  FileImageOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Row } from 'antd/lib'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import { RoleUser, TypeCommision } from 'src/Constants/enum'
import { queryClient } from 'src/main'
import { HttpStatusCode } from 'axios'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import commisionTechnicanApi from 'src/Service/commision/commision.technican.api'
import { AppContext } from 'src/Context/AppContext'
import { axiosUploadAvatar } from 'src/Service/axious.api'

import { servicesApi } from 'src/Service/services/services.api'

interface ModalViewServicesCardProps {
  open: boolean
  close: (value: boolean) => void
  servicesCardSoldOfCustomerData?: GetServicesCardSoldOfCustomer | null
  refetchData: () => void
  queryKey: any
}

interface CardOfServicesCardSoldOfCustomer {
  _id: string
  price: number | null
  name: string
  parentId: string
  services_of_card: {
    _id: string
    name: string
    lineTotal: number
    price: number
    quantity: number
    used: number
    type_price: TypeCommision
  }[]
  create_at?: string
}

const { Dragger } = Upload

// Add a new state for the currently increasing service
interface IncreasingService {
  cardId: string
  serviceId: string
  serviceName: string
  cardName: string
  quantity: number
}

const ModalViewServicesCardSold = (props: ModalViewServicesCardProps) => {
  const { open, close, servicesCardSoldOfCustomerData, refetchData, queryKey } = props
  const { profile } = useContext(AppContext)
  const [listServicesCard, setListServicesCard] = useState<CardOfServicesCardSoldOfCustomer[]>([])
  const [userId, setUserId] = useState<string>('')
  const queryClientHook = useQueryClient()

  // New states for the increasing quantity modal
  const [increasingModalVisible, setIncreasingModalVisible] = useState(false)
  const [increasingService, setIncreasingService] = useState<IncreasingService | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [increasingQuantity, setIncreasingQuantity] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm()

  // Ref for tracking service being updated
  const updatingServiceRef = useRef<{
    cardId: string
    serviceId: string
    action: 'use' | 'increase'
  } | null>(null)

  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      // Add parentId to each card
      const cardsWithParentId = servicesCardSoldOfCustomerData.cards.map((card) => ({
        ...card,
        parentId: servicesCardSoldOfCustomerData._id
      }))
      setListServicesCard(cardsWithParentId)
    }
  }, [servicesCardSoldOfCustomerData])

  // Watch for updates from query cache
  useEffect(() => {
    if (!open || !servicesCardSoldOfCustomerData) return

    // Register listener to track when query succeeds
    const unsubscribe = queryClientHook.getQueryCache().subscribe((event) => {
      // Only process success events
      if (event.type === 'updated') {
        const queryKey = event.query.queryKey

        // Check if this is the main query
        if (Array.isArray(queryKey) && queryKey[0] === 'services-card-sold-customer') {
          // Find new data in cache
          const newData = event.query.state.data?.data?.result?.servicesCardSold

          if (Array.isArray(newData)) {
            // Find card currently displayed in modal
            const updatedServiceCard = newData.find((card) => card._id === servicesCardSoldOfCustomerData._id)

            if (updatedServiceCard) {
              // Update service list in modal
              const cardsWithParentId = updatedServiceCard.cards.map((card: any) => ({
                ...card,
                parentId: updatedServiceCard._id
              }))

              setListServicesCard(cardsWithParentId)
            }
          }
        }
      }
    })

    // Cleanup when component unmounts or modal closes
    return () => {
      unsubscribe()
    }
  }, [open, servicesCardSoldOfCustomerData, queryClientHook])

  // Function to close view Modal
  const handleCancelModal = () => {
    close(false)
  }

  const handleCreateCommisionTechnican = async ({
    commision,
    type,
    services_card_sold_of_customer_id,
    user_id
  }: {
    commision: number
    type: TypeCommision
    services_card_sold_of_customer_id: string
    user_id: string
  }) => {
    const data = {
      user_id,
      commision,
      type,
      services_card_sold_of_customer_id
    }
    try {
      let commisionId = ''
      const result = await commisionTechnicanApi.createCommisionTechnican(data)
      if (result.data.success) {
        commisionId = result.data.result
      }
      return commisionId
    } catch (error: Error | any) {
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi tạo hoa hồng : ${error.message}`
      message.error(errorMsg)
      return
    }
  }

  const handleUpdateUsedOfServices = async (data: UpdateUsedServicesData) => {
    if (!userId) {
      message.error('Vui lòng chọn nhân viên kỹ thuật!')
      return
    }

    // Save info about service being updated
    updatingServiceRef.current = {
      cardId: data.services_card_sold_id,
      serviceId: data.services_id,
      action: 'use'
    }

    const {
      commision,
      type,
      services_card_sold_of_customer_id,
      user_id,
      count,
      date,
      name_service,
      services_card_sold_id,
      services_id,
      user_name,
      descriptions
    } = data

    const dataCommision = {
      user_id,
      commision,
      type,
      services_card_sold_of_customer_id
    }
    const commisionId = await handleCreateCommisionTechnican(dataCommision)
    const dataUpdateUsedOfServices: UpdateUsedServicesRequestBody = {
      id: services_card_sold_of_customer_id,
      commision_of_technician_id: commisionId as string,
      services_card_sold_id: services_card_sold_id,
      services_id,
      history_used: {
        name_service,
        user_name,
        count,
        date,
        descriptions
      }
    }

    // Update locally before API call
    setListServicesCard((prevCards) => {
      return prevCards.map((card) => {
        if (card._id === services_card_sold_id) {
          return {
            ...card,
            services_of_card: card.services_of_card.map((service) => {
              if (service._id === services_id) {
                return {
                  ...service,
                  used: service.used + 1 // Increase used count
                }
              }
              return service
            })
          }
        }
        return card
      })
    })

    updateUsedOfServices(dataUpdateUsedOfServices)
  }

  // Function to show increase quantity modal
  const showIncreaseQuantityModal = (service: {
    cardId: string
    serviceId: string
    serviceName: string
    cardName: string
  }) => {
    setIncreasingService({
      ...service,
      quantity: 1
    })
    setIncreasingQuantity(1)
    setUploadedImages([])
    setIncreasingModalVisible(true)
    form.resetFields()
  }

  // Function to handle file upload
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploading(true)
      const response = await axiosUploadAvatar.post('/upload/image', formData)
      const uploadedFileUrl = response.data.result[0].url
      setUploadedImages((prev) => [...prev, uploadedFileUrl])
      onSuccess('ok')
      message.success(`${file.name} tải lên thành công.`)
    } catch (error) {
      onError(error)
      message.error(`${file.name} tải lên thất bại.`)
    } finally {
      setUploading(false)
    }
  }

  // Function to handle increasing quantity submission
  const handleIncreaseQuantitySubmit = async () => {
    if (!increasingService) return
    if (uploadedImages.length === 0) {
      message.error('Vui lòng tải lên ít nhất một hình ảnh!')
      return
    }

    updatingServiceRef.current = {
      cardId: increasingService.cardId,
      serviceId: increasingService.serviceId,
      action: 'increase'
    }

    if (!servicesCardSoldOfCustomerData) return

    try {
      // Prepare data for API call - without commission
      const dataUpdateQuantityOfServices: UpdateQuantityServicesRequestBody = {
        id: servicesCardSoldOfCustomerData._id,
        commision_of_technician_id: '', // Empty as we don't need commission
        services_card_sold_id: increasingService.cardId,
        services_id: increasingService.serviceId,
        media: uploadedImages,
        history_increase_quantity: {
          name_service: increasingService.serviceName,
          user_name: profile?.name || 'Người dùng',
          count: increasingQuantity,
          date: new Date().toISOString(),
          descriptions: `Tăng ${increasingQuantity} số lượng dịch vụ ${increasingService.serviceName} của thẻ dịch vụ ${increasingService.cardName} vào lúc ${dayjs().format('DD/MM/YYYY HH:mm')}`
        }
      }

      // Optimistically update UI
      setListServicesCard((prevCards) => {
        return prevCards.map((card) => {
          if (card._id === increasingService.cardId) {
            return {
              ...card,
              services_of_card: card.services_of_card.map((service) => {
                if (service._id === increasingService.serviceId) {
                  return {
                    ...service,
                    quantity: service.quantity + increasingQuantity
                  }
                }
                return service
              })
            }
          }
          return card
        })
      })

      // Call API
      await updateQuantityOfServices(dataUpdateQuantityOfServices)

      // Reset form state
      setUploadedImages([])
      setIncreasingQuantity(1)

      // Close modal
      setIncreasingModalVisible(false)
      message.success(`Đã tăng thêm ${increasingQuantity} cho dịch vụ ${increasingService.serviceName}`)
    } catch (error) {
      console.error('Failed to increase quantity:', error)
      message.error('Có lỗi xảy ra khi tăng số lượng dịch vụ!')
    }
  }

  const { mutate: updateUsedOfServices, isPending: isUpdateUsedOfServices } = useMutation({
    mutationFn: (data: UpdateUsedServicesRequestBody) => servicesApi.UpdateUsedOfServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['services-card-sold-customer'])()
    },
    onSuccess: () => {
      message.success('Sử dụng dịch vụ thành công!')

      // Only invalidate to update accurate data - UI was already updated
      queryClient.invalidateQueries({ queryKey: queryKey })

      // Still call refetch to ensure data displayed in parent component is updated
      refetchData()

      // Reset ref
      updatingServiceRef.current = null
    },
    onError: (error: Error, _, context) => {
      message.error(`Lỗi khi sử dụng dịch vụ: ${error.message}`)

      // Restore cache data if error
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)

      // Restore UI to state before update
      if (updatingServiceRef.current && updatingServiceRef.current.action === 'use') {
        const { cardId, serviceId } = updatingServiceRef.current

        setListServicesCard((prevCards) => {
          return prevCards.map((card) => {
            if (card._id === cardId) {
              return {
                ...card,
                services_of_card: card.services_of_card.map((service) => {
                  if (service._id === serviceId) {
                    // Decrease used value increased earlier
                    return {
                      ...service,
                      used: service.used - 1
                    }
                  }
                  return service
                })
              }
            }
            return card
          })
        })
      }

      // Reset ref
      updatingServiceRef.current = null
    },
    retry: 2
  })

  const { mutate: updateQuantityOfServices, isPending: isUpdateQuantityOfServices } = useMutation({
    mutationFn: (data: UpdateQuantityServicesRequestBody) => servicesApi.UpdateQuantityOfServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['services-card-sold-customer'])()
    },
    onSuccess: () => {
      message.success('Tăng số lượng dịch vụ thành công!')

      // Only invalidate to update accurate data - UI was already updated
      queryClient.invalidateQueries({ queryKey: queryKey })

      // Still call refetch to ensure data displayed in parent component is updated
      refetchData()

      // Reset ref
      updatingServiceRef.current = null
    },
    onError: (error: Error, variables, context) => {
      message.error(`Lỗi khi tăng số lượng dịch vụ: ${error.message}`)

      // Restore cache data if error
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)

      // Restore UI to state before update
      if (updatingServiceRef.current && updatingServiceRef.current.action === 'increase') {
        const { cardId, serviceId } = updatingServiceRef.current

        setListServicesCard((prevCards) => {
          return prevCards.map((card) => {
            if (card._id === cardId) {
              return {
                ...card,
                services_of_card: card.services_of_card.map((service) => {
                  if (service._id === serviceId) {
                    // Decrease quantity value increased earlier
                    return {
                      ...service,
                      quantity: service.quantity - increasingQuantity
                    }
                  }
                  return service
                })
              }
            }
            return card
          })
        })
      }

      // Reset ref
      updatingServiceRef.current = null
    },
    retry: 2
  })

  return (
    <>
      <Modal
        open={open}
        onCancel={handleCancelModal}
        centered
        footer={
          <Button type='primary' onClick={handleCancelModal}>
            Đóng
          </Button>
        }
        className='service-card-modal'
        width={listServicesCard.length <= 3 ? `${Math.min(listServicesCard.length * 320 + 80, 1000)}px` : '90%'}
        style={{ maxWidth: listServicesCard.length <= 3 ? 'none' : '1200px' }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            Thẻ dịch vụ đã bán
          </Title>
          {servicesCardSoldOfCustomerData?.customers.name && (
            <Text type='secondary' style={{ fontSize: '15px', color: '#1890ff' }}>
              Khách hàng: {servicesCardSoldOfCustomerData.customers.name}
            </Text>
          )}
        </div>

        <div
          className='service-card-container'
          style={{
            display: 'grid',
            gridTemplateColumns:
              listServicesCard.length >= 4
                ? 'repeat(auto-fill, minmax(250px, 1fr))'
                : `repeat(${listServicesCard.length}, 1fr)`,
            gap: '16px',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {listServicesCard.map((card) => (
            <Card
              key={card._id}
              hoverable
              className='service-card'
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 8px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: 'rgb(247, 250, 252)',
                padding: '8px 5px'
              }}
              bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flexGrow: 1 }}>
                <Flex justify='space-between' align='center' style={{ marginBottom: '12px', flexDirection: 'row' }}>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: '#262626',
                      fontWeight: 600,
                      maxWidth: '80%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '17px'
                    }}
                  >
                    <Tooltip title={card.name}>{card.name}</Tooltip>
                  </Title>
                  <Tag
                    color='#1890ff'
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '16px',
                      marginRight: 0
                    }}
                  >
                    <DollarOutlined style={{ marginRight: '4px' }} />
                    {card.services_of_card.reduce((total, s) => total + s.lineTotal, 0).toLocaleString('vi-VN')}
                  </Tag>
                </Flex>

                <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

                <div className='services-list' style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '14px', color: '#262626', display: 'block', marginBottom: '12px' }}>
                    Dịch vụ ({card.services_of_card.length}):
                  </Text>
                  <Space direction='vertical' size={12} style={{ width: '100%' }}>
                    {card.services_of_card.map((service) => {
                      const usagePercent = Math.min(Math.round((service.used / service.quantity) * 100), 100)
                      const isExhausted = service.used >= service.quantity

                      return (
                        <div
                          key={service._id}
                          style={{
                            background: '#ffffff',
                            boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 8px',
                            borderRadius: '8px',
                            padding: '10px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Flex justify='space-between' align='center' style={{ marginBottom: '8px' }}>
                            <Tooltip title={service.name}>
                              <Text
                                style={{
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  color: '#262626',
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {service.name}
                              </Text>
                            </Tooltip>
                            <Text
                              style={{ fontSize: '12px', fontWeight: 500, color: isExhausted ? '#ff4d4f' : '#1890ff' }}
                            >
                              {service.used}/{service.quantity}
                            </Text>
                          </Flex>

                          <Progress
                            percent={usagePercent}
                            size='small'
                            status={isExhausted ? 'exception' : 'active'}
                            style={{ marginBottom: '8px' }}
                            showInfo={false}
                          />

                          <Flex justify='space-between' align='center'>
                            <Text type='secondary' style={{ fontSize: '12px', color: '#1890ff' }}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(service.price)}
                            </Text>

                            <Space size={8}>
                              <Popconfirm
                                title='Xác nhận sử dụng dịch vụ'
                                onConfirm={() =>
                                  handleUpdateUsedOfServices({
                                    commision: service.lineTotal,
                                    type: service.type_price,
                                    services_card_sold_of_customer_id: servicesCardSoldOfCustomerData?._id as string,
                                    user_id: userId,
                                    count: 1,
                                    date: new Date(),
                                    name_service: service.name,
                                    services_card_sold_id: card._id,
                                    services_id: service._id,
                                    user_name: profile?.name || 'Người dùng',
                                    descriptions: `Sử dụng dịch vụ ${service.name} của thẻ dịch vụ ${card.name} vào lúc ${dayjs().format(
                                      'DD/MM/YYYY HH:mm'
                                    )}`
                                  })
                                }
                                okText='Xác nhận'
                                cancelText='Hủy'
                                placement='left'
                                description={
                                  <Row style={{ width: '500px', gap: '18px', marginTop: '20px' }}>
                                    <Col span={11}>
                                      <Text>Thực hiện</Text>
                                      <OptionsGetUsersWithRole
                                        onchange={(value) => setUserId(value)}
                                        style={{
                                          marginTop: '8px',
                                          width: '100%'
                                        }}
                                        search
                                        role={RoleUser.TECHNICIAN}
                                      />
                                    </Col>
                                    <Col span={11}>
                                      <Flex
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '10px'
                                        }}
                                      >
                                        <Text>Hoa hồng</Text>
                                        <Text style={{ color: '#ff4d4f', fontSize: '15px' }}>
                                          {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                          }).format(service.price)}
                                        </Text>
                                      </Flex>
                                    </Col>
                                  </Row>
                                }
                              >
                                <Button
                                  type='text'
                                  disabled={isUpdateUsedOfServices || isExhausted}
                                  style={{
                                    padding: '4px',
                                    color: isExhausted ? '#d9d9d9' : '#52c41a',
                                    background: isExhausted ? '#f5f5f5' : 'rgba(82, 196, 26, 0.1)'
                                  }}
                                  icon={<MinusOutlined />}
                                  size='small'
                                  title='Sử dụng dịch vụ'
                                />
                              </Popconfirm>

                              <Button
                                type='text'
                                onClick={() =>
                                  showIncreaseQuantityModal({
                                    cardId: card._id,
                                    serviceId: service._id,
                                    serviceName: service.name,
                                    cardName: card.name
                                  })
                                }
                                disabled={isUpdateQuantityOfServices}
                                style={{
                                  padding: '4px',
                                  color: '#1890ff',
                                  background: 'rgba(24, 144, 255, 0.1)'
                                }}
                                icon={<PlusOutlined />}
                                size='small'
                                title='Tăng số lượng'
                              />
                            </Space>
                          </Flex>
                        </div>
                      )
                    })}
                  </Space>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Divider style={{ margin: '8px 0 12px', borderColor: '#f0f0f0' }} />

                <Flex justify='space-between' align='center'>
                  <Text type='secondary' style={{ fontSize: '12px' }}>
                    {dayjs(card.create_at).format('DD/MM/YYYY HH:mm')}
                  </Text>

                  <Space>
                    <Button
                      type='text'
                      icon={<PrinterOutlined style={{ fontSize: '18px' }} />}
                      style={{ color: '#1890ff' }}
                      title='In'
                    />
                    <Button
                      type='text'
                      icon={<InfoCircleOutlined style={{ fontSize: '18px' }} />}
                      style={{ color: '#faad14' }}
                      title='Thông tin'
                    />
                  </Space>
                </Flex>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Modal for increasing quantity */}
      <Modal
        title={
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
              Tăng số lượng dịch vụ
            </Title>
            {increasingService && (
              <Text style={{ display: 'block', marginTop: '8px', fontSize: '15px' }}>
                <Tag color='cyan' style={{ fontWeight: 500, padding: '2px 8px' }}>
                  {increasingService.serviceName}
                </Tag>
              </Text>
            )}
          </div>
        }
        open={increasingModalVisible}
        onCancel={() => setIncreasingModalVisible(false)}
        footer={[
          <Button key='back' onClick={() => setIncreasingModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type='primary'
            loading={isUpdateQuantityOfServices || uploading}
            onClick={handleIncreaseQuantitySubmit}
            disabled={uploadedImages.length === 0}
          >
            Xác nhận
          </Button>
        ]}
        width={520}
        centered
        bodyStyle={{ padding: '24px 24px 12px' }}
      >
        <Form form={form} layout='vertical' style={{ maxWidth: 600 }}>
          <Form.Item
            name='quantity'
            label={
              <Text strong style={{ fontSize: '15px' }}>
                Số lượng muốn tăng thêm
              </Text>
            }
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            initialValue={1}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: '100%' }}
              value={increasingQuantity}
              onChange={(value) => setIncreasingQuantity(value || 1)}
              size='large'
              addonAfter='dịch vụ'
            />
          </Form.Item>

          <Form.Item
            name='images'
            label={
              <Flex align='center' gap={8}>
                <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                  Tải lên hình ảnh <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <FileImageOutlined style={{ color: '#1890ff' }} />
              </Flex>
            }
            rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh!' }]}
          >
            <Dragger
              name='image'
              multiple
              customRequest={handleUpload}
              listType='picture-card'
              showUploadList={true}
              accept='image/*'
              beforeUpload={(file) => {
                const isPNG = file.type === 'image/png'
                const isJPG = file.type === 'image/jpeg'
                const isJPEG = file.type === 'image/jpg'
                if (!isPNG && !isJPG && !isJPEG) {
                  message.error(`${file.name} không phải là file hình ảnh PNG/JPG/JPEG!`)
                }
                return isPNG || isJPG || isJPEG ? true : Upload.LIST_IGNORE
              }}
              style={{
                padding: '24px 0',
                background: '#fafafa',
                border: '1px dashed #d9d9d9',
                borderRadius: '8px',
                transition: 'border-color 0.3s ease'
              }}
            >
              <div style={{ padding: '0 20px' }}>
                <p className='ant-upload-drag-icon'>
                  <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className='ant-upload-text' style={{ fontWeight: 'bold', fontSize: '16px', marginTop: '16px' }}>
                  Nhấp hoặc kéo thả hình ảnh vào khu vực này
                </p>
                <p className='ant-upload-hint' style={{ color: '#666', fontSize: '14px' }}>
                  Hỗ trợ tải lên nhiều ảnh định dạng PNG, JPG, JPEG
                </p>
              </div>
            </Dragger>
          </Form.Item>

          {/* Display already uploaded images */}
          {uploadedImages.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <Flex align='center' style={{ marginBottom: 8 }}>
                <Text strong style={{ color: '#52c41a', marginRight: 8 }}>
                  Đã tải lên {uploadedImages.length} hình ảnh
                </Text>
                <Tag color='success'>{uploadedImages.length} ảnh</Tag>
              </Flex>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {uploadedImages.map((url, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #f0f0f0'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </>
  )
}

export default ModalViewServicesCardSold
