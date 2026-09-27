#!/usr/bin/env bash
# 一键发布博客到 GitHub Pages（abertzhang.github.io）
# 用法：在终端进入项目目录后执行  bash publish.sh
# 说明：不依赖任何 token；使用你本机已配置的 git 凭据（SSH 或你自己的 HTTPS 凭据）推送。

set -euo pipefail
cd "$(dirname "$0")"

echo "==> 当前待提交改动（确认无误后再继续）==>"
git status --short
echo

read -r -p "确认提交并推送到 origin/main? [y/N] " ans
if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
  echo "已取消，未做任何改动。"
  exit 0
fi

# 仅添加博客相关文件。
# .workbuddy/、article/、md_flutter/、doc/ 已在 .gitignore 中排除，不会被提交。
git add content lib app .gitignore next.config.mjs

git commit -m "Add English articles (StatefulBuilder, Gin); update content loader"

git push origin main

echo
echo "✅ 已推送。GitHub Actions 会自动构建并部署，约 1-2 分钟后生效："
echo "   https://abertzhang.github.io"
