/**
 * Next.js 静态导出配置（部署到 GitHub Pages / 任意静态托管）
 *
 * - output: 'export'  →  `next build` 生成纯静态文件到 `out/`，无需 Node 服务器
 * - images.unoptimized → 静态导出不支持 Next 图片优化，关闭后用普通 <img>
 * - basePath / assetPrefix → 适配 GitHub Project Pages（如 https://user.github.io/repo）。
 *     · 自定义域名 或 user.github.io（根页）部署：保持 BASE_PATH 为空即可。
 *     · 项目页部署：构建时执行 `BASE_PATH=/你的仓库名 next build`。
 */
const basePath = process.env.BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
