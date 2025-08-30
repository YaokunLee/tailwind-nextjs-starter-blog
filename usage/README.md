# 博客模板使用指南

这是一份详细的使用说明，帮助您快速上手这个 Tailwind Next.js 博客模板。

## 目录
- [环境准备](#环境准备)
- [项目配置](#项目配置)
- [文章管理](#文章管理)
- [作者管理](#作者管理)
- [样式自定义](#样式自定义)
- [部署发布](#部署发布)

## 环境准备

### 系统要求
- Node.js 18+ 
- Yarn 3.6.1（推荐）或 npm

### 安装依赖
```bash
yarn install
# 或
npm install
```

### 启动开发服务器
```bash
yarn dev
# 或
npm run dev
```

访问 `http://localhost:3000` 查看博客。

## 项目配置

### 基本站点信息
编辑 `data/siteMetadata.js` 文件：

```javascript
const siteMetadata = {
  title: '你的博客标题',
  author: '你的名字',
  headerTitle: '网站标题',
  description: '网站描述',
  language: 'zh-cn',
  theme: 'system',
  siteUrl: 'https://your-domain.com',
  siteRepo: 'https://github.com/your-username/your-repo',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  email: 'your-email@example.com',
  github: 'https://github.com/your-username',
  twitter: 'https://twitter.com/your-username',
  // ... 其他配置
}
```

### 导航菜单
编辑 `data/headerNavLinks.ts`：

```typescript
const headerNavLinks = [
  { href: '/', title: '首页' },
  { href: '/blog', title: '博客' },
  { href: '/tags', title: '标签' },
  { href: '/projects', title: '项目' },
  { href: '/about', title: '关于' },
]
```

## 文章管理

### 新增文章

#### 1. 创建文章文件
在 `data/blog/` 目录下创建 MDX 文件：

```
data/blog/
├── 2024-01-01-new-year-post.mdx
├── 2024-02-15-react-tutorial.mdx
└── subfolder/
    └── 2024-03-10-nested-post.mdx
```

#### 2. 文章前言格式
每篇文章顶部必须包含前言（frontmatter）：

```yaml
---
title: '文章标题'
date: '2024-12-30'
tags: ['React', 'Next.js', '教程']
draft: false
summary: '这篇文章的简要描述，会在文章列表中显示'
authors: ['default']
images: ['/static/images/article-banner.jpg']
canonicalUrl: 'https://original-site.com/article'
---
```

**字段说明**：
- `title`: 文章标题（必需）
- `date`: 发布日期，格式 YYYY-MM-DD（必需）
- `tags`: 标签数组
- `draft`: 草稿状态，true 不会显示
- `summary`: 文章摘要
- `authors`: 作者数组
- `images`: 文章图片（用于 SEO）
- `canonicalUrl`: 原文链接（可选）

#### 3. 文章内容编写
支持完整的 Markdown 语法和扩展功能：

```markdown
# 一级标题

## 二级标题

### 代码块
\```javascript
const greeting = 'Hello World';
console.log(greeting);
\```

### 数学公式
行内公式：$E = mc^2$

块级公式：
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

### 图片
![描述文字](/static/images/example.jpg)

### 表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容1 | 内容2 | 内容3 |

### 引用
> 这是一个引用块

### 列表
- 无序列表项1
- 无序列表项2

1. 有序列表项1
2. 有序列表项2
```

#### 4. 特殊功能

**GitHub 样式提醒**：
```markdown
> [!NOTE]
> 这是一个提示信息

> [!WARNING]
> 这是一个警告信息

> [!IMPORTANT]
> 这是重要信息
```

**引用文献**：
```markdown
这是一个引用 [^1]

[^1]: 这是引用的内容
```

### 删除文章
直接删除 `data/blog/` 目录下对应的 MDX 文件即可。

### 编辑文章
直接编辑对应的 MDX 文件，保存后重新构建即可。

## 作者管理

### 添加新作者

1. 在 `data/authors/` 目录下创建 MDX 文件：
```
data/authors/john-doe.mdx
```

2. 添加作者信息：
```yaml
---
name: 'John Doe'
avatar: '/static/images/authors/john-doe.jpg'
occupation: '软件工程师'
company: 'Tech Company'
email: 'john@example.com'
twitter: 'https://twitter.com/johndoe'
linkedin: 'https://linkedin.com/in/johndoe'
github: 'https://github.com/johndoe'
---

这里是作者的详细介绍...
```

3. 在文章中使用：
```yaml
authors: ['default', 'john-doe']
```

### 修改默认作者
编辑 `data/authors/default.mdx` 文件。

## 样式自定义

### 颜色主题
编辑 `css/tailwind.css` 文件中的 `@theme` 部分：

```css
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  /* ... */
}
```

### 字体
在 `app/layout.tsx` 中修改 Google Fonts 导入：

```typescript
import { Space_Grotesk } from 'next/font/google'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})
```

### 自定义组件
可以在 `components/` 目录下添加自定义组件，并在 MDX 文件中使用。

## 部署发布

### 构建项目
```bash
yarn build
# 或
npm run build
```

### 部署选项

#### 1. Vercel（推荐）
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署

#### 2. Netlify
1. 构建命令：`yarn build`
2. 发布目录：`out`（如果使用静态导出）

#### 3. 静态导出
修改 `next.config.js`：
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

然后运行：
```bash
yarn build
```

### 环境变量配置
根据需要在部署平台设置环境变量：
- 分析工具 API 密钥
- 评论系统配置
- 邮件订阅服务配置

## 常见问题

### 1. 文章没有显示
- 检查 `draft: false` 是否设置正确
- 确认文件格式为 `.mdx`
- 检查前言格式是否正确

### 2. 样式没有生效
- 运行 `yarn dev` 重启开发服务器
- 检查 Tailwind 类名是否正确

### 3. 构建失败
- 检查 MDX 语法是否正确
- 确保所有图片路径存在
- 运行 `yarn lint` 检查代码问题

### 4. 图片不显示
- 确保图片放在 `public/static/images/` 目录
- 检查图片路径是否以 `/static/` 开头

## 高级功能

### 搜索功能
- 支持 Kbar 命令面板搜索
- 支持 Algolia 搜索集成

### 分析集成
- Google Analytics
- Umami
- Plausible
- Posthog

### 评论系统
- Giscus（基于 GitHub Discussions）
- Utterances（基于 GitHub Issues）
- Disqus

### 邮件订阅
- Mailchimp
- Buttondown
- Convertkit
- Klaviyo
- Revue

更多配置详见 `data/siteMetadata.js` 文件。

---

如有问题，请查阅项目的 README.md 文件或提交 Issue。