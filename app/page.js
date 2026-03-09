'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Search, TrendingUp, Activity, Target, Zap, Menu, X, ArrowUp, ArrowDown } from 'lucide-react'

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
      open: price + (Math.random() - 0.5) * 3,
      high: price + Math.random() * 5,
      low: price - Math.random() * 5,
      close: price,
    })
  }
  return data
}

// 计算 MACD 指标
function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
  if (data.length < longPeriod) return []

  const macdData = []
  
  // 计算 EMA
  function calculateEMA(prices, period) {
    const k = 2 / (period + 1)
    let ema = prices[0]
    const result = [ema]
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k)
      result.push(ema)
    }
    return result
  }

  const prices = data.map(d => d.close)
  const shortEMA = calculateEMA(prices, shortPeriod)
  const longEMA = calculateEMA(prices, longPeriod)

  // 计算 MACD 线
  const macdLine = []
  for (let i = 0; i < data.length; i++) {
    macdLine.push(i < longPeriod - 1 ? 0 : shortEMA[i] - longEMA[i])
  }

  // 计算信号线 (MACD 的 EMA)
  const validMACD = macdLine.slice(longPeriod - 1)
  const signalLine = calculateEMA(validMACD, signalPeriod)
  
  // 填充前面的零值
  const fullSignalLine = [...Array(longPeriod - 1).fill(0), ...signalLine]

  // 计算柱状图
  const histogram = macdLine.map((macd, i) => macd - fullSignalLine[i])

  // 生成结果
  for (let i = 0; i < data.length; i++) {
    macdData.push({
      ...data[i],
      macd: parseFloat(macdLine[i].toFixed(4)),
      signal: parseFloat(fullSignalLine[i].toFixed(4)),
      histogram: parseFloat(histogram[i].toFixed(4)),
    })
  }

  return macdData
}

// 检测金叉死叉
function detectCrossovers(macdData) {
  const signals = []
  for (let i = 1; i < macdData.length; i++) {
    const prev = macdData[i - 1]
    const curr = macdData[i]
    
    // 金叉：MACD 从下向上穿越信号线
    if (prev.macd <= prev.signal && curr.macd > curr.signal) {
      signals.push({
        index: i,
        type: 'golden',
        date: curr.date,
        price: curr.close,
      })
    }
    // 死叉：MACD 从上向下穿越信号线
    if (prev.macd >= prev.signal && curr.macd < curr.signal) {
      signals.push({
        index: i,
        type: 'death',
        date: curr.date,
        price: curr.close,
      })
    }
  }
  return signals
}

// 模拟早盘涨跌数据
function generateMarketData() {
  const indices = [
    { name: '上证指数', code: '000001', base: 3400 },
    { name: '深证成指', code: '399001', base: 11000 },
    { name: '创业板指', code: '399006', base: 2200 },
    { name: '科创 50', code: '000688', base: 1000 },
    { name: '沪深 300', code: '000300', base: 4000 },
  ]

  return indices.map(idx => {
    const openChange = (Math.random() - 0.45) * 2 // 开盘涨跌
    const currentChange = (Math.random() - 0.45) * 2 // 当前涨跌
    const advanceOpen = Math.floor(40 + Math.random() * 30) // 开盘上涨家数%
    const advanceCurrent = Math.floor(40 + Math.random() * 30) // 当前上涨家数%
    
    return {
      ...idx,
      openPrice: idx.base * (1 + openChange / 100),
      currentPrice: idx.base * (1 + currentChange / 100),
      openChangePercent: parseFloat(openChange.toFixed(2)),
      currentChangePercent: parseFloat(currentChange.toFixed(2)),
      advanceOpen,
      declineOpen: 100 - advanceOpen,
      advanceCurrent,
      declineCurrent: 100 - advanceCurrent,
    }
  })
}

// 菜单配置
const menuItems = [
  { id: 'overview', name: '行情概览', icon: Activity },
  { id: 'chart', name: 'K 线分析', icon: TrendingUp },
  { id: 'signal', name: '智能信号', icon: Target },
  { id: 'macd', name: 'MACD 分析', icon: TrendingUp },
  { id: 'market', name: '早盘监控', icon: Zap },
  { id: 'analysis', name: '深度分析', icon: Zap },
]

// 默认指数列表
const defaultIndices = [
  { code: '000001', name: '上证指数' },
  { code: '399001', name: '深证成指' },
  { code: '399006', name: '创业板指' },
  { code: '000688', name: '科创 50' },
  { code: '000300', name: '沪深 300' },
]

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [macdPeriod, setMacdPeriod] = useState('daily')
  const [selectedIndices, setSelectedIndices] = useState(['上证指数', '深证成指', '创业板指'])
  const [watchlist, setWatchlist] = useState(defaultIndices)
  const [customCode, setCustomCode] = useState('')
  
  const data = generateData()
  const macdData = calculateMACD(data)
  const crossovers = detectCrossovers(macdData)
  const marketData = generateMarketData()

  const currentPrice = data[data.length - 1].price
  const changePercent = ((currentPrice - data[0].price) / data[0].price * 100).toFixed(2)

  // 多周期配置
  const periodConfig = {
    '5min': { name: '5 分钟', days: 1 },
    '15min': { name: '15 分钟', days: 2 },
    '30min': { name: '30 分钟', days: 3 },
    '60min': { name: '60 分钟', days: 5 },
    'daily': { name: '日线', days: 30 },
    'weekly': { name: '周线', days: 90 },
  }

  // 添加自定义股票到自选栏
  function addStockToWatchlist() {
    if (customCode.trim()) {
      const newStock = { code: customCode.trim(), name: '自定义' }
      setWatchlist(prev => [...prev, newStock])
      setCustomCode('')
    }
  }

  // 从自选栏移除
  function removeStockFromWatchlist(code) {
    setWatchlist(prev => prev.filter(s => s.code !== code))
  }

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
                <h3 className="text-lg font-semibold text-green-800">综合买入信号</h3>
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

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">最近 MACD 信号</h4>
              <div className="space-y-2">
                {crossovers.slice(-5).reverse().map((signal, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${
                    signal.type === 'golden' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {signal.type === 'golden' ? (
                      <ArrowUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-600" />
                    )}
                    <span className={signal.type === 'golden' ? 'text-green-700' : 'text-red-700'}>
                      {signal.type === 'golden' ? '金叉信号' : '死叉信号'}
                    </span>
                    <span className="text-gray-600 text-sm">{signal.date}</span>
                  </div>
                ))}
                {crossovers.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无信号</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'macd':
        return (
          <div className="space-y-6">
            {/* 周期选择 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">选择周期</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(periodConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setMacdPeriod(key)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      macdPeriod === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 多指数选择 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">选择指数</h4>
              <div className="flex flex-wrap gap-2">
                {['上证指数', '深证成指', '创业板指', '科创 50', '沪深 300'].map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedIndices(prev =>
                        prev.includes(idx)
                          ? prev.filter(i => i !== idx)
                          : [...prev, idx]
                      )
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedIndices.includes(idx)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx}
                  </button>
                ))}
              </div>
            </div>

            {/* MACD 图表 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                MACD 指标 ({periodConfig[macdPeriod].name})
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={macdData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="macd" stroke="#7c3aed" strokeWidth={2} dot={false} name="MACD" />
                    <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} name="信号线" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MACD 柱状图 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MACD 柱状图</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={macdData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="histogram" fill="#7c3aed" name="MACD 柱" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 信号列表 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">金叉/死叉信号</h4>
              <div className="space-y-2">
                {crossovers.slice(-10).reverse().map((signal, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${
                    signal.type === 'golden' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    {signal.type === 'golden' ? (
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <ArrowUp className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                        <ArrowDown className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${signal.type === 'golden' ? 'text-green-700' : 'text-red-700'}`}>
                        {signal.type === 'golden' ? '金叉买入信号' : '死叉卖出信号'}
                      </p>
                      <p className="text-sm text-gray-500">{signal.date}</p>
                    </div>
                  </div>
                ))}
                {crossovers.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无信号</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'market':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">早盘涨跌比例监控</h3>
              <p className="text-gray-600 text-sm mb-4">数据更新时间：{new Date().toLocaleTimeString('zh-CN')}</p>
              
              <div className="space-y-4">
                {marketData
                  .filter(idx => selectedIndices.includes(idx.name))
                  .map((idx) => (
                  <div key={idx.code} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{idx.name}</h4>
                        <p className="text-sm text-gray-500">{idx.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{idx.currentPrice.toFixed(2)}</p>
                        <p className={`text-sm ${idx.currentChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {idx.currentChangePercent > 0 ? '+' : ''}{idx.currentChangePercent}%
                        </p>
                      </div>
                    </div>

                    {/* 涨跌家数对比 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">开盘时</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">{idx.advanceOpen}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-700 font-medium">{idx.declineOpen}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">开盘 15 分钟后</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">{idx.advanceCurrent}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-700 font-medium">{idx.declineCurrent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 变化趋势 */}
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500">上涨家数变化:</span>
                      <span className={`font-medium ${
                        idx.advanceCurrent - idx.advanceOpen >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {idx.advanceCurrent - idx.advanceOpen >= 0 ? '+' : ''}{idx.advanceCurrent - idx.advanceOpen}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 市场情绪概览 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">市场情绪概览</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(marketData.reduce((sum, idx) => sum + idx.advanceCurrent, 0) / marketData.length)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">平均上涨比例</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {Math.round(marketData.reduce((sum, idx) => sum + idx.declineCurrent, 0) / marketData.length)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">平均下跌比例</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">
                    {marketData.filter(idx => idx.currentChangePercent > 0).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">收涨指数</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-600">
                    {marketData.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">监控指数</p>
                </div>
              </div>
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

            {/* 桌面端添加股票框 */}
            <form onSubmit={(e) => { e.preventDefault(); addStockToWatchlist(); }} className="hidden md:flex gap-2">
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="添加股票/指数代码"
              />
              <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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

          {/* 移动端添加股票框 */}
          <form onSubmit={(e) => { e.preventDefault(); addStockToWatchlist(); }} className="md:hidden mt-4 flex gap-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="添加股票/指数代码"
            />
            <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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

              {/* 自选栏设置 */}
              <div className="bg-white rounded-xl shadow-sm p-4 mt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2">自选指数/股票</p>
                <div className="flex gap-1 mb-2">
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="输入代码"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addStockToWatchlist()}
                  />
                  <button
                    onClick={addStockToWatchlist}
                    className="px-2 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    +
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {watchlist.map((stock) => (
                    <div key={stock.code} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{stock.code} - {stock.name}</span>
                      {stock.code !== '000001' && (
                        <button
                          onClick={() => removeStockFromWatchlist(stock.code)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
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
                  <p className="text-sm text-gray-500 mb-2">自选指数/股票</p>
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="输入代码"
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && addStockToWatchlist()}
                    />
                    <button
                      onClick={addStockToWatchlist}
                      className="px-2 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
                    {watchlist.map((stock) => (
                      <div key={stock.code} className="flex items-center justify-between">
                        <span className="text-gray-700">{stock.code}</span>
                        {stock.code !== '000001' && (
                          <button
                            onClick={() => removeStockFromWatchlist(stock.code)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
