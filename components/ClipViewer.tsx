import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Divider, IconButton, Slider, Stack } from "@mui/material"
import { red } from "@mui/material/colors"
import { motion } from "framer-motion"
import { debounce, throttle } from "lodash"
import React, { SetStateAction, useCallback, useEffect } from "react"
import ReactPlayer from "react-player/lazy"
import { useBoolean, useLocalStorage, useSessionStorage, useThrottle, useThrottleFn } from "react-use"
import { Data } from "../pages/api/clips"

type Props = {
  clip: Data["data"][0] | null
  onEnded?: () => void
  setClip: (clip: (currentI: number) => number) => void
}

export default function ClipViewer({ clip, setClip, onEnded }: Props) {
  const [hovering, setHovering] = useBoolean(false)
  const [playing, togglePlaying] = useBoolean(true)
  const [progress, setProgress] = React.useState(0)
  const [volume, setVolume] = useSessionStorage<number>("volume", 1)
  const [fullscreen, toggleFullscreen] = useBoolean(false)

  useEffect(() => {
    if (wrapperRef.current) {
      if (fullscreen && document.fullscreenEnabled) wrapperRef.current?.requestFullscreen()
      else if (document.fullscreenElement) document.exitFullscreen().catch(console.error)
    }
  }, [fullscreen])
  useEffect(() => {
    togglePlaying(true)
  }, [clip])

  const onHover = useCallback(
    debounce(() => setHovering(false), 4000),
    [hovering]
  )
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const ref = React.useRef<ReactPlayer>(null)
  if (!clip || typeof clip === "string") return null
  const urls = getUrl(clip)
  return (
    <div ref={wrapperRef} className="player-wrapper">
      <motion.div
        animate={{ opacity: hovering || !playing ? 1 : 0 }}
        className="controls-container group"
        onClick={togglePlaying}
        onMouseMove={() => {
          setHovering(true)
          onHover()
        }}>
        <IconButton sx={{ backgroundColor: "rgba(0,0,0,0.8)" }} className="prev-clip rounded-l-none">
          <Icon icon="mdi:skip-previous" />
        </IconButton>

        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            setClip((c) => c + 1)
          }}
          sx={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          className="next-clip rounded-r-none">
          <Icon icon="mdi:skip-next" />
        </IconButton>
        <Stack
          direction="row"
          className="controls-bottom group-hover:bg-opacity-50 bg-opacity-0 w-full"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          spacing={1}>
          <IconButton className="ml-2 p-0.5 h-full aspect-square" onClick={() => togglePlaying()}>
            <Icon fontSize={32} height="100%" icon={playing ? "mdi:pause" : "mdi:play"} />
          </IconButton>
          <Slider
            aria-label="time-percent"
            size="medium"
            value={progress}
            min={0}
            step={1}
            max={100}
            sx={{
              "& .MuiSlider-thumb": {
                width: "0.5em",
                height: "0.5em",
                transition: "all 150ms ease-in-out",
                "&:hover": {
                  width: "1em",
                  height: "1em",
                },
              },
            }}
            onMouseDown={() => togglePlaying(false)}
            onMouseUp={() => togglePlaying(true)}
            onChange={(e, v) => {
              if (ref.current) ref.current.seekTo((v as number) / 100, "fraction")
              setProgress(v as number)
            }}
          />
          <Divider orientation="vertical" />
          <Icon
            className="h-full mx-0"
            fontSize={32}
            icon={
              volume === 0
                ? "mdi:volume-mute"
                : volume < 0.35
                ? "mdi:volume-low"
                : volume < 0.7
                ? "mdi:volume-medium"
                : "mdi:volume-high"
            }
          />
          <Slider
            aria-label="volume"
            size="small"
            className="w-28"
            value={volume}
            min={0}
            step={0.01}
            max={1}
            onChange={(e, val) => setVolume(val as number)}
          />
          <div className="w-6 h-full mr-4">
            <IconButton onClick={(e) => toggleFullscreen()} className="w-6 h-full p-0 mr-2 rounded-none">
              <Icon height="100%" icon="mdi:fullscreen" />
            </IconButton>
          </div>
        </Stack>
      </motion.div>
      <ReactPlayer
        ref={ref}
        volume={volume}
        className="react-player"
        width="100%"
        height="100%"
        url={urls}
        playing={playing}
        onEnded={onEnded}
        onProgress={(e) => setProgress(e.played * 100)}
      />
    </div>
  )
}

function getUrl(clip: Data["data"][0]) {
  if (!clip || typeof clip === "string") return
  return clip.thumbnail_url?.replace(/-preview.*/g, ".mp4") || ""
}
