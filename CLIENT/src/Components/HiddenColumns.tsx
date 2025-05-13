interface HiddenColumnsProps {
  colSpan: number
  tableColumns: any
}

const HiddenColumns = (props: HiddenColumnsProps) => {
  const { colSpan = 6, tableColumns = [] } = props
}

export default HiddenColumns
