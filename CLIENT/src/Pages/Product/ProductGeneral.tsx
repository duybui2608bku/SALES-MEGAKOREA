import { Button, Col, Row, Select, Typography, Input, TableColumnType, Table, Flex, message, Popconfirm } from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
const { Title } = Typography
import { optionsBranch } from 'src/Constants/option'
import ModalCreateProduct from 'src/Modal/ModalCreateProduct'
const { Search } = Input
import { ProductGeneralInterface } from 'src/Interfaces/product/product.interface'
import { useMutation, useQuery } from '@tanstack/react-query'
import productApi from 'src/Service/product/product.api'
import { PaginationType } from 'src/Types/util.type'
import { IoPencil } from 'react-icons/io5'
import { IoMdTrash } from 'react-icons/io'
import { queryClient } from 'src/main'

type ColumnsProductGeneralType = ProductGeneralInterface

const LIMIT = 20
const PAGE = 1

const ProductGeneral = () => {
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false)
  const [productsGeneral, setProductsGeneral] = useState<ProductGeneralInterface[]>([])
  const [filterBranch, setFilterBranch] = useState<string[]>([])

  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['getProductsGeneral', filterBranch],
    queryFn: async () => {
      const query =
        filterBranch.length > 0
          ? {
              page: PAGE,
              limit: LIMIT,
              branch: encodeURI(filterBranch.join(','))
            }
          : {
              page: PAGE,
              limit: LIMIT
            }
      const response = await productApi.getProduct(query)
      return response
    }
  })

  const deleteProductMutation = useMutation({
    mutationFn: productApi.deleleProduct,
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi tạo sản phẩm: ${error.message}`)
    }
  })

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id)
  }

  useEffect(() => {
    if (data?.data.success) {
      const response = data?.data?.result
      setProductsGeneral(response?.products)
      setPagination({
        page: response?.page,
        limit: response?.limit,
        total: response?.total
      })
    }
  }, [data])

  const columnsProductGeneral: TableColumnType<ColumnsProductGeneralType>[] = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 150
    },

    {
      title: 'Hàng tồn',
      dataIndex: 'inStock',
      key: 'inStock',
      width: 150
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: string[]) => (branch.length === optionsBranch.length ? 'Toàn bộ' : branch.join(', '))
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: ProductGeneralInterface) => (
        <Flex gap={10}>
          <Popconfirm
            title='Bạn có chắc chắn muốn xóa sản phẩm này không?'
            onConfirm={() => handleDeleteProduct(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <Button title='Sửa' icon={<IoPencil color='blue' />} />
          </Popconfirm>
          <Button title='Xóa' icon={<IoMdTrash color='red' />} />
        </Flex>
      ),
      width: 130
    }
  ]

  const handleFilterBranch = (value: string[]) => {
    setFilterBranch(value)
  }

  return (
    <>
      <Row
        style={{
          padding: '20px'
        }}
        gutter={[16, 16]}
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
        <Col sm={24} md={3}>
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
        <Col sm={24} md={3}>
          <Select
            placeholder='Chọn chi nhánh'
            mode='multiple'
            onChange={handleFilterBranch}
            style={{ width: '100%' }}
            showSearch
            options={optionsBranch}
          />
        </Col>
        <Col sm={24} md={4}>
          <Search placeholder='Tìm sản phẩm' enterButton />
        </Col>
      </Row>
      <Row
        style={{
          padding: '20px'
        }}
        gutter={16}
      >
        <Col span={24}>
          <Table loading={isLoading} bordered dataSource={productsGeneral} columns={columnsProductGeneral} />
        </Col>
      </Row>
      <ModalCreateProduct open={openModalCreateProduct} close={setOpenModalCreateProduct} />
    </>
  )
}

export default ProductGeneral
