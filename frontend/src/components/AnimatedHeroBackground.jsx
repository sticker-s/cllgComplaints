import { useState } from 'react'
import './AnimatedHeroBackground.css'

export default function AnimatedHeroBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setMouse({ x, y })
  }

  const cards = [
    {
      id: 1,
      icon: '📶',
      title: 'Wi-Fi Issue',
      color: '#3b82f6',
      top: '15%',
      left: '65%',
      delay: '0s',
      depth: 15,
    },
    {
      id: 2,
      icon: '🍔',
      title: 'Cafeteria Feedback',
      color: '#f59e0b',
      top: '45%',
      left: '60%',
      delay: '-2s',
      depth: -20,
    },
    {
      id: 3,
      icon: '🔧',
      title: 'Maintenance',
      color: '#10b981',
      top: '70%',
      left: '15%',
      delay: '-4s',
      depth: 25,
    }
  ]

  return (
    <div
      className="hero-container"
      onMouseMove={handleMouseMove}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0f172a', // Deep background
        zIndex: 0
      }}
    >
      {/* Ambient Glowing Blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      {/* Floating Parallax Cards */}
      <div className="cards-wrapper">
        {cards.map((card) => {
          // Calculate parallax movement based on mouse position and card "depth"
          const moveX = mouse.x * card.depth
          const moveY = mouse.y * card.depth
          const rotateX = mouse.y * 10
          const rotateY = mouse.x * -10

          return (
            <div
              key={card.id}
              className="floating-card"
              style={{
                top: card.top,
                left: card.left,
                animationDelay: card.delay,
                transform: `translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              }}
            >
              <div className="card-icon" style={{ background: `${card.color}22`, color: card.color }}>
                {card.icon}
              </div>
              <div className="card-content">
                <div className="card-skeleton-title"></div>
                <div className="card-skeleton-line" style={{ width: '100%' }}></div>
                <div className="card-skeleton-line" style={{ width: '60%' }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
