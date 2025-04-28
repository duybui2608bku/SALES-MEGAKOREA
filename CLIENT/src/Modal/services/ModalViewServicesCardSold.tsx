import { Button, Card, Col, Divider, Flex, message, Modal, Popconfirm, Space, Tag, Typography } from 'antd'
import { useContext, useEffect, useState } from 'react'
import {
  GetServicesCardSoldOfCustomer,
  UpdateUsedServicesData,
  UpdateUsedServicesRequestBody
} from 'src/Interfaces/services/services.interfaces'
const { Title, Text } = Typography
import { DollarOutlined, TagOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { IoPrintOutline } from 'react-icons/io5'
import { RiErrorWarningLine } from 'react-icons/ri'
import { GrSubtractCircle } from 'react-icons/gr'
import { Row } from 'antd/lib'
import OptionsGetUsersWithRole from 'src/Components/OptionsGetUsersWithRole'
import { RoleUser, TypeCommision } from 'src/Constants/enum'
import { queryClient } from 'src/main'
import { HttpStatusCode } from 'axios'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import { useMutation } from '@tanstack/react-query'
import commisionTechnicanApi from 'src/Service/commision/commision.technican'
import { AppContext } from 'src/Context/AppContext'

import { servicesApi } from 'src/Service/services/services.api'
enum StatusOpenModalServicesCard {
  VIEW,
  UPDATE,
  NONE
}

interface ModalViewServicesCardProps {
  open: StatusOpenModalServicesCard
  close: (value: StatusOpenModalServicesCard) => void
  servicesCardSoldOfCustomerData?: GetServicesCardSoldOfCustomer | null
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

const ModalViewServicesCardSold = (props: ModalViewServicesCardProps) => {
  const { open, close, servicesCardSoldOfCustomerData } = props
  const { profile } = useContext(AppContext)
  const [listServicesCard, setListServicesCard] = useState<CardOfServicesCardSoldOfCustomer[]>([])
  const [userId, setUserId] = useState<string>('')

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

  // Func đóng Modal view
  const handleCancelModal = () => {
    close(StatusOpenModalServicesCard.NONE)
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
        : `Lỗi tạo khi hoa hồng : ${error.message}`
      message.error(errorMsg)
      return
    }
  }

  const handleUpdateUsedOfServices = async (data: UpdateUsedServicesData) => {
    if (!userId) {
      message.error('Vui lòng chọn nhân viên kỹ thuật!')
      return
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
    updateUsedOfServices(dataUpdateUsedOfServices)
  }

  const { mutate: updateUsedOfServices, isPending: isUpdateUsedOfServices } = useMutation({
    mutationFn: (data: UpdateUsedServicesRequestBody) => servicesApi.UpdateUsedOfServices(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['services-card-sold-customer'])()
    },
    onSuccess: () => {
      message.success('Sử dụng dịch vụ thành công!')
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['services-card-sold-customer'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : `Lỗi khi sử dụng dịch vụ : ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['services-card-sold-customer'] })
    },
    retry: 2
  })

  return (
    <Modal
      open={open === StatusOpenModalServicesCard.VIEW}
      onCancel={handleCancelModal}
      centered
      okText={'Đóng'}
      footer={null}
      style={{ padding: 0 }}
      // Tính chiều rộng động của Modal (giới hạn tối đa là 1100p)
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
          alignItems: 'stretch'
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

                <Space direction='vertical' size={8}>
                  <Text strong style={{ fontSize: '12px', color: '#2d3436' }}>
                    Dịch vụ:
                  </Text>
                  {card.services_of_card.map((service, index) => (
                    <Space key={index} align='center' style={{ width: '100%' }}>
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
                      <Text type='danger' style={{ fontSize: '12px' }}>
                        {service.used} / {service.quantity}
                      </Text>
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
                          <Row style={{ width: '500px' }}>
                            <Col span={12}>
                              <Text>Thực hiện</Text>
                              <OptionsGetUsersWithRole
                                onchange={(value) => setUserId(value)}
                                style={{
                                  marginTop: '8px',
                                  marginBottom: '8px'
                                }}
                                search
                                role={RoleUser.TECHNICIAN}
                              />
                            </Col>
                            <Col span={12}>
                              <Flex
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                <Text>Hoa hồng</Text>
                                <Text>
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
                          style={{ width: '40px', height: '40px' }}
                          icon={<GrSubtractCircle style={{ color: '#10B981', fontSize: '18px' }} />}
                        />
                      </Popconfirm>
                    </Space>
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
  )
}

export default ModalViewServicesCardSold
