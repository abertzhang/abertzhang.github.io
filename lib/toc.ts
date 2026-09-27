/**
 * 文章目录（TOC）提取 —— 在服务端 / 构建期从 Markdown 正文解析出 h1~h3 标题，
 * 并使用 github-slugger（与 PostContent 组件里 rehype-slug 同款算法）生成锚点 id，
 * 从而保证右侧目录的跳转目标与正文标题元素的 id 完全一致。
 *
 * 关键点：rehype-slug 内部就是 `new GithubSlugger().slug(标题纯文本)`，
 * 因此这里也必须用同一个库、按同样的「出现顺序」逐个 slug，重复标题才会得到相同的 -1 / -2 后缀。
 */

import GithubSlugger from 'github-slugger';

/** 单个目录项 */
export interface TocItem {
  /** 标题层级（1~3，对应 # / ## / ###） */
  level: number;
  /** 标题纯文本（已去除常见行内 Markdown 符号，贴近 rehype-slug 实际看到的文本） */
  text: string;
  /** 锚点 id，对应正文标题元素的 id 属性 */
  id: string;
}

/**
 * 去除标题中常见的行内 Markdown 标记，使 text 尽量贴近 rehype-slug 看到的正文纯文本节点，
 * 从而让 slug 计算结果保持一致（例如 `**粗**` → `粗`，`` `code` `` → `code`）。
 */
function stripInlineMarkdown(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/[*_~]+/g, '') // 强调 / 删除线符号
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接 [text](url) → text
    .trim();
}

/**
 * 从 Markdown 正文提取目录。
 * 会跳过代码围栏（``` 或 ~~~ 包裹的内容）内的 # 行，避免把代码里的井号误判为标题。
 *
 * @param markdown 已剥离 frontmatter 的文章正文
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const lines = markdown.split('\n');
  const items: TocItem[] = [];

  // 跟踪代码围栏状态：进入 ``` / ~~~ 后一直到同类标记结束前，内部的 # 都不算标题
  let inFence = false;
  let fenceMarker = '';

  for (const line of lines) {
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[2][0]; // ` 或 ~
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }
    if (inFence) continue;

    // 匹配 ATX 风格标题：1~3 个井号 + 空格 + 文本（忽略行尾用于关闭的 #）
    const heading = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const level = heading[1].length;
    const text = stripInlineMarkdown(heading[2]);
    if (!text) continue;

    // 与 rehype-slug 一样：传入纯文本，按顺序 slug（重复标题自动追加 -1 / -2）
    const id = slugger.slug(text);
    items.push({ level, text, id });
  }

  return items;
}
