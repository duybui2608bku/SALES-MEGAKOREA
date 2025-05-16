import React, { ReactNode, useEffect, useRef } from 'react'
import { Card, CardProps } from 'antd'

// Props interface
interface GlassMorphismCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  width?: string | number
  height?: string | number
  contentPadding?: string | number
  contentStyle?: React.CSSProperties
  cardProps?: CardProps
}

// Bubble interface
interface Bubble {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  opacity: number
}

// GlassMorphismCard Component
const GlassMorphismCard: React.FC<GlassMorphismCardProps> = ({
  title,
  subtitle,
  children,
  width = '100%',
  height = 'auto',
  contentPadding = '24px',
  contentStyle,
  cardProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Animation for floating bubbles
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions to match container
    const updateCanvasSize = (): void => {
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Create bubbles
    const bubbles: Bubble[] = []
    const createBubbles = (): void => {
      const numberOfBubbles = 10
      for (let i = 0; i < numberOfBubbles; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 60 + 20,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1
        })
      }
    }

    createBubbles()

    // Animation loop
    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw bubbles
      bubbles.forEach((bubble) => {
        // Move bubble
        bubble.x += bubble.speedX
        bubble.y += bubble.speedY

        // Bounce off edges
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) {
          bubble.speedX = -bubble.speedX
        }

        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height) {
          bubble.speedY = -bubble.speedY
        }

        // Draw bubble
        const gradient = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.radius)

        gradient.addColorStop(0, `rgba(22, 119, 255, ${bubble.opacity + 0.1})`)
        gradient.addColorStop(1, `rgba(22, 119, 255, ${bubble.opacity - 0.1})`)

        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='glass-morphism-container'
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#1677ff',
        backgroundImage: 'linear-gradient(135deg, rgba(22, 119, 255, 0.8) 0%, rgba(130, 180, 255, 0.6) 100%)',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      {/* Background animation */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />

      {/* Glass card with header */}
      {(title || subtitle) && (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            width: '100%',
            padding: '24px 24px 0 24px',
            textAlign: 'center'
          }}
        >
          {title && (
            <h1
              style={{
                color: '#FFFFFF',
                fontSize: '32px',
                fontWeight: 'bold',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '2px'
              }}
            >
              {title}
            </h1>
          )}

          {subtitle && (
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '16px',
                marginTop: '8px',
                textAlign: 'center'
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Glass card */}
      <Card
        bordered={false}
        {...cardProps}
        style={{
          position: 'relative',
          width: width,
          height: height,
          margin: title || subtitle ? '16px' : '0',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(22, 119, 255, 0.1)',
          overflow: 'hidden',
          zIndex: 2,
          ...(cardProps?.style || {})
        }}
        bodyStyle={{
          width: '100%',
          height: '100%',
          padding: contentPadding,
          ...(contentStyle || {}),
          ...(cardProps?.bodyStyle || {})
        }}
      >
        {children}
      </Card>
    </div>
  )
}

// Helper component để dễ dàng sử dụng GlassMorphismCard như một container
export const GlassMorphismContainer: React.FC<
  Omit<GlassMorphismCardProps, 'title' | 'subtitle'> & {
    className?: string
  }
> = ({ children, className, ...rest }) => {
  return (
    <div className={className} style={{ minHeight: '100vh', padding: '24px' }}>
      <GlassMorphismCard contentPadding='0' contentStyle={{ overflow: 'auto' }} {...rest}>
        {children}
      </GlassMorphismCard>
    </div>
  )
}

export default GlassMorphismCard
