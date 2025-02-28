import { Button, Col, Row, Select, Typography, TableColumnType, Table, Flex, message, Popconfirm, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
const { Title } = Typography
import { optionsBranch } from 'src/Constants/option'
import ModalCreateProduct from 'src/Modal/ModalCreateProduct'
import { ProductGeneralInterface, UpdateProductBody } from 'src/Interfaces/product/product.interface'
import { useMutation, useQuery } from '@tanstack/react-query'
import productApi from 'src/Service/product/product.api'
import { PaginationType } from 'src/Types/util.type'
import { IoPencil } from 'react-icons/io5'
import { IoMdTrash } from 'react-icons/io'
import { queryClient } from 'src/main'
import DebouncedSearch from 'src/Components/DebouncedSearch'
const { Paragraph } = Typography

type ColumnsProductGeneralType = ProductGeneralInterface

const LIMIT = 9
const PAGE = 1

const ProductGeneral = () => {
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false)
  const [productsGeneral, setProductsGeneral] = useState<ProductGeneralInterface[]>([])
  const [productsSearch, setProductsSearch] = useState<ProductGeneralInterface[]>([])
  const [filterBranch, setFilterBranch] = useState<string[]>([])
  const [productToEdit, setProductToEdit] = useState<UpdateProductBody | null>(null)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['getProductsGeneral', filterBranch, pagination.page],
    queryFn: async () => {
      const query =
        filterBranch.length > 0
          ? {
              page: pagination.page,
              limit: LIMIT,
              branch: encodeURI(filterBranch.join(','))
            }
          : {
              page: pagination.page,
              limit: LIMIT
            }
      const response = await productApi.getProduct(query)
      return response
    },
    staleTime: 5 * 60 * 1000
  })

  const { data: searchProduct, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchProduct', searchQuery],
    queryFn: async () => {
      const query = {
        q: searchQuery,
        branch: encodeURI(filterBranch.join(',')) || ''
      }
      const response = await productApi.searchProduct(query)
      return response
    },
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000
  })

  const { mutate: deleteProduct, isPending } = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      message.success('Xóa sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
    },
    onError: (error: Error) => {
      message.error(`Lỗi khi xóa sản phẩm: ${error.message}`)
    }
  })

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id)
  }

  const handleUpdateProduct = (product: ProductGeneralInterface) => {
    setProductToEdit(product)
    setOpenModalCreateProduct(true)
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

  useEffect(() => {
    if (searchProduct?.data.success) {
      const products = searchProduct?.data.result
      setProductsSearch(products)
    }
  }, [searchProduct])

  const handleUpdateStatusProduct = async (id: string, isActive: boolean) => {
    try {
      setLoadingStatus(id)
      const response = await productApi.updateProduct({
        _id: id,
        is_active: !isActive
      })
      if (response.data.success) {
        setLoadingStatus('')
        message.success('Cập nhật trạng thái sản phẩm thành công!')
        queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
      }
    } catch (error) {
      setLoadingStatus('')
      message.error(`Lỗi khi cập nhật trạng thái sản phẩm`)
    }
  }

  console.log('render ProductGeneral')

  const columnsProductGeneral: TableColumnType<ColumnsProductGeneralType>[] = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: ProductGeneralInterface) => (
        <Flex justify='center'>
          <Switch
            checked={isActive}
            loading={loadingStatus === record._id}
            onChange={() => handleUpdateStatusProduct(record._id, isActive)}
          />
        </Flex>
      )
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
      render: (branch: string[]) => (
        <Paragraph
          ellipsis={{
            expandable: true,
            rows: 1
          }}
        >
          {branch.length === optionsBranch.length ? 'Toàn bộ' : branch.join(', ')}
        </Paragraph>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (_: unknown, record: ProductGeneralInterface) => (
        <Flex gap={10}>
          <Button onClick={() => handleUpdateProduct(record)} title='Sửa' icon={<IoPencil color='blue' />} />
          <Popconfirm
            okButtonProps={{ loading: isPending }}
            title={
              <Typography>
                Bạn có chắc chắn muốn <div>xóa sản phẩm này không?</div>
              </Typography>
            }
            onConfirm={() => handleDeleteProduct(record._id)}
            okText='Có'
            cancelText='Không'
          >
            <Button title='Xóa' icon={<IoMdTrash color='red' />} />
          </Popconfirm>
        </Flex>
      ),
      width: 130
    }
  ]

  const handleFilterBranch = (value: string[]) => {
    setFilterBranch(value)
  }

  const goToNextPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page
    }))
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
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
          <DebouncedSearch
            placeholder='Tìm kiếm sản phẩm'
            onSearch={(value) => handleSearch(value)}
            debounceTime={1000}
          />
        </Col>
      </Row>
      <Row
        style={{
          padding: '20px'
        }}
        gutter={16}
      >
        <Col span={24}>
          <Table
            loading={isLoading || isLoadingSearch}
            bordered
            dataSource={searchQuery.length > 0 ? productsSearch : productsGeneral}
            columns={columnsProductGeneral}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: handleTableChange,
              position: ['bottomCenter']
            }}
          />
        </Col>
      </Row>
      <ModalCreateProduct
        productToEdit={productToEdit as UpdateProductBody | null}
        open={openModalCreateProduct}
        setProductToEdit={setProductToEdit}
        close={setOpenModalCreateProduct}
      />
    </>
  )
}

export default ProductGeneral
