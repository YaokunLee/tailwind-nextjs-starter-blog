import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import TradingViewWidget from './TradingViewWidget'
import StockChart from './StockChart'
import InteractiveStockChart from './InteractiveStockChart'
import RealStockChart from './RealStockChart'
import YahooFinanceChart from './YahooFinanceChart'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  TradingViewWidget,
  StockChart,
  InteractiveStockChart,
  RealStockChart,
  YahooFinanceChart,
}
