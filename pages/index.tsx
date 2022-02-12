import type { NextPage } from "next"
import Head from "next/head"
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite"
import { useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import {
  Box,
  CircularProgress,
  Collapse,
  debounce,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { FixedSizeList as List } from "react-window"
import ClipView from "../components/ClipView"
import type { Data as ClipApiData } from "./api/clips"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

import memoize from "memoize-one"
import ClipViewer from "../components/ClipViewer"
import Image from "next/image"

const createItemData = memoize((clips: ClipApiData["data"], selected: number, onSelect: (index: number) => void) => ({
  clips,
  selected,
  onSelect,
}))

const Home: NextPage = () => {
  const listRef = useRef<List>(null)
  const [twitchUser, setTwitchUser] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [selectedClip, setClip] = useState<number>(-1)
  const getKey: SWRInfiniteKeyLoader = (index, previousPageData: ClipApiData) => {
    // reached the end
    if (twitchUser.length === 0 || (previousPageData && !previousPageData.data)) return null

    // first page, we don't have `previousPageData`
    if (index === 0) return `/api/clips?name=${twitchUser}`

    return `/api/clips?name=${twitchUser}&cursor=${previousPageData.cursor}`
  }
  useEffect(() => {
    listRef.current?.scrollToItem(selectedClip, "smart")
  }, [selectedClip])

  const { data, error, size, setSize } = useSWRInfinite<ClipApiData, { data: string }>(getKey, fetcher)

  const clips = data ? data.map((d) => d.data) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0].data?.length === 0
  const itemData = createItemData(clips[page - 1], selectedClip, setClip)
  return (
    <div className="flex flex-col items-center h-screen w-full">
      <Head>
        <title>EZ Clip</title>
        <meta name="description" content="A simple to use clip service to search through clips quickly." />
      </Head>
      <header className="w-full flex flex-row items-center gap-6 justify-center p-2">
        <Typography fontSize={64} component="h1" className="px-1">
          EZ{" "}
          <Typography
            fontSize={64}
            color="transparent"
            sx={{
              background: "linear-gradient(43deg,#4158D0,#C850C0,#FFCC70)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            display="inline"
            fontWeight={700}>
            Clip
          </Typography>
        </Typography>
      </header>

      <main className="flex-grow flex flex-col items-center gap-10 p-12 w-full">
        <Stack direction="column" alignItems="center" justifyContent="center">
          <TextField
            error={!!error}
            type="other"
            placeholder="mizkif"
            label="Twitch Username"
            onChange={debounce((e) => {
              setClip(-1)

              setTwitchUser(e.target.value)
              setSize(1)
              setPage(1)
            }, 500)}
            variant="outlined"
            color="primary"
            InputProps={{
              startAdornment: (
                <InputAdornment className="select-none cursor-default" position="start">
                  twitch.tv/
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <ClipViewer
          clip={!isLoadingMore && itemData?.clips && selectedClip !== -1 ? itemData.clips[selectedClip] : null}
          setClip={(e) => {
            const clipNext = e(selectedClip)
            if (clipNext === itemData.clips.length) setClip(0)
            else if (clipNext < 0) setClip(itemData.clips.length - 1)
            else setClip(clipNext)
          }}
          onEnded={() => setClip((c) => (c + 1 === clips.length ? 0 : c + 1))}
        />

        <Paper
          className="flex flex-col items-center mt-2 w-2/3 max-h-full "
          sx={{ padding: 2, bgcolor: "background.paper" }}>
          {!isLoadingInitialData ? (
            typeof clips[page] === "string" ? (
              <Typography>{clips[page]}</Typography>
            ) : !isLoadingMore && itemData.clips ? (
              <>
                <List
                  ref={listRef}
                  itemCount={itemData.clips.length}
                  width="100%"
                  height={400}
                  itemSize={100}
                  itemData={itemData}>
                  {ClipView}
                </List>
                <Pagination
                  count={size + 1}
                  page={page}
                  onChange={(e, p) => {
                    if (p > size) setSize(p)
                    listRef.current?.scrollTo(0)
                    setPage(p)
                  }}
                />
              </>
            ) : (
              <Stack direction="row" alignItems="center" justifyContent="center" sx={{ height: 450, width: "100%" }}>
                <CircularProgress /> <Typography>Loading More...</Typography>
              </Stack>
            )
          ) : (
            <>
              {isEmpty ? (
                <p>No clips for this channel.</p>
              ) : (
                <Typography className="text-center" fontWeight={600} fontSize={24}>
                  Enter a{" "}
                  <Typography
                    display="inline"
                    fontWeight={800}
                    fontSize={32}
                    sx={{
                      background: "linear-gradient(43deg, #09EBFA 0%, rgb(145 70 255)  100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      // WebkitTextStroke: "white 1.2px",
                    }}>
                    Twitch Username
                  </Typography>{" "}
                  above and find their best clips{" "}
                  <Image
                    alt="Funny emote"
                    className="inline"
                    width="20em"
                    height="15em"
                    src="https://cdn.7tv.app/emote/60ae9693f6a2c3b332218a5d/4x"
                  />
                </Typography>
              )}
            </>
          )}
        </Paper>
      </main>
      <Box sx={{ position: "fixed", bottom: 0, left: 0, maxWidth: "128px" }}>
        <Image alt="EZ Clap" className="mr-2" src="/favicon.webp" width="100%" height="100%" />
      </Box>
    </div>
  )
}

export default Home
