# Going live on every platform at once (free)

One camera, one click: your service goes out on YouTube, Facebook, Instagram, TikTok
and any other app, and the website's **Watch Live** page shows it.

Everything below is free. No subscriptions.

## 1. Let the website follow your YouTube channel automatically

Admin → **Website content** → **Social media links** → *YouTube channel URL*,
for example `https://www.youtube.com/@itrainsministries`.

Whenever that channel is live, the Watch Live page, the homepage banner and the
"LIVE NOW" badge in the menu switch on by themselves within about a minute. Nobody
needs to create a broadcast in the admin. (The site checks the channel's public
`/live` page once a minute, so no YouTube API key is needed.)

## 2. Stream to all platforms from one computer

1. Install **OBS Studio** (free, obsproject.com).
2. Install the free **Multiple RTMP outputs** plugin for OBS
   (search "obs-multi-rtmp" on GitHub, by sorayuki). It adds a *Multiple output* panel.
3. Get a server URL and stream key from each platform:

| Platform | Where to find the stream key | Notes |
|---|---|---|
| YouTube | YouTube Studio → Create → Go live → Stream | Turn on "Enable DVR". YouTube keeps the replay. |
| Facebook | facebook.com/live/producer → Streaming software | Set the video to **Public** so it can play on the website. |
| Instagram | Instagram Live Producer on desktop (instagram.com → Create → Live) | Needs a professional (business or creator) account. The key changes every time. |
| TikTok | TikTok LIVE Center / LIVE Studio → stream key | TikTok only gives keys to accounts with LIVE access. TikTok is vertical, so add a 1080×1920 canvas or a vertical OBS scene. |
| Others (Twitch, X, Kick…) | Each app's creator / streaming settings | Add as many outputs as your internet upload can carry. |

4. In OBS, set YouTube as the main stream (Settings → Stream), and add the others in
   the *Multiple output* panel. Click **Start Streaming**, then **Start all**.

**Internet speed:** every platform needs its own upload, about 6 Mbps each at 720p.
If your upload is limited, stream to YouTube and Facebook only, then add the rest.

## 3. Put the links on the website

Admin → **Live broadcasts** → *New broadcast* (or open an existing one) and paste the
live link from each platform:

- **YouTube** and **Facebook** play inside the Watch Live page. If you add both, viewers
  get buttons to switch between them.
- **Instagram**, **TikTok** and others show as "Watch on…" buttons. These apps don't allow
  their live videos to play inside other websites, so the buttons open the app.

Creating a broadcast here also turns on the website's own live chat, viewer count and
"We're live" push notifications. Click **Mark as live** when you start and
**End broadcast** when you finish.

## Free alternative to OBS plugins

**Restream.io** has a free plan that sends one stream to 2 platforms at a time, with a
small Restream logo. It works from a browser, so it is handy on a laptop without OBS.
Their paid plans are not needed for this site.
