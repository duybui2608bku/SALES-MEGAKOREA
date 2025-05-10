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
  Space,
  Tag,
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
import { DollarOutlined, InboxOutlined, TagOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrintOutline } from 'react-icons/io5'
import { RiErrorWarningLine } from 'react-icons/ri'
import { GrSubtractCircle } from 'react-icons/gr'
import { AiOutlinePlusCircle } from 'react-icons/ai'
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

  console.log('dataCard: ', servicesCardSoldOfCustomerData)

  // Ref lưu thông tin dịch vụ đang được cập nhật
  const updatingServiceRef = useRef<{
    cardId: string
    serviceId: string
    action: 'use' | 'increase'
  } | null>(null)

  useEffect(() => {
    if (servicesCardSoldOfCustomerData) {
      // Thêm parentId vào mỗi card
      const cardsWithParentId = servicesCardSoldOfCustomerData.cards.map((card) => ({
        ...card,
        parentId: servicesCardSoldOfCustomerData._id
      }))
      setListServicesCard(cardsWithParentId)
    }
  }, [servicesCardSoldOfCustomerData])

  // Theo dõi cập nhật từ query cache
  useEffect(() => {
    if (!open || !servicesCardSoldOfCustomerData) return

    // Đăng ký listener để theo dõi khi query thành công
    const unsubscribe = queryClientHook.getQueryCache().subscribe((event) => {
      // Chỉ xử lý cho sự kiện thành công
      if (event.type === 'updated') {
        const queryKey = event.query.queryKey

        // Kiểm tra xem đây có phải là query chính không
        if (Array.isArray(queryKey) && queryKey[0] === 'services-card-sold-customer') {
          // Tìm dữ liệu mới trong cache
          const newData = event.query.state.data?.data?.result?.servicesCardSold

          if (Array.isArray(newData)) {
            // Tìm card đang hiển thị trong modal
            const updatedServiceCard = newData.find((card) => card._id === servicesCardSoldOfCustomerData._id)

            if (updatedServiceCard) {
              // Cập nhật danh sách dịch vụ trong modal
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

    // Cleanup khi component unmount hoặc modal đóng
    return () => {
      unsubscribe()
    }
  }, [open, servicesCardSoldOfCustomerData, queryClientHook])

  // Func đóng Modal view
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

    // Lưu thông tin dịch vụ đang cập nhật
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

    // Cập nhật local trước khi gọi API
    setListServicesCard((prevCards) => {
      return prevCards.map((card) => {
        if (card._id === services_card_sold_id) {
          return {
            ...card,
            services_of_card: card.services_of_card.map((service) => {
              if (service._id === services_id) {
                return {
                  ...service,
                  used: service.used + 1 // Tăng số lượng đã sử dụng
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

  // New function to handle showing the increase quantity modal
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
      // Prepare data for API call - without commision
      const dataUpdateQuantityOfServices: UpdateQuantityServicesRequestBody = {
        id: servicesCardSoldOfCustomerData._id,
        commision_of_technician_id: '', // Empty as we don't need commision
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

      // Chỉ cần invalidate để cập nhật data chính xác - UI đã được cập nhật trước đó
      queryClient.invalidateQueries({ queryKey: queryKey })

      // Vẫn gọi refetch để đảm bảo dữ liệu hiển thị ở component cha được cập nhật
      refetchData()

      // Reset ref
      updatingServiceRef.current = null
    },
    onError: (error: Error, _, context) => {
      message.error(`Lỗi khi sử dụng dịch vụ: ${error.message}`)

      // Khôi phục dữ liệu cache nếu có lỗi
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)

      // Khôi phục UI về trạng thái trước khi cập nhật
      if (updatingServiceRef.current && updatingServiceRef.current.action === 'use') {
        const { cardId, serviceId } = updatingServiceRef.current

        setListServicesCard((prevCards) => {
          return prevCards.map((card) => {
            if (card._id === cardId) {
              return {
                ...card,
                services_of_card: card.services_of_card.map((service) => {
                  if (service._id === serviceId) {
                    // Giảm lại giá trị used đã tăng trước đó
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

      // Chỉ cần invalidate để cập nhật data chính xác - UI đã được cập nhật trước đó
      queryClient.invalidateQueries({ queryKey: queryKey })

      // Vẫn gọi refetch để đảm bảo dữ liệu hiển thị ở component cha được cập nhật
      refetchData()

      // Reset ref
      updatingServiceRef.current = null
    },
    onError: (error: Error, variables, context) => {
      message.error(`Lỗi khi tăng số lượng dịch vụ: ${error.message}`)

      // Khôi phục dữ liệu cache nếu có lỗi
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)

      // Khôi phục UI về trạng thái trước khi cập nhật
      if (updatingServiceRef.current && updatingServiceRef.current.action === 'increase') {
        const { cardId, serviceId } = updatingServiceRef.current

        setListServicesCard((prevCards) => {
          return prevCards.map((card) => {
            if (card._id === cardId) {
              return {
                ...card,
                services_of_card: card.services_of_card.map((service) => {
                  if (service._id === serviceId) {
                    // Giảm lại giá trị quantity đã tăng trước đó
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
        okText={'Đóng'}
        footer={null}
        style={{ padding: 0 }}
        width={Math.min(listServicesCard.length * 260 + 48, 1100)}
      >
        <Title className='center-div' level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Thẻ dịch vụ đã bán
        </Title>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: listServicesCard.length <= 4 ? 'center' : 'flex-start',
            alignItems: 'stretch',
            height: listServicesCard.length <= 4 ? 'auto' : '660px',
            overflowY: 'scroll',
            overflowX: 'hidden'
          }}
        >
          {listServicesCard.map((card) => (
            <Card
              key={card._id}
              hoverable
              style={{
                flex: '0 0 240px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid lightgray',
                background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)'
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                  <Title level={5} style={{ margin: 0, color: '#2d3436', fontWeight: 600, lineHeight: '1.4' }}>
                    {card.name}
                  </Title>

                  <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />

                  <Space align='center'>
                    <DollarOutlined style={{ color: '#fa8c16', fontSize: '17px' }} />
                    <Text strong style={{ fontSize: '15px', color: '#2d3436' }}>
                      {card.services_of_card.reduce((total, s) => total + s.lineTotal, 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </Space>

                  <Space direction='vertical' size={8} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: '12px', color: '#2d3436' }}>
                      Dịch vụ:
                    </Text>
                    {card.services_of_card.map((service, index) => (
                      <Flex key={index} align='start' style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Flex style={{ flexDirection: 'column', alignItems: 'start', gap: '8px', width: '100%' }}>
                          <Tag
                            color='cyan'
                            icon={<TagOutlined />}
                            style={{
                              fontSize: '10px',
                              padding: '4px 10px',
                              borderRadius: '10px',
                              background: '#e6f7ff',
                              border: 'none'
                            }}
                          >
                            {service.name}
                          </Tag>
                          <Text type='danger' style={{ fontSize: '12px', marginLeft: '7px' }}>
                            {service.used} / {service.quantity}
                          </Text>
                        </Flex>
                        <Space>
                          {/* Button for using service */}
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
                                )} `
                              })
                            }
                            okText='Xác nhận'
                            cancelText='Hủy'
                            description={
                              <Row style={{ width: '500px', gap: '18px', marginTop: '20px' }}>
                                <Col span={11}>
                                  <Text>Thực hiện</Text>
                                  <OptionsGetUsersWithRole
                                    onchange={(value) => setUserId(value)}
                                    style={{
                                      marginTop: '8px'
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
                              disabled={isUpdateUsedOfServices || service.used >= service.quantity}
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              icon={<GrSubtractCircle style={{ color: '#10B981', fontSize: '16px' }} />}
                            />
                          </Popconfirm>

                          {/* Button for increasing quantity - now just opens modal */}
                          <Button
                            onClick={() =>
                              showIncreaseQuantityModal({
                                cardId: card._id,
                                serviceId: service._id,
                                serviceName: service.name,
                                cardName: card.name
                              })
                            }
                            disabled={isUpdateQuantityOfServices}
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            icon={<AiOutlinePlusCircle style={{ color: '#1890ff', fontSize: '16px' }} />}
                          />
                        </Space>
                      </Flex>
                    ))}
                  </Space>

                  <Divider style={{ margin: '2px 0', borderColor: '#e8ecef' }} />
                  <Text type='secondary' style={{ fontSize: '10px' }}>
                    Ngày tạo: {dayjs(card.create_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Space>
              </div>
              <Flex justify='space-around' style={{ marginTop: 12 }}>
                <Button
                  style={{ width: '40px', height: '40px' }}
                  icon={<IoPrintOutline style={{ color: '#3B82F6', fontSize: '18px' }} />}
                />
                <Button
                  style={{ width: '40px', height: '40px' }}
                  icon={<RiErrorWarningLine style={{ color: '#F59E0B', fontSize: '18px' }} />}
                />
              </Flex>
            </Card>
          ))}
        </div>
      </Modal>

      {/* New Modal for increasing quantity */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              Tăng số lượng dịch vụ
            </Title>
            {increasingService && (
              <Text type='secondary' style={{ display: 'block', marginTop: 8 }}>
                {increasingService.serviceName}
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
            />
          </Form.Item>

          <Form.Item
            name='images'
            label={
              <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                Tải lên hình ảnh <span style={{ color: 'red' }}>*</span>
              </Text>
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
                padding: '30px 0',
                background: '#fafafa',
                border: '1px dashed #d9d9d9',
                borderRadius: '8px',
                transition: 'border-color 0.3s'
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
              <Text strong style={{ display: 'block', marginBottom: 8, color: '#52c41a' }}>
                Đã tải lên {uploadedImages.length} hình ảnh
              </Text>
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
