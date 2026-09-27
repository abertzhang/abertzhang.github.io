'use client';

/**
 * 文章右侧目录（TOC）组件（客户端）。
 *  - 仅做展示：列出构建期提取的章节标题，不可点击、无下划线（纯阅读索引）
 *  - 监听滚动，高亮「当前正在阅读」的章节，贴近阅读进度（仅视觉指示，非点击功能）
 *  - 滚动到页面底部时，强制高亮最后一个章节，避免长文尾部始终无高亮
 */
import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/toc';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // 计算当前应高亮的章节：取「顶部已滚过 sticky header 余量」的最后一个标题
    const computeActive = () => {
      const offset = 100; // sticky header(64px) + 余量
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - offset <= 0) {
          current = h.id;
        } else {
          break;
        }
      }
      // 接近页面底部时强制高亮最后一项，保证长文结尾也有指示
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 4;
      if (scrolledToBottom) {
        current = headings[headings.length - 1].id;
      }
      setActiveId(current);
    };

    computeActive();
    window.addEventListener('scroll', computeActive, { passive: true });
    window.addEventListener('resize', computeActive);
    return () => {
      window.removeEventListener('scroll', computeActive);
      window.removeEventListener('resize', computeActive);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <p className="toc-title">On this page</p>
      <ul className="toc-list">
        {items.map((it) => (
          <li key={it.id} className={`toc-item toc-level-${it.level}`}>
            {/* 纯展示标题：不可点击、无下划线，仅随滚动高亮当前章节 */}
            <span
              className={
                activeId === it.id ? 'toc-link active' : 'toc-link'
              }
            >
              {it.text}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
