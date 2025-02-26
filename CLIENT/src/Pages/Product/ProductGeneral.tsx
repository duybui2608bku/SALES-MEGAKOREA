import { Button, Col, Row, Select, Typography, Input, TableColumnType } from 'antd'
import { useState } from 'react'
import { GoPlus } from 'react-icons/go'
const { Title } = Typography
import { optionsBranch } from 'src/Constants/option'
import ModalCreateProduct from 'src/Modal/ModalCreateProduct'
const { Search } = Input
import { ProductGeneralInterface } from 'src/Interfaces/product/product.interface'
import { useQuery } from '@tanstack/react-query'

type ColumnsProductGeneralType = ProductGeneralInterface

const ProductGeneral = () => {
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false)
  const [productsGeneral, setProductsGeneral] = useState<ProductGeneralInterface[]>([])

  // const { data } = useQuery({
  //   queryKey:['getProductsGeneral'],
  //   queryFn:
  // })

  const columnsProductGeneral: TableColumnType<ColumnsProductGeneralType> = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: 'Số lượng tồn',
      dataIndex: 'inStock',
      key: 'inStock'
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: string[]) => {
        branch.length === optionsBranch.length - 1 ? optionsBranch[9].value : branch.join(', ')
      }
    }
  ]

  return (
    <>
      <Row
        style={{
          padding: '20px'
        }}
        gutter={16}
      >
        <Col span={24}>
          <Title
            style={{
              margin: '16px 0'
            }}
            className='center-div'
            level={2}
          >
            Danh Sách Sản Phẩm
          </Title>
        </Col>
        <Col span={3}>
          <Button
            onClick={() => setOpenModalCreateProduct(true)}
            type='primary'
            style={{ width: '100%' }}
            icon={<GoPlus size={20} />}
            title='Thêm sản phẩm'
          >
            Thêm sản phẩm
          </Button>
        </Col>
        <Col span={3}>
          <Select
            placeholder='Chọn chi nhánh'
            mode='multiple'
            defaultValue={optionsBranch[9].value}
            defaultActiveFirstOption
            style={{ width: '100%' }}
            showSearch
            options={optionsBranch}
          />
        </Col>
        <Col span={4}>
          <Search placeholder='Tìm sản phẩm' enterButton />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}></Col>
      </Row>
      <ModalCreateProduct open={openModalCreateProduct} close={setOpenModalCreateProduct} />
    </>
  )
}

export default ProductGeneral
