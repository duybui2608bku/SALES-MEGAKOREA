import { Button, Typography } from 'antd'
import { ReactNode, useState, useEffect } from 'react'
const { Text } = Typography

interface ExpandableParagraphProps {
  text: string
  rows?: number
  moreText?: string | ReactNode
  lessText?: string | ReactNode
}

const ExpandableParagraph = ({
  text,
  rows = 2,
  moreText = 'Xem thêm',
  lessText = 'Thu gọn'
}: ExpandableParagraphProps) => {
  const [expanded, setExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)

  // Tính toán xem có nên hiển thị nút hay không
  useEffect(() => {
    // Ước lượng đơn giản về số ký tự trên mỗi dòng
    const charsPerLine = 15 // Điều chỉnh số này dựa trên font size và width của cột
    const estimatedLines = Math.ceil(text.length / charsPerLine)

    setShowButton(estimatedLines > rows)
  }, [text, rows])

  // Hàm để cắt text thành số dòng cụ thể
  const truncateText = (text: string, rows: number): string => {
    const charsPerLine = 15 // Điều chỉnh số này dựa trên font size và width của cột
    const maxChars = rows * charsPerLine

    if (text.length <= maxChars) return text

    return text.substring(0, maxChars) + '...'
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
        {!expanded && showButton ? truncateText(text, rows) : text}
      </Text>

      {showButton && (
        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <Button
            type='link'
            size='small'
            onClick={() => setExpanded(!expanded)}
            style={{ padding: 0, height: 'auto', lineHeight: 1 }}
          >
            {expanded ? lessText : moreText}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ExpandableParagraph
