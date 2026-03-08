import './globals.css'

export const metadata = {
  title: 'TuringQuant - 智能股票分析系统',
  description: 'AI 驱动的股票行情智能分析平台',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
