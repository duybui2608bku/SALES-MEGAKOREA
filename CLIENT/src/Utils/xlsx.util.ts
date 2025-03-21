import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { message } from 'antd'

interface ExportExcelConfig<T> {
  data: T[]
  filename?: string
  sheetName?: string
  headers?: string[]
  columnWidths?: number[]
  mapData?: (item: T) => Record<string, unknown>
}

interface ImportExcelConfig<T> {
  file: File
  onSuccess: (data: T[]) => void
  onError?: (error: Error) => void
  mapData: (item: any) => T
  sheetIndex?: number
}

function exportToExcel<T>({
  data,
  filename = `Export_${new Date().toISOString().slice(0, 10)}.xlsx`,
  sheetName = 'Sheet1',
  headers,
  columnWidths,
  mapData
}: ExportExcelConfig<T>): void {
  try {
    if (!data?.length) {
      message.warning('Không có dữ liệu để xuất!')
      return
    }
    const exportData = mapData ? data.map(mapData) : data

    const worksheet = headers
      ? XLSX.utils.json_to_sheet(exportData, { header: headers })
      : XLSX.utils.json_to_sheet(exportData)
    if (columnWidths) {
      worksheet['!cols'] = columnWidths.map((wch) => ({ wch }))
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, filename)
  } catch (error) {
    message.error(`Lỗi khi xuất Excel: ${(error as Error).message}`)
    console.error('Export Excel Error:', error)
  }
}

function importExcel<T>({ file, onSuccess, onError, mapData, sheetIndex = 0 }: ImportExcelConfig<T>): void {
  if (!file) {
    const error = new Error('Vui lòng chọn file Excel trước!')
    message.error(error.message)
    onError?.(error)
    return
  }

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = evt.target?.result as ArrayBuffer
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[sheetIndex]
      if (!sheetName) {
        throw new Error('File Excel không có sheet hợp lệ')
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1) as any[]

      if (!headers || headers.length === 0) {
        throw new Error('File Excel không có dòng tiêu đề')
      }

      const formattedData = rows
        .filter((row) => row?.some((cell: unknown) => cell !== undefined && cell !== ''))
        .map((row) => {
          const rowData: Record<string, unknown> = {}
          headers.forEach((header, index) => {
            rowData[header] = row[index]
          })
          return mapData(rowData)
        })

      if (formattedData.length === 0) {
        throw new Error('Không có dữ liệu hợp lệ để nhập')
      }

      onSuccess(formattedData)
    } catch (error) {
      message.error((error as Error).message)
      onError?.(error as Error)
    }
  }

  reader.onerror = () => {
    const error = new Error('Lỗi khi đọc file Excel')
    message.error(error.message)
    onError?.(error)
  }

  reader.readAsArrayBuffer(file)
}

export { exportToExcel, importExcel }
