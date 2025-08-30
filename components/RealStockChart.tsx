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

interface RealStockChartProps {
  symbol?: string
  width?: string | number
  height?: string | number
  days?: number
  useRealData?: boolean
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

const RealStockChart: React.FC<RealStockChartProps> = ({
  symbol = 'TMDX',
  width = '100%',
  height = 500,
  days = 90,
  useRealData = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock')

  // 图表状态
  const [chartState, setChartState] = useState<ChartState>({
    startIndex: 0,
    endIndex: days,
    scale: 1,
    isDragging: false,
    viewportStart: 0,
    viewportEnd: days,
  })

  // 获取真实股价数据 (使用免费API: Alpha Vantage 或 Yahoo Finance Proxy)
  const fetchRealStockData = useCallback(
    async (symbol: string, days: number): Promise<StockData[]> => {
      try {
        // 使用免费的Yahoo Finance代理API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${days}d`,
          {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        )

        if (!response.ok) {
          throw new Error('API请求失败')
        }

        const data = await response.json()

        if (!data.chart?.result?.[0]) {
          throw new Error('无法获取股价数据')
        }

        const result = data.chart.result[0]
        const timestamps = result.timestamp
        const quotes = result.indicators.quote[0]

        const stockData: StockData[] = timestamps.map((timestamp: number, index: number) => {
          const date = new Date(timestamp * 1000).toISOString().split('T')[0]
          return {
            date,
            open: Number((quotes.open[index] || 0).toFixed(2)),
            high: Number((quotes.high[index] || 0).toFixed(2)),
            low: Number((quotes.low[index] || 0).toFixed(2)),
            close: Number((quotes.close[index] || 0).toFixed(2)),
            volume: quotes.volume[index] || 0,
          }
        })

        return stockData.filter((item) => item.open > 0 && item.close > 0)
      } catch (error) {
        console.error('获取真实数据失败:', error)
        throw error
      }
    },
    []
  )

  // 生成模拟股价数据（基于真实范围）
  const generateMockData = useCallback((symbol: string, days: number): StockData[] => {
    const data: StockData[] = []

    // TMDX 2024-2025年实际交易范围参考
    const stockConfigs: {
      [key: string]: { base: number; range: [number, number]; volatility: number; trend: number }
    } = {
      TMDX: {
        base: 117, // 当前价格约$117 (2025年8月)
        range: [80, 180], // 2024-2025年实际交易范围，高点$177，当前$117左右
        volatility: 0.045, // 高波动率（生物科技股特点）
        trend: 0.001, // 轻微上涨趋势
      },
      AAPL: { base: 180, range: [150, 200], volatility: 0.02, trend: 0.001 },
      TSLA: { base: 250, range: [180, 350], volatility: 0.045, trend: 0.002 },
      default: { base: 100, range: [80, 130], volatility: 0.025, trend: 0 },
    }

    const config = stockConfigs[symbol] || stockConfigs['default']
    let currentPrice = config.base + (Math.random() - 0.5) * 15

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // 更复杂的价格模型
      const cyclicalTrend = Math.sin(i / 15) * 0.005 // 周期性波动
      const randomWalk = (Math.random() - 0.5) * config.volatility * 2
      const momentum = (Math.random() - 0.5) * 0.015 // 动量因子
      const reversion = ((config.base - currentPrice) / config.base) * 0.005 // 均值回归

      const totalChange = config.trend + cyclicalTrend + randomWalk + momentum + reversion
      currentPrice *= 1 + totalChange

      // 限制价格范围
      currentPrice = Math.max(config.range[0], Math.min(config.range[1], currentPrice))

      // 生成当日OHLC
      const open = currentPrice
      const dayRange = config.volatility * (0.3 + Math.random() * 0.7)

      // 随机决定当日涨跌
      const dailyDirection = Math.random() - 0.5
      const close = open * (1 + dailyDirection * dayRange)

      const maxPrice = Math.max(open, close)
      const minPrice = Math.min(open, close)
      const high = maxPrice * (1 + Math.random() * 0.02)
      const low = minPrice * (1 - Math.random() * 0.02)

      // 成交量与价格波动相关
      const priceChange = Math.abs((close - open) / open)
      const baseVolume = symbol === 'TMDX' ? 400000 : 1000000
      const volume = Math.floor(baseVolume * (1 + priceChange * 8) * (0.5 + Math.random()))

      data.push({
        date: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      })

      currentPrice = close
    }

    return data
  }, [])

  // 数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        let data: StockData[] = []

        if (useRealData) {
          try {
            data = await fetchRealStockData(symbol, days)
            setDataSource('api')
          } catch (apiError) {
            console.warn('真实数据获取失败，使用模拟数据:', apiError)
            data = generateMockData(symbol, days)
            setDataSource('mock')
            setError('真实数据获取失败，显示模拟数据')
          }
        } else {
          data = generateMockData(symbol, days)
          setDataSource('mock')
        }

        setStockData(data)
        setChartState((prev) => ({
          ...prev,
          endIndex: data.length,
          viewportEnd: data.length,
        }))
      } catch (err) {
        setError('数据加载失败')
        console.error('数据加载错误:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [symbol, days, useRealData, fetchRealStockData, generateMockData])

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

    const visibleData = stockData.slice(chartState.viewportStart, chartState.viewportEnd)
    if (!visibleData.length) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const prices = visibleData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceScale = chartHeight / priceRange

    // 背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 网格线
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

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

    // K线
    const candleWidth = Math.max(2, (chartWidth / visibleData.length) * 0.8)

    visibleData.forEach((item, index) => {
      const x = padding + (chartWidth * index) / (visibleData.length - 1)
      const openY = padding + (maxPrice - item.open) * priceScale
      const closeY = padding + (maxPrice - item.close) * priceScale
      const highY = padding + (maxPrice - item.high) * priceScale
      const lowY = padding + (maxPrice - item.low) * priceScale

      const isUp = item.close > item.open
      const color = isUp ? '#00c851' : '#ff3547'

      // 影线
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // 实体
      ctx.fillStyle = color
      const bodyHeight = Math.abs(closeY - openY)
      const bodyY = Math.min(openY, closeY)

      if (bodyHeight < 1) {
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, 1)
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
      }
    })

    // 边框
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 2
    ctx.strokeRect(padding, padding, chartWidth, chartHeight)

    // 当前价格信息
    if (visibleData.length > 0) {
      const currentData = visibleData[visibleData.length - 1]
      const previousData = visibleData[visibleData.length - 2] || currentData
      const change = currentData.close - previousData.close
      const changePercent = ((change / previousData.close) * 100).toFixed(2)

      ctx.fillStyle = '#000'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`${symbol}: $${currentData.close.toFixed(2)}`, 10, 25)

      ctx.fillStyle = change >= 0 ? '#00c851' : '#ff3547'
      ctx.font = '14px sans-serif'
      ctx.fillText(
        `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent}%)`,
        10,
        45
      )

      // 数据源标识
      ctx.fillStyle = '#888'
      ctx.font = '10px sans-serif'
      ctx.fillText(
        `数据源: ${dataSource === 'api' ? '真实数据' : '模拟数据'}`,
        10,
        canvas.height - 10
      )
    }
  }, [stockData, chartState, symbol, dataSource])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  // 交互事件处理（与之前相同）
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
            <p className="text-gray-500">
              {useRealData ? '获取真实股价数据中...' : '生成股价数据中...'}
            </p>
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
              {symbol} {dataSource === 'api' ? '实时' : '模拟'}股价图表
            </h3>
            <p className="text-sm text-gray-500">
              显示 {chartState.viewportEnd - chartState.viewportStart} / {stockData.length} 天数据
              {error && <span className="ml-2 text-orange-500">⚠️ {error}</span>}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={zoomIn}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
              title="放大"
            >
              🔍+
            </button>
            <button
              onClick={zoomOut}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
              title="缩小"
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
        <div className="text-xs text-gray-500">
          💡 鼠标拖拽移动 • 滚轮缩放 •{' '}
          {dataSource === 'api'
            ? '显示Yahoo Finance真实数据'
            : '基于2024年TMDX实际交易范围($25-$75)的智能模拟数据'}
        </div>
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

      <div className="bg-gray-50 p-2 text-center text-xs text-gray-500 dark:bg-gray-800">
        <span>
          {dataSource === 'api'
            ? '基于Yahoo Finance API的真实股价数据'
            : '基于TMDX 2024年实际交易特征的智能模拟数据 • 仅供展示分析'}
        </span>
      </div>
    </div>
  )
}

export default RealStockChart
