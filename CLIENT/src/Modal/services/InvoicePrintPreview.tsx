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
    // Tạo một cửa sổ mới để in
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      alert('Vui lòng cho phép cửa sổ pop-up để in hóa đơn')
      return
    }

    // Sao chép CSS
    let styles = ''
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      if (node.tagName === 'STYLE') {
        styles += node.innerHTML
      } else if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
        styles += `@import url('${node.getAttribute('href')}');`
      }
    })

    // Lấy nội dung HTML của hóa đơn
    const invoiceContent = document.querySelector('.invoice-container')

    // Viết nội dung vào cửa sổ mới
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn bán hàng</title>
          <style>
            ${styles}
            body { 
              background-color: white !important;
              margin: 0;
              padding: 20px;
            }
            .ant-table-thead > tr > th,
            .ant-table-tbody > tr > td,
            .ant-table-summary > tr > td {
              padding: 6px !important;
              font-size: 10px !important;
              color: black !important;
              background-color: white !important;
              border-color: #000 !important;
            }
            .ant-modal, .ant-modal-mask { display: none !important; }
            .print-button, .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${invoiceContent ? invoiceContent.innerHTML : 'Không tìm thấy nội dung hóa đơn'}
        </body>
      </html>
    `)

    printWindow.document.close()

    // Đợi tài nguyên tải xong và in
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      // Đóng cửa sổ sau khi in (tùy chọn)
      // printWindow.close();
    }, 1000)
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
    >
      {/* Nút in - chỉ hiển thị khi không ở chế độ in */}
      <div className='print-button' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button
          type='primary'
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ display: 'block', fontSize: '12px' }}
          className='no-print'
        />
      </div>

      <Card bordered={false} className='invoice-card'>
        {/* Header */}
        <Row align='middle' justify='space-between' style={{ marginBottom: '20px', flexDirection: 'column' }}>
          <Col style={{ marginBottom: '20px', marginTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <div className='logo' style={{ marginRight: '15px' }}>
                <Image style={{ width: '70px' }} src={logo} />
              </div>
              <div>
                <Title level={5} style={{ margin: 0, color: '#F98C14', textAlign: 'center' }}>
                  {shopInfo.name}
                </Title>
                <Text style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>{shopInfo.address}</Text>
                <Text style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>{shopInfo.phone}</Text>
              </div>
            </div>
          </Col>

          <Col>
            <Title level={4} style={{ margin: 0, textAlign: 'right' }}>
              HÓA ĐƠN BÁN HÀNG
            </Title>
            <Text style={{ display: 'block', textAlign: 'center', fontSize: '10px' }}>Mã ĐH: {invoiceNumber}</Text>
            <Text style={{ display: 'block', textAlign: 'center', fontSize: '10px' }}>
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
                <Text style={{ fontSize: '11px' }} strong>
                  Khách hàng:
                </Text>
                <Text style={{ fontSize: '11px' }}>
                  {customerInfo.name} ({customerInfo.phone})
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction='vertical' size={2}>
                <Text style={{ fontSize: '11px' }} strong>
                  NV thực hiện:
                </Text>
                <Text style={{ fontSize: '11px' }}>{latestPayment?.user_details.name || 'Admin'}</Text>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Bảng thanh toán */}
        <Table
          className='table-bill'
          dataSource={payments}
          columns={columns}
          pagination={false}
          rowKey='_id'
          bordered
          size='middle'
          style={{ marginBottom: '8px' }}
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
                  <Text style={{ fontSize: '12px' }} strong>
                    Thành tiền:
                  </Text>
                </Col>
                <Col>
                  <Text strong style={{ fontSize: '12px' }}>
                    {formatCurrency(totalPaid)}
                  </Text>
                </Col>
              </Row>

              <Divider style={{ margin: '10px 0' }} />

              <Row justify='space-between' style={{ marginBottom: '10px' }}>
                <Col>
                  <Text style={{ fontSize: '12px' }} strong>
                    Tổng thanh toán:
                  </Text>
                </Col>
                <Col>
                  <Text style={{ fontSize: '12px' }} strong>
                    {formatCurrency(totalPaid)}
                  </Text>
                </Col>
              </Row>

              <Row justify='space-between'>
                <Col>
                  <Text style={{ fontSize: '12px' }} strong>
                    Đã thanh toán:
                  </Text>
                </Col>
                <Col>
                  <Text style={{ fontSize: '12px' }} strong>
                    {formatCurrency(totalPaid)}
                  </Text>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Chữ ký */}
        <Row justify='space-between' style={{ marginTop: '40px', textAlign: 'center' }}>
          <Col span={8}>
            <Text style={{ fontSize: '12px' }} strong>
              Chữ ký KH
            </Text>
          </Col>
          <Col span={8}>
            <Text style={{ fontSize: '12px' }} strong>
              Nhân viên
            </Text>
          </Col>
          <Col span={8}>
            <Text style={{ fontSize: '12px' }} strong>
              Tư vấn
            </Text>
            <div style={{ marginTop: '60px' }}>
              <Text style={{ fontSize: '12px' }}>Nguyễn Diễm</Text>
              <br />
              <Text style={{ fontSize: '12px' }}>Trịnh KTCN</Text>
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
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .invoice-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          .invoice-container {
            padding: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          .ant-table-wrapper, .ant-table, .ant-table-container, 
          .ant-table-content, .ant-table-body {
            display: block !important;
            visibility: visible !important;
          }
          
          .ant-table-thead > tr > th,
          .ant-table-tbody > tr > td,
          .ant-table-summary > tr > td {
            padding: 6px !important;
            font-size: 10px !important;
            color: black !important;
            background-color: white !important;
            border-color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          img, .ant-image {
            display: block !important;
            visibility: visible !important;
          }
        }

        /* CSS cho bảng */
        .table-bill .ant-table-thead > tr > th,
        .table-bill .ant-table-tbody > tr > td,
        .table-bill .ant-table-summary > tr > td {
          font-size: 11px !important;
          padding: 4px 8px !important;
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
          width={600}
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
