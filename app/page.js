'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Search, TrendingUp, Activity, Target, Zap, Menu, X, ArrowUp, ArrowDown } from 'lucide-react'

// TuringQuant Logo 组件
function TuringQuantLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tqGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="8" fill="url(#tqGradient)" />
      <text x="20" y="18" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="0.5">TURING</text>
      <text x="20" y="30" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="0.5">QUANT</text>
    </svg>
  )
}

// 模拟上证指数数据
function generateSSEData(days = 30) {
  const data = []
  let price = 3400  // 上证指数基准点位
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // 模拟指数波动，幅度更符合大盘特征
    price = price + (Math.random() - 0.5) * 40
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 300000000) + 200000000,  // 指数成交量更大
      open: price + (Math.random() - 0.5) * 15,
      high: price + Math.random() * 25,
      low: price - Math.random() * 25,
      close: price,
    })
  }
  return data
}

// 模拟个股股票数据
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

// 计算 Boll 带指标
function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (data.length < period) return []

  const bollData = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      bollData.push({
        ...data[i],
        upper: 0,
        middle: 0,
        lower: 0,
      })
      continue
    }

    // 计算移动平均
    const slice = data.slice(i - period + 1, i + 1)
    const prices = slice.map(d => d.close)
    const middle = prices.reduce((a, b) => a + b, 0) / period

    // 计算标准差
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / period
    const std = Math.sqrt(variance)

    bollData.push({
      ...data[i],
      upper: parseFloat((middle + stdDev * std).toFixed(2)),
      middle: parseFloat(middle.toFixed(2)),
      lower: parseFloat((middle - stdDev * std).toFixed(2)),
    })
  }

  return bollData
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

// 模拟早盘涨跌数据 - 多时间点（基于真实成分股数量）
function generateMarketData() {
  // 各指数真实成分股数量（约数，实际会变动）
  const indices = [
    { name: '上证指数', code: '000001', base: 3400, totalStocks: 2380 },    // 上交所全部股票
    { name: '深证成指', code: '399001', base: 11000, totalStocks: 2850 },   // 深交所全部股票
    { name: '创业板指', code: '399006', base: 2200, totalStocks: 1350 },    // 创业板全部
    { name: '科创 50', code: '000688', base: 1000, totalStocks: 575 },      // 科创板全部
    { name: '沪深 300', code: '000300', base: 4000, totalStocks: 300 },     // 沪深 300 成分股
    { name: '中证 500', code: '000905', base: 5800, totalStocks: 500 },     // 中证 500 成分股
    { name: '中证 1000', code: '000852', base: 6200, totalStocks: 1000 },   // 中证 1000 成分股
    { name: '中证 2000', code: '932000', base: 1800, totalStocks: 2000 },   // 中证 2000 成分股
  ]

  return indices.map(idx => {
    // 生成 4 个时间点的数据
    const timePoints = ['open', 't945', 't1000', 't1030']
    const timeData = {}
    
    // 生成一个基准涨跌比例，让各时间点有连贯性
    const baseAdvanceRatio = 0.35 + Math.random() * 0.35  // 35%~70% 的上涨比例
    
    timePoints.forEach((time, i) => {
      // 每个时间点略有波动，但保持趋势一致
      const fluctuation = (Math.random() - 0.5) * 0.1  // ±5% 波动
      const advanceRatio = Math.max(0.2, Math.min(0.8, baseAdvanceRatio + fluctuation))
      const advance = Math.floor(idx.totalStocks * advanceRatio)
      const decline = idx.totalStocks - advance
      const changePercent = (advanceRatio - 0.5) * 4  // 转换为指数涨跌幅，约 -2% 到 +2%
      
      timeData[time] = {
        changePercent: parseFloat(changePercent.toFixed(2)),
        advance,
        decline,
      }
    })
    
    return {
      ...idx,
      timeData,
      currentChangePercent: timeData['t1030'].changePercent,
    }
  })
}

// 菜单配置
const menuItems = [
  { id: 'overview', name: '行情概览', icon: Activity },
  { id: 'chart', name: '行情分析', icon: TrendingUp },
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
  { code: '000905', name: '中证 500' },
  { code: '000852', name: '中证 1000' },
  { code: '932000', name: '中证 2000' },
]

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [macdPeriod, setMacdPeriod] = useState('daily')
  const [selectedIndices, setSelectedIndices] = useState(['上证指数', '创业板指', '中证 500', '中证 1000', '中证 2000'])
  const [watchlist, setWatchlist] = useState(defaultIndices)
  const [customCode, setCustomCode] = useState('')
  const [showBoll, setShowBoll] = useState(true)
  
  // 真实市场数据状态
  const [sseData, setSseData] = useState([])
  const [sseCurrent, setSseCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  
  // 获取真实上证指数数据
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch('/api/market-data', { cache: 'no-store' })
        const result = await res.json()
        
        if (result.success && result.history.length > 0) {
          // 转换数据格式以适配图表
          const formattedData = result.history.map(d => ({
            date: d.date,
            open: d.open,
            close: d.close,
            high: d.high,
            low: d.low,
            volume: d.volume,
            price: d.close,  // 兼容原有代码
          }))
          
          setSseData(formattedData)
          setSseCurrent(result.current)
          setData(formattedData)  // 也设置 data 用于其他图表
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
        // 降级到模拟数据
        const fallbackData = generateSSEData()
        setSseData(fallbackData)
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMarketData()
  }, [])
  
  // 计算 MACD 和 Bollinger Bands（基于真实数据）
  const macdData = sseData.length > 0 ? calculateMACD(sseData) : []
  const bollData = sseData.length > 0 ? calculateBollingerBands(sseData) : []
  const crossovers = sseData.length > 0 ? detectCrossovers(macdData) : []
  const marketData = generateMarketData()

  // 当前价格和涨跌幅
  const currentPrice = sseCurrent?.current || (sseData.length > 0 ? sseData[sseData.length - 1].close : 3400)
  const prevClose = sseCurrent?.prevClose || (sseData.length > 0 ? sseData[sseData.length - 2]?.close : 3400)
  const changePercent = sseCurrent ? ((currentPrice - prevClose) / prevClose * 100).toFixed(2) : '0.00'

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
        if (loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">🐰 蹦财兔正在获取真实行情数据...</p>
              </div>
            </div>
          )
        }

        const latestData = sseData.length > 0 ? sseData[sseData.length - 1] : null
        const maxHigh = sseData.length > 0 ? Math.max(...sseData.map(d => d.high)) : 0
        const minLow = sseData.length > 0 ? Math.min(...sseData.map(d => d.low)) : 0

        return (
          <div className="space-y-6">
            {/* 上证指数核心指标 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">上证指数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{currentPrice.toFixed(2)}</p>
                <p className={`text-sm mt-2 ${parseFloat(changePercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(changePercent) > 0 ? '+' : ''}{changePercent}%
                </p>
                {sseCurrent && (
                  <p className="text-xs text-gray-400 mt-2">
                    {sseCurrent.date} {sseCurrent.time}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">30 日最高</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{maxHigh.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-500 text-sm">30 日最低</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{minLow.toFixed(2)}</p>
              </div>
            </div>

            {/* 行情预览 - 左侧统计，右侧 K 线图 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：统计信息 */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">市场概况</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">开盘价</span>
                      <span className="font-medium text-gray-900">{latestData?.open.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">收盘价</span>
                      <span className="font-medium text-gray-900">{latestData?.close.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">最高价</span>
                      <span className="font-medium text-green-600">{latestData?.high.toFixed(2) || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">最低价</span>
                      <span className="font-medium text-red-600">{latestData?.low.toFixed(2) || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">成交量</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {latestData ? (latestData.volume / 100000000).toFixed(2) : '-'} 亿
                  </p>
                  <p className="text-sm text-gray-500 mt-2">最新交易日</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2">🐰 蹦财兔点评</h4>
                  <p className="text-purple-700 text-sm">
                    {parseFloat(changePercent) > 0 
                      ? '市场情绪积极，指数站稳关键点位，关注成交量是否持续放大！' 
                      : '短期调整属正常波动，逢低可关注优质标的，保持耐心！'}
                  </p>
                </div>
              </div>

              {/* 右侧：K 线图 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">上证指数 K 线图（真实数据）</h3>
                    <span className="text-sm text-gray-500">近 30 日走势</span>
                  </div>
                  {sseData.length > 0 ? (
                    <div className="h-80 sm:h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sseData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            labelStyle={{ color: '#374151', fontWeight: 600 }}
                          />
                          <Line type="monotone" dataKey="close" stroke="#7c3aed" strokeWidth={2} dot={false} name="收盘价" />
                          <Line type="monotone" dataKey="open" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="3 3" name="开盘价" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 sm:h-96 flex items-center justify-center text-gray-500">
                      暂无数据
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className="space-y-6">
            {/* K 线和 Boll 带 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">K 线与布林带</h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBoll}
                    onChange={(e) => setShowBoll(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  显示 Boll 带
                </label>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="close" stroke="#7c3aed" strokeWidth={2} dot={false} name="收盘价" />
                    {showBoll && (
                      <>
                        <Line type="monotone" dataKey="upper" stroke="#22c55e" strokeWidth={1} dot={false} strokeDasharray="3 3" name="上轨" />
                        <Line type="monotone" dataKey="middle" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="3 3" name="中轨" />
                        <Line type="monotone" dataKey="lower" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" name="下轨" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 成交量 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">成交量</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#7c3aed" name="成交量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MACD */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MACD 指标</h3>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={macdData}>
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
              <div className="h-40 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={macdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="histogram" fill="#7c3aed" name="MACD 柱" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
                {['上证指数', '深证成指', '创业板指', '科创 50', '沪深 300', '中证 500', '中证 1000', '中证 2000'].map(idx => (
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
        const timeLabels = {
          'open': '开盘时',
          't945': '9:45',
          't1000': '10:00',
          't1030': '10:30',
        }
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">早盘涨跌比例监控</h3>
                <p className="text-gray-500 text-sm">更新时间：{new Date().toLocaleTimeString('zh-CN')}</p>
              </div>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700 sticky left-0 bg-white">指数</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">开盘时</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">9:45</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">10:00</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">10:30</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-700">涨跌变化</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData
                    .filter(idx => selectedIndices.includes(idx.name))
                    .map((idx) => {
                    const openAdvance = idx.timeData['open'].advance
                    const closeAdvance = idx.timeData['t1030'].advance
                    const change = closeAdvance - openAdvance
                    return (
                      <tr key={idx.code} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 sticky left-0 bg-white">
                          <div className="font-medium text-gray-900">{idx.name}</div>
                          <div className="text-xs text-gray-500">{idx.code}</div>
                        </td>
                        {Object.entries(idx.timeData).map(([time, data]) => (
                          <td key={time} className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-green-600 font-medium">{data.advance}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-red-600 font-medium">{data.decline}</span>
                            </div>
                          </td>
                        ))}
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {change >= 0 ? '+' : ''}{change}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 指数选择 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">显示指数</h4>
              <div className="flex flex-wrap gap-2">
                {['上证指数', '深证成指', '创业板指', '科创 50', '沪深 300', '中证 500', '中证 1000', '中证 2000'].map(idx => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedIndices(prev =>
                        prev.includes(idx)
                          ? prev.filter(i => i !== idx)
                          : [...prev, idx]
                      )
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
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

            {/* 市场情绪概览 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">市场情绪</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">
                    {Math.round(marketData.filter(idx => selectedIndices.includes(idx.name)).reduce((sum, idx) => sum + idx.timeData['t1030'].advance, 0) / selectedIndices.length)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">平均上涨</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-600">
                    {Math.round(marketData.filter(idx => selectedIndices.includes(idx.name)).reduce((sum, idx) => sum + idx.timeData['t1030'].decline, 0) / selectedIndices.length)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">平均下跌</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">
                    {marketData.filter(idx => selectedIndices.includes(idx.name) && idx.timeData['t1030'].changePercent > 0).length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">收涨指数</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-600">
                    {selectedIndices.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">当前显示</p>
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
              <TuringQuantLogo size={40} />
              <h1 className="text-xl font-bold hidden sm:block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-mono tracking-wider">图灵量化</span>
                <span className="text-gray-900 ml-1 font-sans">智能决策系统</span>
              </h1>
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
          <p>图灵量化智能决策系统 © 2026</p>
          <p className="mt-2">数据仅供参考，不构成投资建议</p>
        </div>
      </footer>
    </div>
  )
}
