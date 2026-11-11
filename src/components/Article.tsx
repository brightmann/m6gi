import { useRemarkSync } from 'react-remark'
import remarkGfm from 'remark-gfm'
import rehypeExternalLinks from 'rehype-external-links'
import {
  IconCalendar,
  IconClock,
  IconCopy,
  IconSquareRoundedCheck,
} from '@tabler/icons-react'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeFigure from 'rehype-figure'
import remarkWikiLinkPlugin from '@script/remark-wiki-url'
import dayjs from 'dayjs'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { cx } from '@emotion/css'
import { copyToClipboardFromNode } from '@/utils'
import rehypePrism from 'rehype-prism-plus'
import rehypeClassNames from 'rehype-class-names'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

const PreElement: React.FC<PropsWithChildren<{}>> = ({ children, ...rest }) => {
  const [showCopyBtn, setShowCopyBtn] = useState(false)
  const preNode = useRef<HTMLPreElement>(null)
  return (
    <div
      className="pre-copy"
      onMouseEnter={() => setShowCopyBtn(true)}
      onMouseLeave={() => setShowCopyBtn(false)}
    >
      <CopyButton
        visible={showCopyBtn}
        className={cx(
          showCopyBtn ? 'pre-copy-button--fade-in' : 'pre-copy-button--fade-out'
        )}
        node={preNode.current}
      />
      <pre ref={preNode} {...rest}>
        {children}
      </pre>
    </div>
  )
}

const CopyButton: React.FC<{
  node: Element | null
  className?: string
  visible: boolean
}> = ({ node, className, visible }) => {
  const [isCopied, setIsCopied] = useState(false)
  const handleCopy = () => {
    if (node) {
      copyToClipboardFromNode(node)
      setIsCopied(true)
    }
  }
  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setIsCopied(false)
      }, 500)
    }
  }, [visible])
  return (
    <div
      className={cx('pre-copy-button', className)}
      onClick={handleCopy}
      title={isCopied ? 'Copied' : 'Copy'}
    >
      {isCopied ? (
        <IconSquareRoundedCheck size={18} color="green" />
      ) : (
        <IconCopy size={18} />
      )}
    </div>
  )
}

// Raw HTML in posts is parsed, sanitized, and limited to safe tags; iframes
// are additionally restricted to https YouTube embeds (per-site allowlisting
// happens on request, never all iframes open).
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      'src',
      'width',
      'height',
      'title',
      'allow',
      'loading',
      'frameBorder',
      'allowFullScreen',
      'referrerPolicy',
    ],
  },
}

const isAllowedIframeSrc = (src: unknown) =>
  typeof src === 'string' &&
  /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\//.test(src)
 /^https:\/\/(www\.)?(youku\.com)\//.test(src)
/^https:\/\/(www\.)?(videa\.hu)\//.test(src)
const rehypeYoutubeIframesOnly = () => (tree: any) => {
  const walk = (node: any) => {
    if (!node || !Array.isArray(node.children)) return
    node.children = node.children.filter(
      (child: any) =>
        child.tagName !== 'iframe' || isAllowedIframeSrc(child.properties?.src)
    )
    node.children.forEach(walk)
  }
  walk(tree)
}

const Article: React.FC<{ post: Post }> = ({ post }) => {
  const reactContent = useRemarkSync(post.content, {
    remarkToRehypeOptions: { allowDangerousHtml: true },
    remarkPlugins: [
      remarkGfm,
      [
        remarkWikiLinkPlugin,
        { cdnUrl: 'https://cdn.jsdelivr.net/gh/marsk6/image-center@master' },
      ],
    ],
    rehypePlugins: [
      rehypeRaw,
      [rehypeSanitize, sanitizeSchema],
      rehypeYoutubeIframesOnly,
      [rehypeExternalLinks, { target: '_blank' }],
      rehypeSlug,
      rehypeAutolinkHeadings,
      rehypeFigure,
      [rehypePrism, { showLineNumbers: true }],
      [rehypeClassNames, { a: 'text-underline' }]
    ],
    rehypeReactOptions: {
      components: {
        pre: PreElement,
        img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
          <img {...props} loading="lazy" decoding="async" />
        ),
      },
    },
  })
  return (
    <article className="p-2">
      <header className="mb-4">
        <h1 className="text-center font-medium md:text-4xl text-3xl">
          {post.title}
        </h1>
        <div className="mt-2 flex justify-center text-xs items-center gap-4">
          <div className="flex gap-0.5 items-center">
            <IconCalendar size={12} />
            <span>{`发布于 ${dayjs(post.ctime).format('YYYY-MM-DD')}`}</span>
          </div>
          <div className="flex gap-0.5 items-center">
            <IconClock size={12} />
            <span>约 {post.readingTime} 分钟</span>
          </div>
        </div>
      </header>
      <section className="markdown-body max-w-none dark:bg-[#19191c]">
        {reactContent}
      </section>
    </article>
  )
}

export default Article
