import { Checkbox, Col, Select, Space, Tag, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
const { Text } = Typography

interface HiddenColumnsProps {
  colSpan?: number
  tableColumns: any
  STORAGE_KEY: string
  style?: object
  onNewColums: (value: any) => void
}

const HiddenColumns = (props: HiddenColumnsProps) => {
  const { colSpan = 6, tableColumns = [], STORAGE_KEY, style = {}, onNewColums } = props
  // Hàm đọc trạng thái cột từ localStorage
  const getStoredColumns = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      return storedData ? JSON.parse(storedData) : null
    } catch (error) {
      console.error('Lỗi khi đọc từ localStorage: ', error)
      return null
    }
  }

  // Hàm lưu trạng thái cột vào localStorage
  const saveColumnsToStorage = (columns: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
    } catch (error) {
      console.error('Lỗi khi lưu vào localStorage: ', error)
    }
  }

  // Handle check options for hidden columns
  const defaultColumns = tableColumns.map((item: any) => item.key).filter(Boolean)
  const storedColumns = getStoredColumns()
  const validStoredColumns = storedColumns
    ? storedColumns.filter((col: any) => defaultColumns.includes(col))
    : defaultColumns
  const [checkedList, setCheckedList] = useState(validStoredColumns)
  const options = tableColumns
    .filter((tableColumns: { key?: string; title?: string }) => tableColumns.key && tableColumns.title)
    .map(({ key, title }: { key: string; title: string }) => ({
      label: title,
      value: key
    }))

  const handleColumnsChange = (value: string[]) => {
    setCheckedList(value)
    saveColumnsToStorage(value)
  }

  const handleSelectAll = (e: any) => {
    const allValues = options.map((opt: any) => opt.value as string)
    const newValues = e.target.checked ? allValues : []
    setCheckedList(newValues)
    saveColumnsToStorage(newValues)
  }

  useEffect(() => {
    const newColumns = tableColumns.map((item: any) => ({
      ...item,
      hidden: !checkedList.includes(item.key as string)
    }))
    // Gọi hàm callback để truyền dữ liệu ra cho Component cha
    onNewColums(newColumns)
  }, [checkedList, tableColumns, onNewColums])

  const customRender = (props: any) => {
    const { label, closable, onClose } = props

    // Hiển thị bình thường cho các trường hợp khác
    return (
      <Tag color='blue' closable={closable} onClose={onClose} style={{ marginRight: 5 }}>
        {label} cột đã được chọn
      </Tag>
    )
  }

  return (
    <Col xs={colSpan}>
      <Space direction='vertical' style={style}>
        <Text strong style={{ marginRight: '5px' }}>
          Chọn các cột hiển thị:{' '}
        </Text>
        <Tooltip title='Chọn tất cả'>
          <Checkbox
            checked={checkedList.length === options.length}
            indeterminate={checkedList.length > 0 && checkedList.length < options.length}
            onChange={handleSelectAll}
          />
        </Tooltip>

        <Select
          mode='multiple'
          style={{ width: '250px' }}
          placeholder={checkedList.length > 0 ? `Đã chọn ${checkedList.length} mục` : 'Chọn các cột hiển thị'}
          value={checkedList}
          onChange={handleColumnsChange}
          options={options}
          allowClear
          maxTagCount={0}
          dropdownRender={(menu) => (
            <div>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e8e8e8' }}>
                <Text>
                  Cột hiển thị: {checkedList.length}/{options.length}
                </Text>
              </div>
              {menu}
            </div>
          )}
          tagRender={customRender}
        />
      </Space>
    </Col>
  )
}

export default HiddenColumns
