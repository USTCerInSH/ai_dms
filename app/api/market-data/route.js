import { NextResponse } from 'next/server'

// 获取上证指数历史 K 线数据（从新浪财经）
async function fetchSSEHistory(days = 30) {
  try {
    // 新浪财经 K 线数据 API
    // symbol: sh000001 = 上证指数
    // scale: 240 = 日线
    // datalen = 天数 * 1.5（确保有足够数据，排除节假日）
    const dataLen = Math.ceil(days * 1.5)
    const url = `https://hq.sinajs.cn/rn=${Date.now()}&list=sh000001`
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch current data')
    }
    
    const text = await response.text()
    // 解析：var hq_str_sh000001="上证指数，3400.00,3380.00,3420.00,3430.00,3370.00,..."
    // 字段：name, current, open, high, low, prevClose, date, time, ...
    const match = text.match(/hq_str_sh000001="([^"]+)"/)
    if (!match) {
      throw new Error('Invalid response format')
    }
    
    const parts = match[1].split(',')
    const currentData = {
      name: parts[0],
      current: parseFloat(parts[1]) || 0,
      open: parseFloat(parts[2]) || 0,
      high: parseFloat(parts[3]) || 0,
      low: parseFloat(parts[4]) || 0,
      prevClose: parseFloat(parts[5]) || 0,
      date: parts[6] || '',
      time: parts[7] || '',
    }

    // 获取历史 K 线数据（使用腾讯财经）
    const klineUrl = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh000001,day,,,${dataLen},qfq`
    const klineResponse = await fetch(klineUrl, {
      headers: {
        'Referer': 'https://stockapp.finance.qq.com/',
      },
      cache: 'no-store'
    })
    
    const klineData = await klineResponse.json()
    
    // 解析 K 线数据
    const klines = klineData.data?.sh000001?.day || []
    const historyData = klines.slice(-days).map(k => ({
      date: k[0].substring(5), // YYYY-MM-DD -> MM-DD
      open: parseFloat(k[1]) || 0,
      close: parseFloat(k[2]) || 0,
      high: parseFloat(k[3]) || 0,
      low: parseFloat(k[4]) || 0,
      volume: parseFloat(k[5]) || 0,
    }))

    return {
      success: true,
      current: currentData,
      history: historyData,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return {
      success: false,
      error: error.message,
      fallback: true
    }
  }
}

export async function GET() {
  const result = await fetchSSEHistory(30)
  return NextResponse.json(result)
}
