import { useState, useEffect } from 'react'
import { Button, Table, Card, Typography, Divider, Row, Col, Space, Modal, Image } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import _ from 'lodash'
const { Title, Text } = Typography

import logo from '../../Assets/megakorea-logo-300x105-1.png'

dayjs.locale('vi')

// Định nghĩa kiểu dữ liệu
interface PaymentHistory {
  _id: string
  code: string
  services_card_sold_of_customer_id: string
  paid: number
  out_standing: number
  method: string
  descriptions: string
  user_id: string
  date: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  user_details: {
    _id: string
    name: string
    email: string
    created_at: string
    updated_at: string
    avatar: string
  }
}

interface InvoicePrintPreviewProps {
  open: boolean
  onCancel: () => void
  data: PaymentHistory[]
  customerInfo?: {
    name: string
    phone: string
  }
  invoiceNumber?: string
  shopInfo?: {
    name: string
    address: string
    phone: string
  }
}

const InvoicePrintPreview = (props: InvoicePrintPreviewProps) => {
  const {
    open,
    onCancel,
    data,
    customerInfo = { name: 'NGUYỄN THỊ THÚY', phone: '0846182818' },
    invoiceNumber = 'DH-47785',
    shopInfo = {
      name: 'MEGA KOREA Cà Mau',
      address: '146-148 Ngô Quyền, Phường 9, Thành phố Cà Mau, tỉnh Cà Mau, Việt Nam',
      phone: '0335996899'
    }
  } = props

  const [payments, setPayments] = useState<PaymentHistory[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      setPayments(data)
    }
  }, [data])

  // Tính tổng thanh toán
  const totalPaid = _.sumBy(payments, 'paid')

  // Lấy thông tin từ thanh toán mới nhất
  const latestPayment = _.maxBy(payments, (item) => new Date(item.date).getTime())

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  // Xử lý in ấn
  const handlePrint = () => {
    window.print()
  }

  // Cấu hình cột cho bảng thanh toán
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: 'Mã GD',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Ngày GD',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
    },
    {
      title: 'PT Thanh toán',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: 'Số tiền',
      dataIndex: 'paid',
      key: 'paid',
      align: 'right' as const,
      render: (paid: number) => formatCurrency(paid)
    }
  ]

  const InvoiceContent = () => (
    <div
      className='invoice-container'
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}
    >
      {/* Nút in - chỉ hiển thị khi không ở chế độ in */}
      <div className='print-button' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button
          type='primary'
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ display: 'block' }}
          className='no-print'
        >
          In hóa đơn
        </Button>
      </div>

      <Card bordered={false} className='invoice-card'>
        {/* Header */}
        <Row align='middle' justify='space-between' style={{ marginBottom: '20px' }}>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className='logo' style={{ marginRight: '15px' }}>
                <Image src={logo} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#F98C14' }}>
                  {shopInfo.name}
                </Title>
                <Text style={{ fontSize: '12px', display: 'block' }}>{shopInfo.address}</Text>
                <Text style={{ fontSize: '12px', display: 'block' }}>{shopInfo.phone}</Text>
              </div>
            </div>
          </Col>

          <Col>
            <Title level={3} style={{ margin: 0, textAlign: 'right' }}>
              HÓA ĐƠN BÁN HÀNG
            </Title>
            <Text style={{ display: 'block', textAlign: 'right' }}>Mã ĐH: {invoiceNumber}</Text>
            <Text style={{ display: 'block', textAlign: 'right' }}>
              Ngày in: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
            </Text>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        {/* Thông tin khách hàng */}
        <div style={{ marginBottom: '20px' }}>
          <Row>
            <Col span={12}>
              <Space direction='vertical' size={2}>
                <Text strong>Khách hàng:</Text>
                <Text>
                  {customerInfo.name} ({customerInfo.phone})
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction='vertical' size={2}>
                <Text strong>NV thực hiện:</Text>
                <Text>{latestPayment?.user_details.name || 'Admin'}</Text>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Bảng thanh toán */}
        <Table
          dataSource={payments}
          columns={columns}
          pagination={false}
          rowKey='_id'
          bordered
          size='middle'
          style={{ marginBottom: '20px' }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align='right'>
                  <Text strong>Tổng tiền:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align='right'>
                  <Text strong>{formatCurrency(totalPaid)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        {/* Phần tổng kết */}
        <Row justify='end'>
          <Col span={12}>
            <div style={{ border: '1px solid #f0f0f0', padding: '10px' }}>
              <Row justify='space-between' style={{ marginBottom: '10px' }}>
                <Col>
                  <Text strong>Thành tiền:</Text>
                </Col>
                <Col>
                  <Text>{formatCurrency(totalPaid)}</Text>
                </Col>
              </Row>

              <Divider style={{ margin: '10px 0' }} />

              <Row justify='space-between' style={{ marginBottom: '10px' }}>
                <Col>
                  <Text strong>Tổng thanh toán:</Text>
                </Col>
                <Col>
                  <Text strong>{formatCurrency(totalPaid)}</Text>
                </Col>
              </Row>

              <Row justify='space-between'>
                <Col>
                  <Text strong>Đã thanh toán:</Text>
                </Col>
                <Col>
                  <Text strong>{formatCurrency(totalPaid)}</Text>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Chữ ký */}
        <Row justify='space-between' style={{ marginTop: '40px', textAlign: 'center' }}>
          <Col span={8}>
            <Text strong>Chữ ký KH</Text>
          </Col>
          <Col span={8}>
            <Text strong>Nhân viên</Text>
          </Col>
          <Col span={8}>
            <Text strong>Tư vấn</Text>
            <div style={{ marginTop: '60px' }}>
              <Text>Nguyễn Diễm</Text>
              <br />
              <Text>Trịnh KTCN</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <style>{`
        @media print {
          .no-print, .no-print * {
            display: none !important;
          }
          
          body {
            background-color: white;
          }
          
          .invoice-card {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  )

  return (
    <>
      {/* Modal cho chế độ xem trước */}
      {open && (
        <Modal
          open={open}
          onCancel={onCancel}
          width={850}
          footer={null}
          bodyStyle={{ padding: 0 }}
          centered
          className='no-print'
        >
          <InvoiceContent />
        </Modal>
      )}

      {/* Component độc lập để in (luôn hiển thị nhưng có thể ẩn bằng CSS) */}
      <div style={{ display: open ? 'block' : 'none', position: 'absolute', left: '-9999px' }} className='print-only'>
        <InvoiceContent />
      </div>
    </>
  )
}

export default InvoicePrintPreview
