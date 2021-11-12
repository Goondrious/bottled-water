import Link from "next/link"
import Head from "next/head"
import Layout from "../../components/layout"
import Button from "@material-tailwind/react/Button"
import Icon from "@material-tailwind/react/Icon"

export default function FirstPost() {
  return (
    <Layout>
      <Head>
        <title>First Post</title>
      </Head>
      <h1>First Post</h1>
      <Button
        color="lightBlue"
        buttonType="filled"
        size="regular"
        rounded={true}
        block={false}
        iconOnly={true}
        ripple="light"
      >
        <Icon name="favorite" size="sm" />
      </Button>
      <h2>
        <Link href="/">
          <a className="text-left hover:text-blue-600 focus:text-blue-600">Back to home</a>
        </Link>
      </h2>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:h-full md:w-48"
              src="https://images.unsplash.com/photo-1515711660811-48832a4c6f69?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=448&q=80"
              alt="Man looking at item at a store"
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Case study</div>
            <a href="#" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
              Finding customers for your new business
            </a>
            <p className="mt-2 text-gray-500">
              Getting a new business off the ground is a lot of hard work. Here are five ideas you can use to find your
              first customers.
            </p>
          </div>
        </div>
      </div>
      <form className="flex w-full max-w-sm mx-auto space-x-3">
        <input className="flex-1 appearance-none border border-transparent w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-md rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" />
        <button className="flex-shrink-0 bg-purple-600 text-white text-base font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200">
          Sign up
        </button>
      </form>
      <article className="prose lg:prose-xl">
        <h1>Garlic bread with cheese: What the science tells us</h1>
        <p>
          For years parents have espoused the health benefits of eating garlic bread with cheese to their children, with
          the food earning such an iconic status in our culture that kids will often dress up as warm, cheesy loaf for
          Halloween.
        </p>
        <p>
          But a recent study shows that the celebrated appetizer may be linked to a series of rabies cases springing up
          around the country.
        </p>
      </article>
    </Layout>
  )
}
