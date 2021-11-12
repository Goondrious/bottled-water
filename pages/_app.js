import "tailwindcss/tailwind.css"
import "@material-tailwind/react/tailwind.css"
import "../styles/globals.css"

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
