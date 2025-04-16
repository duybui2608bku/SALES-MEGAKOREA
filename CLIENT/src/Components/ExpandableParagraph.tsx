import { Button, Row, Tooltip, Typography } from 'antd'
import { ReactNode, useState } from 'react'
const { Paragraph } = Typography

interface ExpandableParagraphProps {
  text: string
  rows?: number
  moreText?: string | ReactNode
  lessText?: string | ReactNode
}

const ExpandableParagraph = ({ text, rows, moreText, lessText }: ExpandableParagraphProps) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpand = () => setExpanded(!expanded)

  return (
    <Row style={{ position: 'relative', paddingRight: '20px' }}>
      <Paragraph ellipsis={!expanded ? { rows: rows, expandable: false } : false}>{text}</Paragraph>
      <Tooltip title={expanded ? 'Thu gọn' : 'Xem thêm'}>
        <Button
          style={{
            color: '#1677ff',
            position: 'absolute',
            top: '-5px',
            right: '-15px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent'
          }}
          onClick={toggleExpand}
        >
          {expanded ? lessText : moreText}
        </Button>
      </Tooltip>
    </Row>
  )
}

export default ExpandableParagraph
