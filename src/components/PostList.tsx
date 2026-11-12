import Link from 'next/link'
import { cx } from '@emotion/css'

export type GroupedPosts = { [year: string]: Post[] }

// Group newest-first posts by year, preserving order inside each year.
export const groupPostsByYear = (allPosts: Post[]): GroupedPosts => {
  const posts: GroupedPosts = {}
  allPosts.forEach((post) => {
    const year = new Date(post.ctime).getFullYear()
    if (!posts[year]) {
      posts[year] = []
    }
    posts[year].push(post)
  })
  return posts
}

type PostListProps = {
  posts: GroupedPosts
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  const items = Object.keys(posts)
    .sort((a, b) => +b - +a)
    .map((year) => {
      return (
        <section key={year}>
          <header
            className={cx(
              'font-medium',
              'text-3xl text-center mb-2',
              'md:text-2xl md:text-left'
            )}
          >
            {year}
          </header>
          {posts[year].map((post) => (
            <article
              className={cx(
                'flex items-center',
                'text-xl my-6 leading-10',
                'md:text-lg md:mb-0 md:mt-4'
              )}
              key={post.slug}
            >
              <Link
                passHref
                legacyBehavior
                href={{
                  pathname: '/posts/[slug]',
                  query: { slug: post.slug },
                }}
              >
                <a
                  className={cx(
                    'text-slate-900 dark:text-[#c9d1d9] font-medium',
                    'md:ml-6',
                    'leading-normal',
                    'text-underline'
                  )}
                >
                  {post.title}
                </a>
              </Link>
              <div className="hidden md:block flex-1 border-dashed border-slate-300 border-t mx-3" />
              <div
                className={cx(
                  'w-16 text-slate-500 dark:text-slate-200',
                  'hidden text-base',
                  'md:block'
                )}
              >
                {post.date}
              </div>
            </article>
          ))}
        </section>
      )
    })
  return <section className="flex flex-col gap-8 md:gap-8">{items}</section>
}

export default PostList
