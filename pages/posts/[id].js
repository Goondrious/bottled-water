import Link from "next/link"
import Head from "next/head"

import Layout from "../../components/layout"
import Date from "../../components/date"
import { getAllPostIds, getPostData } from "../../lib/posts"

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  if (params.id === "shane") {
    return { props: { postData: { id: "shane" } } }
  }
  const postData = await getPostData(params.id)
  return {
    props: {
      postData,
    },
  }
}

export default function Post({ postData }) {
  if (postData.id === "shane") {
    return "Shane!"
  }
  return (
    <Layout className="prose">
      <Head>
        <title>{postData.title}</title>
      </Head>
      <h1>{postData.title}</h1>
      <br />
      <Date dateString={postData.date} />
      <br />
      <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      <h2>
        <Link href="/">
          <a className="text-left hover:text-blue-600 focus:text-blue-600">Back to home</a>
        </Link>
      </h2>
    </Layout>
  )
}
