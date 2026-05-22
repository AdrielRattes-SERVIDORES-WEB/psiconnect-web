import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  padding?: string
  onClick?: () => void
}

export default function BrutalistCard({ children, className = '', padding = 'p-8', onClick }: Props) {
  return (
    <div onClick={onClick} className={`bg-white brutalist-border rounded-3xl ${padding} ${className}`}>
      {children}
    </div>
  )
}
