import { useMutation } from '@tanstack/react-query'
import { Col, InputNumber, Popconfirm, Row, Typography, Button, message } from 'antd'
import { HttpStatusCode } from 'axios'
import { useState } from 'react'
import { MdOutlineInventory2 } from 'react-icons/md'
import { Fragment } from 'react/jsx-runtime'
import createOptimisticUpdateHandler from 'src/Function/product/createOptimisticUpdateHandler'
import { ProductGeneralInterface, UpdateProductStockRequestBody } from 'src/Interfaces/product/product.interface'
import { queryClient } from 'src/main'
import productApi from 'src/Service/product/product.api'

interface UpdateStockComponentProps {
  product: ProductGeneralInterface
}

const UpdateStockComponent = ({ product }: UpdateStockComponentProps) => {
  const [inStockNewValue, setInStockNewValue] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  useMutation({
    mutationFn: (data: UpdateProductStockRequestBody) => productApi.updateProductStock(data),
    onMutate: async (data) => {
      return createOptimisticUpdateHandler<UpdateProductStockRequestBody>(queryClient, ['getProductsGeneral'], data)()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
      message.success('Cập nhật kho thành công !')
    },
    onError: (error, _, context) => {
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
    }
  })

  const handleConfirm = () => {
    if (inStockNewValue !== null) {
      const isIncrease = inStockNewValue >= 0
      const newStock = isIncrease ? product.inStock + inStockNewValue : product.inStock - inStockNewValue
      const data: UpdateProductStockRequestBody = {
        _id: product._id,
        inStockOldValue: product.inStock,
        inStockNewValue: Math.abs(inStockNewValue),
        isIncrease: isIncrease,
        newStock: newStock
      }
      productApi.updateProductStock(data)
    }
    setOpen(false)
    setInStockNewValue(null)
  }

  const handleCancel = () => {
    setOpen(false)
    setInStockNewValue(null)
  }

  const renderContent = () => (
    <Fragment>
      <Row gutter={[16, 12]} style={{ width: 200 }}>
        <Col span={24}>
          <Typography.Text strong>Kho hiện tại: </Typography.Text>
          <Typography.Text>{product.inStock.toLocaleString('vi-VN')}</Typography.Text>
        </Col>
        <Col span={24}>
          <InputNumber
            value={inStockNewValue}
            onChange={(value) => setInStockNewValue(value)}
            style={{ width: '100%', marginBottom: 10, marginTop: 10 }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            parser={(value) => (value ? Number(value.replace(/\./g, '')) : 0)}
            placeholder='Nhập số lượng mới'
            min={0}
            status={inStockNewValue === null ? '' : inStockNewValue < 0 ? 'error' : ''}
            onKeyPress={(e) => {
              const charCode = e.key.charCodeAt(0)
              if ((charCode < 48 || charCode > 57) && charCode !== 8 && charCode !== 13) {
                e.preventDefault()
              }
            }}
          />
        </Col>
      </Row>
    </Fragment>
  )

  return (
    <Fragment>
      <Row gutter={16} align='middle'>
        <Col>
          <Popconfirm
            title={renderContent()}
            okText='Xác nhận'
            cancelText='Hủy'
            placement='top'
            open={open}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            okButtonProps={{ disabled: inStockNewValue === null || inStockNewValue < 0 }}
          >
            <Button icon={<MdOutlineInventory2 />} onClick={() => setOpen(true)} className='update-stock-button' />
          </Popconfirm>
        </Col>
      </Row>
    </Fragment>
  )
}

export default UpdateStockComponent
