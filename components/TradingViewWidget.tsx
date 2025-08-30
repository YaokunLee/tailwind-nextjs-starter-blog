'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  width?: string | number
  height?: string | number
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'NASDAQ:TMDX',
  width = '100%', 
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 清理之前的脚本
    if (scriptRef.current) {
      document.head.removeChild(scriptRef.current)
    }

    // 生成唯一ID
    const widgetId = `tradingview_${Date.now()}`
    container.id = widgetId

    // 创建脚本
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'zh_CN',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: widgetId
    })

    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [symbol])

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{
          height: typeof height === 'string' ? height : `${height}px`,
          width: typeof width === 'string' ? width : `${width}px`,
        }}
      >
        <div className="tradingview-widget-container__widget"></div>
      </div>
      <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
        <a
          href={`https://zh.tradingview.com/symbols/${symbol}/`}
          rel="noopener nofollow"
          target="_blank"
          className="text-blue-500 hover:text-blue-700"
        >
          {symbol}
        </a>
        {' '}由 TradingView 提供
      </div>
    </div>
  )
}

export default TradingViewWidget