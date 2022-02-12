import { ClientCredentialsAuthProvider } from "@twurple/auth"
import { ApiClient, HelixClip, HelixPaginatedResult, HelixUser } from "@twurple/api"
import $ from "jquery"
import moment from "moment"


var displayName = ""

const $twitchClip = $("#twitch-clip") as JQuery<HTMLVideoElement>
const $displayNameForm = $<HTMLInputElement>("#name").on("keydown", (e) => {
  if (e.key !== "Enter") return;
  displayName = e.target.value
  updateClip()
})
var today = new Date();

var user: HelixUser | null, clip: HelixClip, clips: HelixClip[];
async function updateClip() {
  if (!displayName) {
    return
  }

  user = await client.users.getUserByName(displayName);
  if (!user) return;
  clips = (await client.clips.getClipsForBroadcaster(user.id, { startDate: moment().subtract(7, 'd').toISOString() })).data;
  clips.sort((a, b) => b.views - a.views)

  $(".clipList").empty().append(...clips.map(c => $(`<div class='flex flex-row cursor-pointer p-2 gap-2 w-full'>
    <img class="max-w-sm" src="${c.thumbnailUrl}"/>
    <p>Views: ${c.views}</p>
  </div>`).on("click", () => playClip(c))))

}
async function playClip(clip: HelixClip) {
  console.log("embedurl: ", clip.embedUrl, "thumb url: ", clip.thumbnailUrl);

  $twitchClip.attr("src", getClipURL(clip.id, clip.thumbnailUrl))
  let video = $twitchClip.get(0) as HTMLVideoElement
  video.load()
  video.addEventListener('canplaythrough', () => video.play())
  video.addEventListener('ended', () => $twitchClip.attr("src", ""))

}
function getClipURL(slug: string, thumbURL: string) {
  let iSlug = thumbURL.indexOf(slug)
  if (iSlug === -1) {
    return thumbURL.replace(/-preview.*/g, ".mp4")
  }
  else {
    let url = thumbURL.substring(0, iSlug + slug.length) + ".mp4"
    console.log(url);

    return url
  }
}