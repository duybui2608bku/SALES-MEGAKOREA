import { useMutation } from '@tanstack/react-query'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select, Typography } from 'antd'
import { HttpStatusCode } from 'axios'
import { useContext, useEffect, useState } from 'react'
import OptionsBranch from 'src/Components/OptionsBranch'
import { optionsCategoryProductGeneral, optionsUnitProduct } from 'src/Constants/option'
import { AppContext } from 'src/Context/AppContext'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import useQueryBranch from 'src/hook/query/useQueryBranch'
import {
  CreateProductRequestBody,
  ProductGeneralInterface,
  UpdateProductBody
} from 'src/Interfaces/product/product.interface'
import { queryClient } from 'src/main'
import productApi from 'src/Service/product/product.api'
import { generateCode } from 'src/Utils/util.utils'

interface ModalCreateProductGeneralProps {
  open: boolean
  close: (value: boolean) => void
  productToEdit?: ProductGeneralInterface | null
  setProductToEdit?: (value: ProductGeneralInterface | null) => void
  is_consumable: boolean
}

interface FieldsType {
  branch: string[]
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

const SELECT_ALL_BRANCH = 'all'

const ModalCreateProduct = (props: ModalCreateProductGeneralProps) => {
  const { open, close, productToEdit, setProductToEdit, is_consumable } = props
  const { profile } = useContext(AppContext)
  const [form] = Form.useForm()
  const { branchList } = useQueryBranch()
  const [branchId, setBranchId] = useState<string[]>([])

  useEffect(() => {
    if (productToEdit && branchList.length > 0) {
      const branchId = productToEdit?.branch?.map((branch) => branch._id) || []
      setBranchId(branchId)
      form.setFieldsValue(productToEdit)
      form.setFieldsValue({ branch: branchId })
    } else {
      form.resetFields()
    }
  }, [productToEdit, form, branchList])

  //Mô tả: Hàm này sẽ trả về danh sách chi nhánh nếu chi nhánh chứa 'all' thì sẽ trả về danh sách tất cả các chi nhánh
  const getBranchList = (branch: string[]): string[] => {
    if (branch.includes(SELECT_ALL_BRANCH)) {
      return branchList.map((branch) => branch._id)
    }
    return branch
  }

  const { mutate: createProduct, isPending: isCreating } = useMutation({
    mutationFn: productApi.createProduct,
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getProductsGeneral'])()
    },
    onSuccess: () => {
      message.success('Tạo sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
      form.resetFields()
      close(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getProductsGeneral'], context?.previousData)
      const errorMsg = error.message.includes(String(HttpStatusCode.BadRequest))
        ? 'Dữ liệu không hợp lệ!'
        : error.message.includes(`${HttpStatusCode.Unauthorized}`)
          ? 'Bạn không có quyền tạo sản phẩm!'
          : `Lỗi khi tạo sản phẩm: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
    },
    retry: 2
  })

  const { mutate: updateProduct, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateProductBody) => productApi.updateProduct(data),
    onMutate: async () => {
      return createOptimisticUpdateHandler(queryClient, ['getProductsGeneral'])()
    },
    onSuccess: () => {
      message.success('Cập nhật sản phẩm thành công !')
      form.resetFields()
      setProductToEdit?.(null)
      close(false)
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['getProductsGeneral'], context?.previousData)
      const errorMsg = error.message.includes(`${HttpStatusCode.BadRequest}`)
        ? 'Dữ liệu không hợp lệ!'
        : error.message.includes(`${HttpStatusCode.NotFound}`)
          ? 'Sản phẩm không tồn tại!'
          : `Lỗi khi cập nhật sản phẩm: ${error.message}`
      message.error(errorMsg)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
    },
    retry: 2
  })

  const handleCreateProduct = (values: FieldsType) => {
    if (!profile?._id) {
      message.error('Không thể tạo sản phẩm: User ID không hợp lệ !')
      return
    }
    const user_id = profile._id
    const branch = getBranchList(values.branch)
    const product: CreateProductRequestBody = { ...values, user_id, is_consumable, branch }
    createProduct(product)
  }

  const handleUpdateProduct = (values: FieldsType) => {
    if (!productToEdit || !productToEdit._id) {
      message.error('Không thể cập nhật: Product ID không hợp lệ!')
      setProductToEdit?.(null)
      return
    }
    const branch = getBranchList(values.branch)

    //Mô tả: Lấy ra các trường của productToEdit mà không có trường branch
    const { branch: _, ...productWithoutBranch } = productToEdit
    const updatedFields: Partial<UpdateProductBody> = { ...values, branch }
    const product: UpdateProductBody = { ...productWithoutBranch, ...updatedFields }
    updateProduct(product)
  }

  const onFinish = (values: FieldsType) => {
    try {
      if (productToEdit) {
        handleUpdateProduct(values)
      } else {
        handleCreateProduct(values)
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi không xác định!')
    }
  }

  const isPending = isCreating || isUpdating

  const handleCancleModal = () => {
    close(false)
    setProductToEdit?.(null)
    setBranchId([])
    form.resetFields()
  }

  return (
    <Modal
      onCancel={handleCancleModal}
      centered
      onOk={() => form.submit()}
      okText={productToEdit ? 'Cập nhật' : 'Tạo'}
      confirmLoading={isPending}
      cancelText='Hủy'
      open={open}
      width={800}
    >
      <Row>
        <Col span={24}>
          <Typography.Title className='center-div' level={4}>
            {productToEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo Sản Phẩm Mới'}
          </Typography.Title>
        </Col>
        <Col span={24} style={{ marginTop: 20 }}>
          <Form onFinish={onFinish} autoComplete='off' layout='vertical' name='create-product' form={form}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='name'
                  label='Tên sản phẩm'
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                  <Input placeholder='Nhập tên sản phẩm' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='code'
                  label='Mã sản phẩm'
                  initialValue={productToEdit ? undefined : generateCode()}
                  rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
                >
                  <Input placeholder='Nhập mã sản phẩm' />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<FieldsType>
                  name='price'
                  label='Giá sản phẩm'
                  initialValue={0}
                  rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
                >
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
                  <OptionsBranch
                    initialValue={branchId}
                    placeholder={productToEdit ? 'Toàn bộ' : 'Chọn chi nhánh'}
                    mode='multiple'
                    search
                    onchange={(value) => form.setFieldsValue({ branch: value })}
                  />
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
                <Form.Item<FieldsType> name='unit' label='Đơn vị' initialValue={optionsUnitProduct[26].value}>
                  <Select allowClear placeholder='Chọn đơn vị' showSearch options={optionsUnitProduct} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ModalCreateProduct
