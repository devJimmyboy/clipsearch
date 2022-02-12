import { HelixClip } from "@twurple/api"
import { HelixClipData } from "@twurple/api/lib/api/helix/clip/HelixClip";
import { rawDataSymbol } from "@twurple/common";
import type { NextApiRequest, NextApiResponse } from 'next'
import { client } from "../../../lib/twitch"

export type Data = { cursor?: string; data: HelixClipData[] | string }

const ClipsHandler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { name, sortBy, cursor: qCursor } = req.query as { name: string, sortBy: "views" | "date"; cursor?: string; }
  const user = await client.users.getUserByName(name)

  if (!user) {
    console.error("User Not Found", name);

    return res.status(404).send({ data: "Not Found" })
  }
  console.log("Got User", user?.displayName, user?.id);
  const data = await client.clips.getClipsForBroadcaster(user.id, { after: qCursor, limit: 30 });
  if (data.data.length === 0) {
    res.status(200).json({ data: [] })
  }
  else {
    const dataJson = { cursor: data.cursor, data: data.data.map(clip => clip[rawDataSymbol]) }
    res.status(200).json(dataJson)
  }
}
export default ClipsHandler