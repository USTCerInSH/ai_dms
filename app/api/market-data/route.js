import { NextResponse } from 'next/server'

// 获取上证指数历史 K 线数据和实时行情（从腾讯财经）
async function fetchSSEHistory(days = 30) {
  try {
    const dataLen = Math.ceil(days * 1.5)
    
    // 腾讯财经 K 线数据 API（不复权）
    const klineUrl = `https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=sh000001,day,,,${dataLen}`
    const klineResponse = await fetch(klineUrl, {
      headers: {
        'Referer': 'https://stockapp.finance.qq.com/',
      },
      cache: 'no-store'
    })
    
    const klineData = await klineResponse.json()
    
    // 解析 K 线数据
    // 格式：[日期，开盘，收盘，最高，最低，成交量]
    const klines = klineData.data?.sh000001?.day || []
    const historyData = klines.slice(-days).map(k => ({
      date: k[0].substring(5), // YYYY-MM-DD -> MM-DD
      open: parseFloat(k[1]) || 0,
      close: parseFloat(k[2]) || 0,
      high: parseFloat(k[3]) || 0,
      low: parseFloat(k[4]) || 0,
      volume: parseFloat(k[5]) || 0,
    }))

    // 获取实时行情（qt 字段）
    const qtData = klineData.data?.sh000001?.qt?.sh000001
    let currentData = {
      name: '上证指数',
      current: 0,
      open: 0,
      high: 0,
      low: 0,
      prevClose: 0,
      date: '',
      time: '',
    }
    
    if (qtData && qtData.length > 0) {
      // qt 格式：[市场代码，名称，代码，当前价，昨收，今开，成交量，...]
      currentData = {
        name: qtData[1] || '上证指数',
        current: parseFloat(qtData[3]) || 0,
        prevClose: parseFloat(qtData[4]) || 0,
        open: parseFloat(qtData[5]) || 0,
        volume: parseFloat(qtData[6]) || 0,
        high: parseFloat(qtData[32]) || 0,  // 最高价
        low: parseFloat(qtData[33]) || 0,   // 最低价
        date: qtData[30] ? qtData[30].substring(0, 8) : '',  // YYYYMMDDHHMMSS -> YYYYMMDD
        time: qtData[30] ? qtData[30].substring(8, 14) : '',
      }
    }
    
    // 如果 qt 数据不可用，使用 K 线最后一条数据
    if (currentData.current === 0 && klines.length > 0) {
      const lastK = klines[klines.length - 1]
      currentData = {
        name: '上证指数',
        current: parseFloat(lastK[2]) || 0,
        open: parseFloat(lastK[1]) || 0,
        high: parseFloat(lastK[3]) || 0,
        low: parseFloat(lastK[4]) || 0,
        prevClose: parseFloat(klines[klines.length - 2]?.[2]) || 0,
        date: lastK[0],
        time: '',
      }
    }

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
