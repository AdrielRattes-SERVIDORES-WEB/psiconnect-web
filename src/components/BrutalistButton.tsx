import { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export default function BrutalistButton({ variant = 'primary', children, className = '', ...props }: Props) {
  const base = "font-heading font-bold uppercase transition-all active:scale-95 flex items-center justify-center gap-2 rounded-full py-4 px-8 border-2 cursor-pointer"
  const variants = {
    primary: "bg-black text-white border-black hover:bg-white hover:text-black",
    secondary: "bg-white text-black border-black hover:bg-black hover:text-white",
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>
}
