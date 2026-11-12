import { GetStaticPaths, GetStaticProps } from 'next'
import { getAllPosts, pageSize } from '@/api/local'
import PostList, { groupPostsByYear, GroupedPosts } from '@/components/PostList'
import Pagination from '@/components/ui/Pagination'

type PageProps = {
  posts: GroupedPosts
  pageNum: number
  totalPage: number
}

const PostsByPage: React.FC<PageProps> = ({ posts, pageNum, totalPage }) => {
  return (
    <>
      <PostList posts={posts} />
      {totalPage > 1 && (
        <nav className="flex justify-center my-8">
          <Pagination pageNum={pageNum} totalPage={totalPage} />
        </nav>
      )}
    </>
  )
}

export default PostsByPage

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPosts()
  const totalPage = Math.max(1, Math.ceil(allPosts.length / pageSize))
  const paths = Array.from({ length: totalPage }, (_, i) => ({
    params: { page: String(i + 1) },
  }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageNum = Math.max(1, parseInt((params?.page as string) || '1', 10) || 1)
  const allPosts = await getAllPosts()
  const totalPage = Math.max(1, Math.ceil(allPosts.length / pageSize))
  const start = (pageNum - 1) * pageSize
  const posts = groupPostsByYear(allPosts.slice(start, start + pageSize))
  return {
    props: { posts, pageNum, totalPage },
  }
}
