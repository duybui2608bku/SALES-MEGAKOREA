import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select, Typography } from 'antd'
import { useContext } from 'react'
import { optionsBranch, optionsCategoryProductGeneral, optionsUnitProduct } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import { CreateProductRequestBody } from 'src/Interfaces/product/product.interface'
import { queryClient } from 'src/main'
import productApi from 'src/Service/product/product.api'
import { generateProductCode } from 'src/Utils/util.utils'

interface ModalCreateProductGeneralProps {
  open: boolean
  close: (value: boolean) => void
}

interface FieldsType {
  branch?: string[]
  code?: string
  price?: number
  label?: string
  user_id: string
  is_consumable?: boolean
  category?: string
  type?: string
  name: string
  unit?: string
}

const ModalCreateProduct = (props: ModalCreateProductGeneralProps) => {
  const { open, close } = props
  const { profile } = useContext(AppContext)
  const [form] = Form.useForm()

  const mutation = useMutation({
    mutationFn: productApi.craeteProduct,
    onSuccess: () => {
      message.success('Tạo sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
      form.resetFields()
      close(false)
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo sản phẩm: ${error.message}`)
    }
  })

  const onFinish = (values: FieldsType) => {
    const user_id = profile?._id || ''
    const is_consumable = false
    const branch: string[] = []
    if (values.branch?.length === 0) {
      optionsBranch.forEach((item) => {
        branch.push(item.value)
      })
    }
    const product: CreateProductRequestBody = { ...values, user_id, is_consumable, branch }
    mutation.mutate(product)
  }

  return (
    <>
      <Modal
        onCancel={() => {
          close(false)
          form.resetFields()
        }}
        centered
        onOk={() => {
          form.submit()
        }}
        okText='Tạo'
        cancelText='Hủy'
        open={open}
        width={800}
      >
        <Row>
          <Col span={24}>
            <Typography.Title className='center-div' level={4}>
              Tạo Sản Phẩm Mới
            </Typography.Title>
          </Col>
          <Col span={24} style={{ marginTop: 20 }}>
            <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-product' form={form}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item<FieldsType>
                    name='name'
                    label='Tên sản phẩm'
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập tên sản phẩm !'
                      }
                    ]}
                  >
                    <Input placeholder='Nhập tên sản phẩm' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldsType>
                    name='code'
                    label='Mã sản phẩm'
                    initialValue={generateProductCode()}
                    required
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mã sản phẩm !'
                      }
                    ]}
                  >
                    <Input placeholder='Nhập mã sản phẩm' />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldsType> name='price' label='Giá sản phẩm' initialValue={0}>
                    <InputNumber
                      suffix='đ'
                      style={{ minWidth: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                      placeholder='Nhập giá sản phẩm'
                      onKeyPress={(e) => {
                        const charCode = e.key.charCodeAt(0)

                        if ((charCode < 48 || charCode > 57) && charCode !== 8 && charCode !== 13) {
                          e.preventDefault()
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item<FieldsType> name='branch' label='Chi nhánh'>
                    <Select placeholder='Chọn chi nhánh' showSearch mode='multiple' options={optionsBranch} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldsType>
                    name='category'
                    label='Danh mục'
                    initialValue={optionsCategoryProductGeneral[11].value}
                  >
                    <Select placeholder='Chọn danh mục' showSearch options={optionsCategoryProductGeneral} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldsType> initialValue={optionsUnitProduct[26].value} name='unit' label='Đơn vị'>
                    <Select allowClear placeholder='Chọn đơn vị' showSearch options={optionsUnitProduct} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Modal>
    </>
  )
}

export default ModalCreateProduct
