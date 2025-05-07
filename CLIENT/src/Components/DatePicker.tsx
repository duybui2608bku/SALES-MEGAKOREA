import React, { Fragment } from 'react'
import { DatePicker as AntdDatePicker } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

interface DatePickerProps {
  isRange?: boolean
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disableDate?: boolean
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  isRange = false,
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disableDate
}) => {
  // Hàm xử lý thay đổi giá trị
  const handleChange = (date: Dayjs | [Dayjs | null, Dayjs | null] | null) => {
    if (!date) {
      onChange?.('')
      return
    }

    if (isRange && Array.isArray(date)) {
      // Nếu là RangePicker, kiểm tra và format giá trị
      const [start, end] = date
      if (start && end) {
        //   const rangeValue = `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`
        const rangeValue = `${dayjs(start).hour(12).minute(0).second(0).toISOString()} - ${dayjs(end).hour(12).minute(0).second(0).toISOString()}`
        onChange?.(rangeValue)
      } else {
        onChange?.('') // Nếu một trong hai giá trị là null, trả về chuỗi rỗng
      }
    } else if (!isRange && !Array.isArray(date)) {
      // Nếu là DatePicker đơn, format giá trị
      // const singleValue = date.format('YYYY-MM-DD')
      const singleValue = dayjs(date).hour(12).minute(0).second(0).toISOString()
      onChange?.(singleValue)
    }
  }

  // Parse giá trị từ props value
  const parsedValue = value
    ? isRange
      ? (value.split(' - ').map((date) => (date ? dayjs(date, 'YYYY-MM-DD') : null)) as [Dayjs | null, Dayjs | null])
      : dayjs(value, 'YYYY-MM-DD')
    : undefined

  return (
    <Fragment>
      {isRange ? (
        <AntdDatePicker.RangePicker
          disabledDate={disableDate ? (current) => current && current < dayjs().endOf('day') : undefined}
          style={{ width: '100%' }}
          placeholder={[placeholder, placeholder]}
          value={parsedValue as [Dayjs | null, Dayjs | null]} // Kiểu phù hợp với RangePicker
          onChange={(dates) => handleChange(dates)}
          format='YYYY-MM-DD'
        />
      ) : (
        <AntdDatePicker
          disabledDate={disableDate ? (current) => current && current > dayjs().endOf('day') : undefined}
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={parsedValue as Dayjs}
          onChange={(date) => handleChange(date)}
          format='YYYY-MM-DD'
        />
      )}
    </Fragment>
  )
}

export default DatePickerComponent
