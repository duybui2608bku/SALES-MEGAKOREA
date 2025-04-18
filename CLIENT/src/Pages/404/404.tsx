import { Button, Result, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleNavigateHomePage = () => {
    navigate('/')
  }
  //   const handlePrevPage = () => {
  //     navigate(-1)
  //   }

  return (
    <Row
      justify='center'
      align='middle'
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Col xs={22} sm={16} md={12} lg={8}>
        <Result
          status='404'
          title={
            <h1
              style={{
                fontSize: '72px',
                color: '#1890ff',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              404
            </h1>
          }
          subTitle={
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', color: '#666' }}>Oops! Có vẻ như bạn đã lạc đường...</p>
              <p style={{ color: '#999' }}>Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
            </div>
          }
          extra={
            <Row justify='center' gutter={16} style={{ marginTop: '20px' }}>
              <Col>
                <Button
                  type='primary'
                  size='large'
                  onClick={handleNavigateHomePage}
                  style={{
                    borderRadius: '25px',
                    padding: '0 30px',
                    height: '45px',
                    boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  Về Trang Chủ
                </Button>
              </Col>
              {/* <Col>
                <Button
                  size='large'
                  onClick={handlePrevPage}
                  style={{
                    borderRadius: '25px',
                    padding: '0 30px',
                    height: '45px'
                  }}
                >
                  Quay Lại
                </Button>
              </Col> */}
            </Row>
          }
        />
      </Col>
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
          animation: 'pulse 10s infinite ease-in-out',
          top: '-50%',
          left: '-50%',
          zIndex: -1
        }}
      />
      <style>
        {`
            @keyframes pulse {
               0% { transform: scale(1); opacity: 0.5; }
               50% { transform: scale(1.2); opacity: 0.3; }
               100% { transform: scale(1); opacity: 0.5; }
            }
         `}
      </style>
    </Row>
  )
}

export default NotFoundPage
