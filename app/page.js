'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Search, TrendingUp, Activity, Target, Zap, Menu, X } from 'lucide-react'

// 模拟股票数据
function generateData(days = 30) {
  const data = []
  let price = 350
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    price = price + (Math.random() - 0.5) * 15
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })
  }
  return data
}

// 菜单配置
const menuItems = [
  { id: 'overview', name: '行情概览', icon: Activity },
  { id: 'chart', name: 'K 线分析', icon: TrendingUp },
  { id: 'signal', name: '智能信号', icon: Target },
  { id: 'analysis', name: '深度分析', icon: Zap },
]

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('overview')
  const [stockCode, setStockCode] = useState('688256')
  const [stockName, setStockName] = useState('寒武纪')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const data = generateData()

  const currentPrice = data[data.length - 1].price
  const changePercent = ((currentPrice - data[0].price) / data[0].price * 100).toFixed(2)

  // 渲染不同功能模块
  function renderContent() {
    switch (activeMenu) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">当前价格</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">¥{currentPrice.toFixed(2)}</p>
                <p className={`text-sm mt-2 ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {changePercent > 0 ? '+' : ''}{changePercent}%
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">30 日最高</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">¥{Math.max(...data.map(d => d.price)).toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">30 日最低</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">¥{Math.min(...data.map(d => d.price)).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">30 日价格走势</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">成交量分析</h3>
            <div className="h-64 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      case 'signal':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">买入信号</h3>
              </div>
              <p className="text-green-700">基于当前技术指标，建议<strong>买入</strong></p>
              <p className="text-green-600 text-sm mt-2">置信度：75%</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">信号依据</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ 价格位于均线上方</li>
                <li>✓ 成交量放大</li>
                <li>✓ MACD 金叉</li>
                <li>✓ RSI 处于合理区间</li>
              </ul>
            </div>
          </div>
        )

      case 'analysis':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">技术面分析</h4>
              <div className="space-y-3 text-gray-600">
                <p><strong>趋势：</strong>短期上涨趋势，均线多头排列</p>
                <p><strong>支撑位：</strong>¥{Math.min(...data.map(d => d.price)).toFixed(2)}</p>
                <p><strong>阻力位：</strong>¥{Math.max(...data.map(d => d.price)).toFixed(2)}</p>
                <p><strong>波动率：</strong>中等</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">基本面摘要</h4>
              <div className="space-y-3 text-gray-600">
                <p><strong>行业：</strong>半导体 - AI 芯片</p>
                <p><strong>核心产品：</strong>思元系列云端芯片</p>
                <p><strong>投资亮点：</strong>国产替代 + AI 算力需求</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">⚠️ 风险提示：本分析仅供参考，不构成投资建议。股市有风险，投资需谨慎。</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">TuringQuant</h1>
            </div>

            {/* 桌面端搜索框 */}
            <form onSubmit={(e) => { e.preventDefault(); }} className="hidden md:flex gap-2">
              <input
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="股票代码"
              />
              <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* 移动端搜索框 */}
          <form onSubmit={(e) => { e.preventDefault(); }} className="md:hidden mt-4 flex gap-2">
            <input
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="股票代码"
            />
            <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧导航栏 - 桌面端 */}
          <nav className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <ul className="space-y-3">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left transition-colors ${
                          activeMenu === item.id
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-medium text-base">{item.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* 股票信息卡片 */}
              <div className="bg-white rounded-xl shadow-sm p-4 mt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">当前股票</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stockCode}</p>
                <p className="text-sm text-gray-600">{stockName}</p>
              </div>
            </div>
          </nav>

          {/* 移动端侧滑菜单 */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">菜单</h2>
                </div>
                <nav className="p-4">
                  <ul className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              setActiveMenu(item.id)
                              setMobileMenuOpen(false)
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors ${
                              activeMenu === item.id
                                ? 'bg-purple-50 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                  <p className="text-sm text-gray-500">当前股票</p>
                  <p className="text-lg font-bold text-gray-900">{stockCode}</p>
                  <p className="text-sm text-gray-600">{stockName}</p>
                </div>
              </div>
            </div>
          )}

          {/* 右侧内容区 */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>TuringQuant © 2026</p>
          <p className="mt-2">数据仅供参考，不构成投资建议</p>
        </div>
      </footer>
    </div>
  )
}
