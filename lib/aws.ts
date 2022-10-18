import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })

// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  },
})

const HOME_PAGE_FILES = process.env.HOME_PAGE_FILES.split(",")

export const getStaticHomePageContent = async () => {
  const mdContent = await Promise.all(
    HOME_PAGE_FILES.map(
      (Key) =>
        new Promise(async (resolve, reject) => {
          const bucketParams = {
            Bucket: process.env.AWS_BUCKET_NAME, // The name of the bucket. For example, 'sample_bucket_101'.
            Key, // The name of the object. For example, 'sample_upload.txt'.
          }

          try {
            // Create a helper function to convert a ReadableStream to a string.

            // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
            const data = await s3Client.send(new GetObjectCommand(bucketParams))

            // Convert the ReadableStream to a string.
            const bodyContents: any = await streamToString(data.Body)
            const matterResult = matter(bodyContents)

            const processedContent = await remark().use(html).process(matterResult.content)
            const contentHtml = processedContent.toString()
            resolve(contentHtml)
          } catch (err) {
            console.log("Error", err)
            reject()
          }
        })
    )
  )

  return { mdContent }
}
