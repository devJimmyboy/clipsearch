import "../styles/globals.css"
import type { AppProps } from "next/app"
import CssBaseline from "@mui/material/CssBaseline"
import Head from "next/head"
import { CacheProvider, EmotionCache } from "@emotion/react"
import { ThemeProvider } from "@mui/material"
import theme from "../src/theme"
import createEmotionCache from "../src/createEmotionCache"

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}
function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}

export default MyApp
