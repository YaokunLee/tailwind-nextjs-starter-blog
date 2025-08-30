'use client'

import { useEffect, useRef, useState } from 'react'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockChartProps {
  symbol?: string
  width?: string | number
  height?: string | number
  days?: number
}

const StockChart: React.FC<StockChartProps> = ({
  symbol = 'TMDX',
  width = '100%',
  height = 500,
  days = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 生成模拟股价数据
  const generateMockData = (symbol: string, days: number): StockData[] => {
    const data: StockData[] = []
    let basePrice = 50 + Math.random() * 100 // 基础价格在50-150之间

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // 模拟价格变动
      const volatility = 0.02 // 2%波动率
      const change = (Math.random() - 0.5) * 2 * volatility
      basePrice = basePrice * (1 + change)

      // 确保价格不会太低
      basePrice = Math.max(basePrice, 10)

      const open = basePrice
      const close = open * (1 + (Math.random() - 0.5) * 0.02)
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = Math.floor(Math.random() * 1000000) + 100000

      data.push({
        date: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      })

      basePrice = close
    }

    return data
  }

  useEffect(() => {
    // 模拟数据加载
    setLoading(true)
    setTimeout(() => {
      try {
        const data = generateMockData(symbol, days)
        setStockData(data)
        setError(null)
      } catch (err) {
        setError('数据加载失败')
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [symbol, days])

  useEffect(() => {
    if (!stockData.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // 绘制K线图
    drawCandlestickChart(ctx, stockData, canvas.width, canvas.height)
  }, [stockData])

  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D,
    data: StockData[],
    width: number,
    height: number
  ) => {
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 找出价格范围
    const prices = data.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceScale = chartHeight / priceRange

    // 绘制背景网格
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // 价格标签
      const price = maxPrice - (priceRange * i) / 5
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.fillText(price.toFixed(2), 5, y + 4)
    }

    // 垂直网格线
    const timeStep = Math.max(1, Math.floor(data.length / 10))
    for (let i = 0; i < data.length; i += timeStep) {
      const x = padding + (chartWidth * i) / (data.length - 1)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // 绘制K线
    const candleWidth = Math.max(2, chartWidth / data.length - 2)

    data.forEach((item, index) => {
      const x = padding + (chartWidth * index) / (data.length - 1)
      const openY = padding + (maxPrice - item.open) * priceScale
      const closeY = padding + (maxPrice - item.close) * priceScale
      const highY = padding + (maxPrice - item.high) * priceScale
      const lowY = padding + (maxPrice - item.low) * priceScale

      // K线颜色：涨绿跌红
      const isUp = item.close > item.open
      const color = isUp ? '#00c851' : '#ff3547'

      // 绘制上下影线
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // 绘制实体
      ctx.fillStyle = color
      const bodyHeight = Math.abs(closeY - openY)
      const bodyY = Math.min(openY, closeY)

      if (bodyHeight < 1) {
        // 如果实体太小，绘制一条线
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, 1)
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
      }
    })

    // 绘制边框
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 1
    ctx.strokeRect(padding, padding, chartWidth, chartHeight)
  }

  if (loading) {
    return (
      <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800"
          style={{ height: typeof height === 'string' ? height : `${height}px` }}
        >
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-gray-500">加载股价数据中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-6 overflow-hidden rounded-lg border border-red-200 dark:border-red-700">
        <div
          className="flex items-center justify-center bg-red-50 dark:bg-red-900"
          style={{ height: typeof height === 'string' ? height : `${height}px` }}
        >
          <div className="text-center">
            <p className="mb-2 text-red-500">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 underline hover:text-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol} 股价走势图</h3>
        <p className="text-sm text-gray-500">
          最近{days}天 • 当前价格: ${stockData[stockData.length - 1]?.close || 0}
        </p>
      </div>
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{
            height: typeof height === 'string' ? height : `${height}px`,
            width: typeof width === 'string' ? width : `${width}px`,
          }}
        />
      </div>
      <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 dark:bg-gray-800">
        <span>模拟数据仅供展示 • 实际投资请参考真实市场数据</span>
      </div>
    </div>
  )
}

export default StockChart
