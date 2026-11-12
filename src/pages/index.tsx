import { getAllPosts, pageSize } from '@/api/local'
import { NextSeo, ArticleJsonLd } from 'next-seo'
import PostList, { groupPostsByYear, GroupedPosts } from '@/components/PostList'
import Pagination from '@/components/ui/Pagination'

export type PageProps = {
  posts: GroupedPosts
  pageNum: number
  totalPage: number
}

const Home: React.FC<PageProps> = ({ posts, pageNum, totalPage }) => {
  return (
    <>
      <NextSeo
        title={process.env.BLOG.title}
        description="记录自己的前端工作总结，学习积累，技术思考，疑难问题"
        canonical={process.env.BLOG.site}
      />
      <ArticleJsonLd
        type="BlogPosting"
        url={process.env.BLOG.site}
        title={process.env.BLOG.title}
        images={[]}
        datePublished="2020-01-01T08:00:00+08:00"
        dateModified={process.env.UPDATED_DATE}
        authorName="marsk"
        description="记录自己的前端工作总结，学习积累，技术思考，疑难问题"
      />
      <PostList posts={posts} />
      {totalPage > 1 && (
        <nav className="flex justify-center my-8">
          <Pagination pageNum={pageNum} totalPage={totalPage} />
        </nav>
      )}
    </>
  )
}

export default Home

export const getStaticProps = async () => {
  const allPosts = await getAllPosts()
  const totalPage = Math.max(1, Math.ceil(allPosts.length / pageSize))
  const posts = groupPostsByYear(allPosts.slice(0, pageSize))
  return {
    props: { posts, pageNum: 1, totalPage },
  }
}
