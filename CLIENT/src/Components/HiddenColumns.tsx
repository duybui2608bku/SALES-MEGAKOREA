import React, { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Drawer, Empty, Flex, Input, List, Switch, Tooltip, Typography } from 'antd'
import {
  ColumnHeightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  SettingOutlined
} from '@ant-design/icons'

const { Text } = Typography

interface HiddenColumnsProps {
  colSpan?: number
  tableColumns: any[]
  STORAGE_KEY: string
  style?: React.CSSProperties
  onNewColums: (value: any) => void
}

const HiddenColumns: React.FC<HiddenColumnsProps> = (props) => {
  const { tableColumns = [], STORAGE_KEY, style = {}, onNewColums } = props

  // State
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null)

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

  // Xử lý cột được chọn
  const defaultColumns = tableColumns.map((item: any) => item.key).filter(Boolean)
  const storedColumns = getStoredColumns()
  const validStoredColumns = storedColumns
    ? storedColumns.filter((col: any) => defaultColumns.includes(col))
    : defaultColumns
  const [checkedList, setCheckedList] = useState(validStoredColumns)

  // Lọc các option hợp lệ
  const options = tableColumns
    .filter((col: any) => col.key && col.title)
    .map(({ key, title }: { key: string; title: string }) => ({
      label: title,
      value: key
    }))

  // Lọc danh sách hiển thị theo search
  const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(searchText.toLowerCase()))

  // Xử lý thay đổi trạng thái hiển thị của một cột
  const toggleColumn = (columnKey: string) => {
    const newCheckedList = checkedList.includes(columnKey)
      ? checkedList.filter((key: any) => key !== columnKey)
      : [...checkedList, columnKey]

    setCheckedList(newCheckedList)
    saveColumnsToStorage(newCheckedList)
  }

  // Xử lý chọn tất cả / bỏ chọn tất cả
  const handleSelectAll = () => {
    const allValues = options.map((opt) => opt.value)
    setCheckedList(allValues)
    saveColumnsToStorage(allValues)
  }

  const handleUnselectAll = () => {
    setCheckedList([])
    saveColumnsToStorage([])
  }

  // Cập nhật columns cho component cha
  useEffect(() => {
    const newColumns = tableColumns.map((item: any) => ({
      ...item,
      hidden: !checkedList.includes(item.key)
    }))
    onNewColums(newColumns)
  }, [checkedList, tableColumns, onNewColums])

  // Tính số cột đã hiển thị và ẩn
  const visibleColumnsCount = checkedList.length
  const hiddenColumnsCount = options.length - checkedList.length

  return (
    <Fragment>
      {/* Button to open column settings */}
      <Tooltip title='Tùy chỉnh cột hiển thị'>
        <Badge count={hiddenColumnsCount} size='small' offset={[-5, 5]} showZero={false}>
          <Button
            type='text'
            icon={<ColumnHeightOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: hiddenColumnsCount > 0 ? '#1890ff' : undefined,
              ...style
            }}
          >
            <Text style={{ marginLeft: 5, fontSize: '13px' }}>Tuỳ chỉnh cột hiển thị</Text>
          </Button>
        </Badge>
      </Tooltip>

      {/* Drawer for column settings */}
      <Drawer
        title={
          <Flex align='start' style={{ flexDirection: 'column', gap: '20px' }}>
            <Flex align='center' gap={8}>
              <SettingOutlined style={{ color: '#1890ff' }} />
              <Text strong>Tùy chỉnh hiển thị cột</Text>
            </Flex>
            <Flex align='center' gap={50} style={{ marginLeft: '25px' }}>
              <Badge count={visibleColumnsCount} style={{ backgroundColor: '#52c41a' }} showZero overflowCount={99}>
                <Text style={{ marginRight: 5 }}>Hiển thị</Text>
              </Badge>
              <Badge
                count={hiddenColumnsCount}
                style={{ backgroundColor: hiddenColumnsCount > 0 ? '#ff4d4f' : '#d9d9d9' }}
                showZero
                overflowCount={99}
              >
                <Text style={{ marginRight: 5 }}>Ẩn</Text>
              </Badge>
            </Flex>
          </Flex>
        }
        placement='right'
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Flex gap={8}>
            <Tooltip title='Hiển thị tất cả'>
              <Button
                style={
                  visibleColumnsCount !== options.length ? { fontSize: '20px', color: '#52c41a' } : { fontSize: '20px' }
                }
                type='text'
                icon={<EyeOutlined />}
                onClick={handleSelectAll}
                disabled={visibleColumnsCount === options.length}
              />
            </Tooltip>
            <Tooltip title='Ẩn tất cả'>
              <Button
                style={{ fontSize: '20px', color: '#ff4d4f' }}
                type='text'
                icon={<EyeInvisibleOutlined />}
                onClick={handleUnselectAll}
                disabled={visibleColumnsCount === 0}
              />
            </Tooltip>
          </Flex>
        }
        footer={
          <Flex justify='space-between' align='center'>
            <Text type='secondary'>
              {visibleColumnsCount}/{options.length} cột đang hiển thị
            </Text>
            <Button type='primary' onClick={() => setDrawerVisible(false)}>
              Hoàn tất
            </Button>
          </Flex>
        }
      >
        {/* Search filter */}
        <Input
          placeholder='Tìm kiếm cột...'
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {/* Column list */}
        {filteredOptions.length > 0 ? (
          <List
            className='column-selector-list'
            itemLayout='horizontal'
            dataSource={filteredOptions}
            style={{
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto',
              paddingRight: 8
            }}
            renderItem={(option) => {
              const isChecked = checkedList.includes(option.value)
              const isHovered = hoveredColumn === option.value

              return (
                <List.Item
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 8,
                    cursor: 'pointer',
                    backgroundColor: isHovered
                      ? isChecked
                        ? '#e6f7ff'
                        : '#fff0f0'
                      : isChecked
                        ? '#f0f9ff'
                        : '#f9f9f9',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${isChecked ? '#91caff' : '#ffccc7'}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={() => setHoveredColumn(option.value)}
                  onMouseLeave={() => setHoveredColumn(null)}
                  onClick={() => toggleColumn(option.value)}
                >
                  <Flex justify='space-between' align='center' style={{ width: '100%' }}>
                    <Flex align='center' gap={8}>
                      {isChecked ? (
                        <EyeOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <Text>{option.label}</Text>
                    </Flex>

                    <Switch
                      size='small'
                      checked={isChecked}
                      // onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleColumn(option.value)}
                      checkedChildren={<CheckCircleFilled />}
                      unCheckedChildren={<CloseCircleFilled />}
                    />
                  </Flex>
                </List.Item>
              )
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Không tìm thấy cột nào' />
        )}
      </Drawer>
    </Fragment>
  )
}

export default HiddenColumns
