import { ListItem, ListItemButton, Stack, Typography } from "@mui/material"
import Image from "next/image"
import React, { memo } from "react"
import { areEqual, ListChildComponentProps } from "react-window"
import { Data as ClipApiData } from "../pages/api/clips"

const ClipView = (
  props: ListChildComponentProps<{ clips: ClipApiData["data"]; selected: number; onSelect: (index: number) => void }>
) => {
  const {
    index,
    data: { clips, selected, onSelect },
    style,
  } = props
  if (!clips) {
    return (
      <ListItemButton style={style} key={index} className="flex flex-row gap-2 items-center p-2">
        No Data
      </ListItemButton>
    )
  }
  const clip = clips[index]
  const isSelected = index === selected
  if (typeof clip === "string") return <ListItem>{clip}</ListItem>
  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => onSelect(index)}
      style={style}
      key={index}
      className="flex flex-row gap-2 pl-1  items-center rounded-md">
      <Image
        src={clip.thumbnail_url}
        alt={clip.title}
        height="95%"
        width="170%"
        className=" aspect-video rounded-md shadow-md"
      />
      <Stack direction="column" className="items-start content-start">
        <Typography fontWeight={700}>{clip.title}</Typography>
        <Typography>{clip.broadcaster_name}</Typography>
      </Stack>
      <div className="flex-grow" />
      <div className="justify-self-end">{clip.view_count}</div>
    </ListItemButton>
  )
}
export default memo(ClipView, areEqual)
