import {
  Button,
  Col,
  Row,
  Typography,
  TableColumnType,
  Table,
  Flex,
  message,
  Popconfirm,
  Switch,
  Radio,
  Upload
} from 'antd'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
const { Title } = Typography
import { optionsBranch } from 'src/Constants/option'
import ModalCreateProduct from 'src/Modal/ModalCreateProduct'
import { ProductGeneralInterface } from 'src/Interfaces/product/product.interface'
import { useMutation, useQuery } from '@tanstack/react-query'
import productApi from 'src/Service/product/product.api'
import { PaginationType } from 'src/Types/util.type'
import { IoPencil } from 'react-icons/io5'
import { IoMdTrash } from 'react-icons/io'
import { queryClient } from 'src/main'
import DebouncedSearch from 'src/Components/DebouncedSearch'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { ProductType } from 'src/Constants/enum'
import { exportToExcel, importExcel } from 'src/Utils/xlsx.util'
import { PiMicrosoftExcelLogoLight } from 'react-icons/pi'
import OptionsBranch from 'src/Components/OptionsBranch'
import { BranchType } from 'src/Interfaces/branch/branch.interface'
import UpdateStockComponent from './Components/UpdateStockComponent'
const { Paragraph } = Typography

type ColumnsProductGeneralType = ProductGeneralInterface

const LIMIT = 9
const PAGE = 1
const STALETIME = 5 * 60 * 1000

const optionsProductType: CheckboxGroupProps<string>['options'] = [
  { label: 'Vật tư chung', value: `${ProductType.NON_CONSUMABLE}` },
  { label: 'Vật tư tiêu hao', value: `${ProductType.CONSUMABLE}` }
]

const ProductGeneral = () => {
  const [openModalCreateProduct, setOpenModalCreateProduct] = useState(false)
  const [productsGeneral, setProductsGeneral] = useState<ProductGeneralInterface[]>([])
  const [productsSearch, setProductsSearch] = useState<ProductGeneralInterface[]>([])
  const [filterBranch, setFilterBranch] = useState<string[]>([])
  const [productToEdit, setProductToEdit] = useState<ProductGeneralInterface | null>(null)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [optionsProductTypeSate, setOptionsProductTypeState] = useState<number>(ProductType.NON_CONSUMABLE)
  const [file, setFile] = useState<File | null>(null)

  const [pagination, setPagination] = useState<PaginationType>({
    page: PAGE,
    limit: LIMIT,
    total: 0
  })

  const { data, isLoading } = useQuery({
    queryKey: ['getProductsGeneral', filterBranch, pagination.page, optionsProductTypeSate],
    queryFn: async () => {
      const query =
        filterBranch.length > 0
          ? {
              page: pagination.page,
              limit: LIMIT,
              branch: encodeURI(filterBranch.join(',')),
              is_consumable: optionsProductTypeSate === ProductType.CONSUMABLE
            }
          : {
              page: pagination.page,
              limit: LIMIT,
              is_consumable: optionsProductTypeSate === ProductType.CONSUMABLE
            }
      const response = await productApi.getProduct(query)
      return response
    },
    staleTime: STALETIME
  })

  const { data: searchProduct, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['searchProduct', searchQuery, filterBranch, optionsProductTypeSate],
    queryFn: async () => {
      const query = {
        q: searchQuery,
        branch: encodeURI(filterBranch.join(',')) || '',
        is_consumable: optionsProductTypeSate === ProductType.CONSUMABLE
      }
      const response = await productApi.searchProduct(query)
      return response
    },
    enabled: !!searchQuery,
    staleTime: STALETIME
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

  const { mutate: bulkImportProducts } = useMutation({
    mutationFn: productApi.importProducts,
    onSuccess: () => {
      message.success('Nhập dữ liệu thành công !')
      queryClient.invalidateQueries({ queryKey: ['getProductsGeneral'] })
      setFile(null)
    },
    onError: (error: Error) => message.error(`Lỗi khi nhập dữ liệu: ${error.message}`),

    retry: 2
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
        page: response?.page || PAGE,
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
      width: 120,
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
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => new Date(created_at).toLocaleDateString('vi-VN')
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
      title: 'Kho',
      dataIndex: 'inStock',
      key: 'inStock',
      width: 110,
      align: 'center'
    },
    {
      title: 'Chi nhánh',
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: BranchType[]) => (
        <Paragraph
          ellipsis={{
            expandable: true,
            rows: 1
          }}
        >
          {branch?.length === optionsBranch.length + 1 ? 'Toàn bộ' : branch.map((b) => b.name).join(', ')}
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

          <UpdateStockComponent product={record} />
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
    setPagination((prev) => ({ ...prev, page: PAGE, total: 1 }))
  }

  const handleTableChange = async (page: number) => {
    goToNextPage(page)
  }

  const handleChangProductType = (value: string) => {
    setOptionsProductTypeState(parseInt(value))
  }

  const handleFileSelect = (info: any) => {
    const selectedFile = info.file.originFileObj as File
    if (!selectedFile) {
      message.error('Vui lòng chọn file XLSX!')
      return
    }
    setFile(selectedFile || null)
  }

  const importProductsFromExcel = useCallback(() => {
    importExcel<ProductGeneralInterface>({
      file: file!,
      onSuccess: (products) => bulkImportProducts(products),
      mapData: (item: any) => ({
        code: item['Mã sản phẩm'],
        is_active: item['Trạng thái'] === 'Hoạt động' ? true : false,
        name: item['Tên sản phẩm'],
        category: item['Danh mục'],
        price: Number(item['Giá']) || 0,
        unit: item['Đơn vị'],
        inStock: Number(item['Hàng tồn']) || 0,
        branch: item['Chi nhánh'] === 'Toàn bộ' ? optionsBranch.map((b) => b.value) : item['Chi nhánh'].split(', ')
      })
    })
  }, [file, bulkImportProducts])

  useEffect(() => {
    if (file) {
      importProductsFromExcel()
    }
  }, [file, importProductsFromExcel])

  const exportProductsToExcel = useCallback(() => {
    exportToExcel<ProductGeneralInterface>({
      data: productsGeneral || [],
      filename: `Sản-phẩm_${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Products',
      headers: ['Mã sản phẩm', 'Trạng thái', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Đơn vị', 'Hàng tồn', 'Chi nhánh'],
      columnWidths: [15, 15, 25, 15, 15, 10, 10, 30],
      mapData: (product) => ({
        'Mã sản phẩm': product.code,
        'Trạng thái': product.is_active ? 'Hoạt động' : 'Không hoạt động',
        'Tên sản phẩm': product.name,
        'Danh mục': product.category,
        Giá: product.price,
        'Đơn vị': product.unit,
        'Hàng tồn': product.inStock,
        'Chi nhánh': product.branch.length === optionsBranch.length ? 'Toàn bộ' : product.branch.join(', ')
      })
    })
  }, [productsGeneral])

  return (
    <Fragment>
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
          <OptionsBranch mode='multiple' search onchange={handleFilterBranch} />
        </Col>
        <Col sm={24} md={4}>
          <DebouncedSearch
            placeholder='Tìm kiếm sản phẩm'
            onSearch={(value) => handleSearch(value)}
            debounceTime={1000}
          />
        </Col>
        <Col md={4}>
          <Radio.Group
            defaultValue={`${ProductType.NON_CONSUMABLE}`}
            options={optionsProductType}
            optionType='button'
            buttonStyle='solid'
            onChange={(e) => handleChangProductType(e.target.value)}
          />
        </Col>
        <Col md={10}>
          <Flex gap={20} justify='end'>
            <Button
              icon={<PiMicrosoftExcelLogoLight size={20} />}
              onClick={exportProductsToExcel}
              type='dashed'
              style={{ width: 150 }}
              title='Xuất Excel'
            >
              Xuất Excel
            </Button>
            <Upload
              beforeUpload={(uploadedFile) => {
                handleFileSelect({ file: { originFileObj: uploadedFile } })
                return false
              }}
              showUploadList={true}
            >
              <Button type='dashed'>Chọn file CSV</Button>
            </Upload>
          </Flex>
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
        is_consumable={optionsProductTypeSate === ProductType.CONSUMABLE}
        productToEdit={productToEdit as ProductGeneralInterface | null}
        open={openModalCreateProduct}
        setProductToEdit={setProductToEdit}
        close={setOpenModalCreateProduct}
      />
    </Fragment>
  )
}

export default ProductGeneral
