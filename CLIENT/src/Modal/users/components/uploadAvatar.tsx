import { Button, message, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import userApi from 'src/Service/user/user.api'
import { useEffect } from 'react'
import { RcFile } from 'antd/es/upload'

// byte -> kb -> mb
// 1MB = 1024 KB
// 1KB = 1024 byte
// file.size trả về giá trị byte
const ONE_BYTE = 1024
const ONE_MB = 1

interface uploadAvatarProps {
  setImageUrl: (value: string) => void
  setIsPendingUploadAvatar: (value: boolean) => void
}

const UploadAvatar = (prop: uploadAvatarProps) => {
  const { setImageUrl, setIsPendingUploadAvatar } = prop

  // Xử lý upload file ảnh
  const formData: FormData = new FormData()
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      formData.append('image', file)
      const response = await userApi.uploadAvatarUser(formData)

      if (!response) {
        message.error('Upload hình ảnh thất bại!')
      }

      return response
    },
    onSuccess: (data) => {
      setImageUrl(data.data.result[0].url)
      message.success('Tải hình ảnh lên thành công!')
    }
  })

  const { mutate: dataImg, isPending: isPendingUploadAvatar } = uploadAvatarMutation
  useEffect(() => {
    setIsPendingUploadAvatar(isPendingUploadAvatar)
  })

  const handleUpload = (file: File) => {
    dataImg(file)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customRequest = (options: any) => {
    const { file } = options
    handleUpload(file as File)
  }

  const validateImage = (file: RcFile) => {
    // Check file có phải là hình ảnh không
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Chỉ được phép tải lên định dạng hình ảnh!')
      return Upload.LIST_IGNORE
    }

    // Check dung lượng (<= 1MB)
    const isLt1MB = file.size / ONE_BYTE / ONE_BYTE <= ONE_MB
    if (!isLt1MB) {
      message.error('Dung lượng hình ảnh phải nhỏ hơn hoặc bằng 1MB!')
      return Upload.LIST_IGNORE
    }

    return true
  }

  return (
    <Upload
      fileList={[]}
      style={{ display: 'block', width: '100%' }}
      showUploadList={false}
      maxCount={1}
      customRequest={customRequest}
      beforeUpload={(file) => validateImage(file)}
    >
      <Button
        block
        style={{
          fontSize: '12px',
          backgroundColor: 'white',
          color: '#000',
          border: '1px solid lightgray'
        }}
        type='primary'
        icon={<UploadOutlined />}
      >
        Upload avatar
      </Button>
    </Upload>
  )
}

export default UploadAvatar
