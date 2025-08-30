# 如何在博客中插入股票 K 线图

本指南将教您如何在博客文章中集成股票 K 线图，让读者能够直观地查看股票的价格走势。

## 目录
- [方案选择](#方案选择)
- [方案一：使用 TradingView 组件](#方案一使用-tradingview-组件)
- [方案二：使用 Recharts 自定义图表](#方案二使用-recharts-自定义图表)
- [方案三：使用 Chart.js 绘制 K 线](#方案三使用-chartjs-绘制-k-线)
- [数据源获取](#数据源获取)
- [在 MDX 文章中使用](#在-mdx-文章中使用)

## 方案选择

根据不同需求，我们提供三种方案：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| TradingView | 专业、功能丰富、免费 | 需要网络连接 | 快速集成，专业展示 |
| Recharts | 自定义程度高、轻量 | 需要自己获取数据 | 定制化需求高 |
| Chart.js | 功能强大、社区活跃 | 配置较复杂 | 复杂图表需求 |

## 方案一：使用 TradingView 组件

### 1. 安装依赖

```bash
yarn add react-tradingview-widget
# 或
npm install react-tradingview-widget
```

### 2. 创建 TradingView 组件

在 `components/` 目录下创建 `TradingViewWidget.tsx`：

```typescript
'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  width?: string | number
  height?: string | number
  interval?: string
  theme?: 'light' | 'dark'
  style?: string
  locale?: string
  toolbar_bg?: string
  enable_publishing?: boolean
  hide_top_toolbar?: boolean
  hide_legend?: boolean
  save_image?: boolean
  container_id?: string
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'NASDAQ:AAPL',
  width = '100%',
  height = 400,
  interval = 'D',
  theme = 'light',
  style = '1',
  locale = 'zh_CN',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = true,
  container_id = 'tradingview-widget'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Asia/Shanghai',
      theme,
      style,
      locale,
      toolbar_bg,
      enable_publishing,
      hide_top_toolbar,
      hide_legend,
      save_image,
      container_id
    })

    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current && containerRef.current.contains(script)) {
        containerRef.current.removeChild(script)
      }
    }
  }, [symbol, interval, theme, style, locale])

  return (
    <div className="tradingview-widget-container rounded-lg border border-gray-200 dark:border-gray-700">
      <div
        ref={containerRef}
        className="tradingview-widget"
        style={{ height, width }}
      />
      <div className="tradingview-widget-copyright text-center text-xs text-gray-500 p-2">
        <a
          href={`https://zh.tradingview.com/symbols/${symbol}/`}
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="text-blue-500">{symbol}</span>
        </a>
        由 TradingView 提供
      </div>
    </div>
  )
}

export default TradingViewWidget
```

### 3. 创建简化版本

创建 `components/StockChart.tsx` 以便在文章中更方便使用：

```typescript
'use client'

import TradingViewWidget from './TradingViewWidget'

interface StockChartProps {
  symbol: string
  height?: number
  theme?: 'light' | 'dark'
  interval?: 'D' | 'W' | 'M' | '1' | '5' | '15' | '30' | '60' | '240'
}

const StockChart: React.FC<StockChartProps> = ({ 
  symbol, 
  height = 400, 
  theme = 'light',
  interval = 'D'
}) => {
  return (
    <div className="my-6">
      <TradingViewWidget
        symbol={symbol}
        height={height}
        theme={theme}
        interval={interval}
        hide_top_toolbar={false}
        save_image={true}
      />
    </div>
  )
}

export default StockChart
```

## 方案二：使用 Recharts 自定义图表

### 1. 安装依赖

```bash
yarn add recharts axios date-fns
# 或
npm install recharts axios date-fns
```

### 2. 创建 K 线图组件

创建 `components/CandlestickChart.tsx`：

```typescript
'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  Line
} from 'recharts'
import axios from 'axios'
import { format } from 'date-fns'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  symbol: string
  days?: number
  height?: number
}

// 自定义蜡烛图组件
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props
  if (!payload) return null

  const { open, high, low, close } = payload
  const isPositive = close > open
  const color = isPositive ? '#10b981' : '#ef4444'
  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(open, close)

  return (
    <g>
      {/* 影线 */}
      <line
        x1={x + width / 2}
        y1={high}
        x2={x + width / 2}
        y2={low}
        stroke={color}
        strokeWidth={1}
      />
      {/* 实体 */}
      <rect
        x={x + width * 0.2}
        y={bodyY}
        width={width * 0.6}
        height={bodyHeight || 1}
        fill={color}
        stroke={color}
      />
    </g>
  )
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  days = 30,
  height = 400
}) => {
  const [data, setData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true)
        // 这里使用 Alpha Vantage API 作为示例
        // 您需要在 https://www.alphavantage.co/support/#api-key 获取免费 API Key
        const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        )

        const timeSeries = response.data['Time Series (Daily)']
        if (!timeSeries) {
          throw new Error('无法获取股票数据')
        }

        const stockData: StockData[] = Object.entries(timeSeries)
          .slice(0, days)
          .map(([date, data]: [string, any]) => ({
            date: format(new Date(date), 'MM-dd'),
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume'])
          }))
          .reverse()

        setData(stockData)
      } catch (err) {
        setError('获取股票数据失败')
        console.error('Error fetching stock data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [symbol, days])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-500" style={{ height }}>
        {error}
      </div>
    )
  }

  return (
    <div className="my-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{symbol} 股价走势</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border rounded shadow">
                    <p className="font-semibold">{label}</p>
                    <p>开盘: {data.open}</p>
                    <p>最高: {data.high}</p>
                    <p>最低: {data.low}</p>
                    <p>收盘: {data.close}</p>
                    <p>成交量: {data.volume.toLocaleString()}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="volume" yAxisId="volume" fill="#8884d8" opacity={0.3} />
          <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CandlestickChart
```

## 方案三：使用 Chart.js 绘制 K 线

### 1. 安装依赖

```bash
yarn add react-chartjs-2 chart.js chartjs-chart-financial chartjs-adapter-date-fns
# 或
npm install react-chartjs-2 chart.js chartjs-chart-financial chartjs-adapter-date-fns
```

### 2. 创建 Chart.js K 线组件

创建 `components/ChartJSCandlestick.tsx`：

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial'
import 'chartjs-adapter-date-fns'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
)

interface ChartJSCandlestickProps {
  symbol: string
  height?: number
}

const ChartJSCandlestick: React.FC<ChartJSCandlestickProps> = ({
  symbol,
  height = 400
}) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据获取
    const fetchData = async () => {
      try {
        // 这里应该调用真实的股票数据 API
        // 示例数据
        const mockData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (30 - i))
          const basePrice = 100 + Math.random() * 50
          const open = basePrice + (Math.random() - 0.5) * 5
          const close = open + (Math.random() - 0.5) * 8
          const high = Math.max(open, close) + Math.random() * 3
          const low = Math.min(open, close) - Math.random() * 3

          return {
            x: date.getTime(),
            o: open,
            h: high,
            l: low,
            c: close
          }
        })

        setData({
          datasets: [
            {
              label: symbol,
              data: mockData,
              color: {
                up: '#10b981',
                down: '#ef4444',
                unchanged: '#6b7280'
              },
              borderColor: {
                up: '#10b981',
                down: '#ef4444',
                unchanged: '#6b7280'
              },
              borderWidth: 1
            }
          ]
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const
        }
      },
      y: {
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const data = context.raw
            return [
              `开盘: ${data.o?.toFixed(2)}`,
              `最高: ${data.h?.toFixed(2)}`,
              `最低: ${data.l?.toFixed(2)}`,
              `收盘: ${data.c?.toFixed(2)}`
            ]
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="my-6 p-4 border rounded-lg" style={{ height }}>
      <h3 className="text-lg font-semibold mb-4">{symbol} K线图</h3>
      <Chart type="candlestick" data={data} options={options} />
    </div>
  )
}

export default ChartJSCandlestick
```

## 数据源获取

### 免费数据源

1. **Alpha Vantage**
   ```
   https://www.alphavantage.co/
   免费配额：每分钟 5 次请求，每天 500 次
   ```

2. **Yahoo Finance API**
   ```bash
   yarn add yahoo-finance2
   ```

3. **IEX Cloud**
   ```
   https://iexcloud.io/
   有免费套餐
   ```

### 环境变量配置

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here
NEXT_PUBLIC_IEX_TOKEN=your_iex_token_here
```

## 在 MDX 文章中使用

### 1. 注册组件

在 `components/MDXComponents.tsx` 中添加：

```typescript
import StockChart from './StockChart'
import CandlestickChart from './CandlestickChart'
import ChartJSCandlestick from './ChartJSCandlestick'

export const components = {
  // ... 其他组件
  StockChart,
  CandlestickChart,
  ChartJSCandlestick,
}
```

### 2. 在文章中使用

在您的 MDX 文章中直接使用组件：

```mdx
---
title: '苹果公司股票分析'
date: '2024-12-30'
tags: ['股票', '投资', '分析']
---

# 苹果公司股票分析

让我们来看看苹果公司（AAPL）最近的股价表现：

## TradingView 专业图表
<StockChart symbol="NASDAQ:AAPL" height={500} />

## 自定义 K 线图
<CandlestickChart symbol="AAPL" days={60} />

## Chart.js 版本
<ChartJSCandlestick symbol="AAPL" />

从上面的图表可以看出...
```

## 样式自定义

### 深色模式支持

在组件中添加深色模式检测：

```typescript
import { useTheme } from 'next-themes'

const StockChart = () => {
  const { theme } = useTheme()
  
  return (
    <StockChart 
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}
```

### 响应式设计

使用 Tailwind CSS 类名实现响应式：

```typescript
<div className="w-full h-64 md:h-96 lg:h-[500px]">
  <StockChart symbol="AAPL" />
</div>
```

## 注意事项

1. **API 限制**：注意各个数据源的请求频率限制
2. **缓存策略**：考虑实现数据缓存以提高性能
3. **错误处理**：实现完善的错误处理机制
4. **SEO**：股票图表可能影响页面加载速度，考虑懒加载
5. **合规性**：确保遵守相关金融数据使用协议

## 扩展功能

- 添加技术指标（MA、MACD、RSI等）
- 实现多股票对比
- 添加交易量显示
- 支持不同时间周期切换
- 实现数据导出功能

这样，您就可以在博客文章中轻松插入专业的股票 K 线图了！