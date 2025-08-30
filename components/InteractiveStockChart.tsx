'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface InteractiveStockChartProps {
  symbol?: string
  width?: string | number
  height?: string | number
  days?: number
}

interface ChartState {
  startIndex: number
  endIndex: number
  scale: number
  dragStartX?: number
  isDragging: boolean
  viewportStart: number
  viewportEnd: number
}

const InteractiveStockChart: React.FC<InteractiveStockChartProps> = ({
  symbol = 'TMDX',
  width = '100%',
  height = 500,
  days = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 图表状态
  const [chartState, setChartState] = useState<ChartState>({
    startIndex: 0,
    endIndex: days,
    scale: 1,
    isDragging: false,
    viewportStart: 0,
    viewportEnd: days,
  })

  // 生成更真实的股价数据（基于TMDX的实际价格范围）
  const generateMockData = useCallback((symbol: string, days: number): StockData[] => {
    const data: StockData[] = []

    // 基于真实股价数据的范围参考（2024-2025年）
    const stockPriceRanges: {
      [key: string]: { base: number; range: [number, number]; volatility: number }
    } = {
      TMDX: { base: 117, range: [80, 180], volatility: 0.045 }, // TMDX实际价格：当前$117，高点$177，低点约$80
      AAPL: { base: 180, range: [150, 200], volatility: 0.02 },
      TSLA: { base: 250, range: [180, 350], volatility: 0.045 },
      default: { base: 100, range: [80, 130], volatility: 0.025 },
    }

    const config = stockPriceRanges[symbol] || stockPriceRanges['default']
    let basePrice = config.base + (Math.random() - 0.5) * 20

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // 更真实的价格变动模型
      const trendFactor = Math.sin(i / 10) * 0.001 // 长期趋势
      const randomWalk = (Math.random() - 0.5) * 2 * config.volatility
      const momentum = (Math.random() - 0.5) * 0.01 // 短期动量

      const totalChange = trendFactor + randomWalk + momentum
      basePrice = basePrice * (1 + totalChange)

      // 确保价格在合理范围内
      basePrice = Math.max(config.range[0], Math.min(config.range[1], basePrice))

      // 计算当日OHLC
      const open = basePrice
      const dayVolatility = config.volatility * (0.5 + Math.random() * 0.5)
      const close = open * (1 + (Math.random() - 0.5) * 2 * dayVolatility)

      // 确保高低价合理
      const maxPrice = Math.max(open, close)
      const minPrice = Math.min(open, close)
      const high = maxPrice * (1 + Math.random() * 0.015)
      const low = minPrice * (1 - Math.random() * 0.015)

      // 成交量模拟（价格波动大时成交量大）
      const priceChangePercent = Math.abs((close - open) / open)
      const baseVolume = 500000 + Math.random() * 500000
      const volume = Math.floor(baseVolume * (1 + priceChangePercent * 5))

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
  }, [])

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      try {
        const data = generateMockData(symbol, days)
        setStockData(data)
        setChartState((prev) => ({
          ...prev,
          endIndex: data.length,
          viewportEnd: data.length,
        }))
        setError(null)
      } catch (err) {
        setError('数据加载失败')
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [symbol, days, generateMockData])

  // 绘制K线图
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !stockData.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const padding = 60
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // 获取当前视口的数据
    const visibleData = stockData.slice(chartState.viewportStart, chartState.viewportEnd)
    if (!visibleData.length) return

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 找出价格范围
    const prices = visibleData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceScale = chartHeight / priceRange

    // 绘制背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制网格
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    // 水平网格线和价格标签
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()

      const price = maxPrice - (priceRange * i) / 5
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4)
    }

    // 垂直网格线和日期标签
    const timeStep = Math.max(1, Math.floor(visibleData.length / 8))
    for (let i = 0; i < visibleData.length; i += timeStep) {
      const x = padding + (chartWidth * i) / (visibleData.length - 1)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, canvas.height - padding)
      ctx.stroke()

      const date = new Date(visibleData[i].date)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillStyle = '#666'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(dateStr, x, canvas.height - 10)
    }

    // 绘制K线
    const candleWidth = Math.max(2, (chartWidth / visibleData.length) * 0.8)

    visibleData.forEach((item, index) => {
      const x = padding + (chartWidth * index) / (visibleData.length - 1)
      const openY = padding + (maxPrice - item.open) * priceScale
      const closeY = padding + (maxPrice - item.close) * priceScale
      const highY = padding + (maxPrice - item.high) * priceScale
      const lowY = padding + (maxPrice - item.low) * priceScale

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
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, 1)
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
      }
    })

    // 绘制边框
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 2
    ctx.strokeRect(padding, padding, chartWidth, chartHeight)

    // 绘制当前价格信息
    if (visibleData.length > 0) {
      const currentData = visibleData[visibleData.length - 1]
      const change = currentData.close - currentData.open
      const changePercent = ((change / currentData.open) * 100).toFixed(2)

      ctx.fillStyle = '#000'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`${symbol}: $${currentData.close.toFixed(2)}`, 10, 25)

      ctx.fillStyle = change >= 0 ? '#00c851' : '#ff3547'
      ctx.font = '12px sans-serif'
      ctx.fillText(
        `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent}%)`,
        10,
        45
      )
    }
  }, [stockData, chartState, symbol])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  // 鼠标滚轮缩放
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
      const maxVisible = Math.max(10, stockData.length)
      const currentVisible = chartState.viewportEnd - chartState.viewportStart
      const newVisible = Math.min(maxVisible, Math.max(10, Math.floor(currentVisible * zoomFactor)))

      if (newVisible !== currentVisible) {
        const center = (chartState.viewportStart + chartState.viewportEnd) / 2
        const newStart = Math.max(0, Math.floor(center - newVisible / 2))
        const newEnd = Math.min(stockData.length, newStart + newVisible)

        setChartState((prev) => ({
          ...prev,
          viewportStart: newStart,
          viewportEnd: newEnd,
        }))
      }
    },
    [stockData.length, chartState.viewportStart, chartState.viewportEnd]
  )

  // 鼠标拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setChartState((prev) => ({
      ...prev,
      isDragging: true,
      dragStartX: e.clientX,
    }))
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!chartState.isDragging || chartState.dragStartX === undefined) return

      const deltaX = e.clientX - chartState.dragStartX
      const canvas = canvasRef.current
      if (!canvas) return

      const sensitivity = (chartState.viewportEnd - chartState.viewportStart) / canvas.width
      const offset = Math.floor(deltaX * sensitivity)

      if (Math.abs(offset) > 0) {
        const newStart = Math.max(0, chartState.viewportStart - offset)
        const newEnd = Math.min(stockData.length, chartState.viewportEnd - offset)
        const viewportSize = chartState.viewportEnd - chartState.viewportStart

        if (newEnd - newStart === viewportSize) {
          setChartState((prev) => ({
            ...prev,
            viewportStart: newStart,
            viewportEnd: newEnd,
            dragStartX: e.clientX,
          }))
        }
      }
    },
    [chartState, stockData.length]
  )

  const handleMouseUp = useCallback(() => {
    setChartState((prev) => ({
      ...prev,
      isDragging: false,
      dragStartX: undefined,
    }))
  }, [])

  // 控制按钮功能
  const zoomIn = () => {
    const currentVisible = chartState.viewportEnd - chartState.viewportStart
    const newVisible = Math.max(10, Math.floor(currentVisible * 0.8))
    const center = (chartState.viewportStart + chartState.viewportEnd) / 2
    const newStart = Math.max(0, Math.floor(center - newVisible / 2))
    const newEnd = Math.min(stockData.length, newStart + newVisible)

    setChartState((prev) => ({
      ...prev,
      viewportStart: newStart,
      viewportEnd: newEnd,
    }))
  }

  const zoomOut = () => {
    const currentVisible = chartState.viewportEnd - chartState.viewportStart
    const newVisible = Math.min(stockData.length, Math.floor(currentVisible * 1.2))
    const center = (chartState.viewportStart + chartState.viewportEnd) / 2
    const newStart = Math.max(0, Math.floor(center - newVisible / 2))
    const newEnd = Math.min(stockData.length, newStart + newVisible)

    setChartState((prev) => ({
      ...prev,
      viewportStart: newStart,
      viewportEnd: newEnd,
    }))
  }

  const resetView = () => {
    setChartState((prev) => ({
      ...prev,
      viewportStart: 0,
      viewportEnd: stockData.length,
    }))
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
      {/* 控制面板 */}
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {symbol} 交互式股价走势图
            </h3>
            <p className="text-sm text-gray-500">
              显示 {chartState.viewportEnd - chartState.viewportStart} / {stockData.length} 天数据
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={zoomIn}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
              title="放大 (鼠标滚轮向上)"
            >
              🔍+
            </button>
            <button
              onClick={zoomOut}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
              title="缩小 (鼠标滚轮向下)"
            >
              🔍-
            </button>
            <button
              onClick={resetView}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600"
              title="重置视图"
            >
              🏠
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500">💡 使用鼠标拖拽移动视图，滚轮缩放，按钮快速操作</div>
      </div>

      {/* 图表区域 */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="w-full cursor-move"
          style={{
            height: typeof height === 'string' ? height : `${height}px`,
            width: typeof width === 'string' ? width : `${width}px`,
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* 底部信息 */}
      <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 dark:bg-gray-800">
        <span>交互式K线图 • 模拟数据仅供展示 • 支持拖拽和缩放操作</span>
      </div>
    </div>
  )
}

export default InteractiveStockChart
