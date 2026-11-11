import {
  ApolloClient,
  InMemoryCache,
  gql,
  OperationVariables,
} from '@apollo/client'

// TODO: 区分 blog 和 lab

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql',
  cache: new InMemoryCache(),
  // Enable sending cookies over cross-origin requests
  credentials: 'include',
})

export const pageSize = 2

export async function getPostBySlug(slug: string) {
  const {
    data: { post },
  } = await client.query({
    query: gql`
      query Query($where: PostWhereUniqueInput!) {
        post(where: $where) {
          slug
          title
          tags {
            name
          }
          category {
            name
          }
          ctime
          mtime
          date
          content
          prevArticle {
            title
            slug
          }
          nextArticle {
            title
            slug
          }
          readingTime
          brief
        }
      }
    `,
    variables: { where: { slug } },
  })
  return post
}

export async function getRelatedTag(tags: string[]) {
  const {
    data: { tags: relatedTags },
  } = await client.query({
    query: gql`
      query Query($where: TagWhereInput!) {
        tags(where: $where) {
          name
          posts {
            slug
          }
        }
      }
    `,
    variables: { where: { name: { in: tags } } },
  })
  return relatedTags
}
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}
export async function getAllPosts(options?: { range: string }) {
  const filter: OperationVariables = {}

  if (options) {
    if (options.range === 'latest') {
      filter.take = 20
    } else {
      const gte = new Date(`${options.range}-01-01 00:00:00`).getTime()
      const lte = new Date(`${options.range}-12-31 23:59:59`).getTime()
      filter.where = { ctime: { gte, lte } }
    }
  }

  const {
    data: { posts },
  } = await client.query({
    query: gql`
      query Query(
        $where: PostWhereInput! = {}
        $orderBy: [PostOrderByInput!]! = []
        $take: Int
      ) {
        posts(where: $where, orderBy: $orderBy, take: $take) {
          slug
          title
          tags {
            name
          }
          ctime
          date
          brief
          readingTime
        }
      }
    `,
    variables: { orderBy: [{ ctime: 'desc' }], ...filter },
  })
  return posts
}
// FIXME: 无法使用外层变量，https://github.com/vercel/next.js/issues/10933
export const common = {}

export async function getAllTags() {
  const {
    data: { tags },
  } = await client.query({
    query: gql`
      query {
        tags {
          name
          posts {
            title
            slug
          }
        }
      }
    `,
  })
  return tags
}

export async function getTags() {
  const {
    data: { tags },
  } = await client.query({
    query: gql`
      query {
        tags {
          name
          postsCount
        }
      }
    `,
  })
  return Array.from(tags).sort((a, b) => b.postCount - a.postCount)
}

export async function getCategories() {
  const {
    data: { categories },
  } = await client.query({
    query: gql`
      query {
        categories {
          name
          posts {
            title
            slug
          }
          postsCount
        }
      }
    `,
  })
  return categories.map(({ name, posts }) => ({
    name,
    posts,
    count: posts.length,
  }))
}

export async function getYears() {
  const {
    data: { posts: ctimeArray },
  } = await client.query({
    query: gql`
      query {
        posts {
          ctime
        }
      }
    `,
  })
  let years: number[] = []
  ctimeArray.map(({ ctime }) => {
    years.push(new Date(+ctime).getFullYear())
  })
  years = [...new Set(years)]
  years.sort((a, b) => a - b)
  return years
}
