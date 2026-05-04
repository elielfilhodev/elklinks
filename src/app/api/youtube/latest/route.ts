import { profileConfig } from "@/lib/profile-config";

export const revalidate = 1800;

type YouTubeVideo = {
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
};

type YouTubeChannelResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type YouTubePlaylistResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      publishedAt?: string;
      videoOwnerChannelTitle?: string;
      resourceId?: {
        videoId?: string;
      };
      thumbnails?: Record<string, { url?: string }>;
    };
    contentDetails?: {
      videoId?: string;
    };
  }>;
};

type ThumbnailMap = Record<string, { url?: string }>;

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
};

function selectThumbnail(thumbnails?: ThumbnailMap) {
  if (!thumbnails) return "";
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    ""
  );
}

function readXmlTag(xml: string, tag: string) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`));
  return match?.[1]?.trim() ?? "";
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

async function fetchJson<T>(url: URL) {
  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    throw new Error(`YouTube respondeu ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchLatestWithDataApi(apiKey: string) {
  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "snippet,contentDetails");
  channelUrl.searchParams.set("forHandle", profileConfig.youtube.handle);
  channelUrl.searchParams.set("key", apiKey);
  channelUrl.searchParams.set(
    "fields",
    "items(snippet(title),contentDetails(relatedPlaylists(uploads)))",
  );

  const channelData = await fetchJson<YouTubeChannelResponse>(channelUrl);
  const channel = channelData.items?.[0];
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("Canal do YouTube não encontrado");
  }

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet,contentDetails");
  playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
  playlistUrl.searchParams.set("maxResults", "1");
  playlistUrl.searchParams.set("key", apiKey);
  playlistUrl.searchParams.set(
    "fields",
    "items(snippet(title,publishedAt,videoOwnerChannelTitle,resourceId(videoId),thumbnails),contentDetails(videoId))",
  );

  const playlistData = await fetchJson<YouTubePlaylistResponse>(playlistUrl);
  const item = playlistData.items?.[0];
  const videoId = item?.snippet?.resourceId?.videoId ?? item?.contentDetails?.videoId;

  if (!item?.snippet || !videoId) {
    throw new Error("Último vídeo não encontrado");
  }

  return {
    title: item.snippet.title ?? "Último vídeo",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: selectThumbnail(item.snippet.thumbnails) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt: item.snippet.publishedAt ?? "",
    channelTitle: item.snippet.videoOwnerChannelTitle ?? channel?.snippet?.title ?? "YouTube",
  } satisfies YouTubeVideo;
}

async function fetchLatestWithRss(channelId: string) {
  const feedUrl = new URL("https://www.youtube.com/feeds/videos.xml");
  feedUrl.searchParams.set("channel_id", channelId);

  const response = await fetch(feedUrl, { next: { revalidate } });

  if (!response.ok) {
    throw new Error(`Feed do YouTube respondeu ${response.status}`);
  }

  const xml = await response.text();
  const entry = xml.match(/<entry>[\s\S]*?<\/entry>/)?.[0];

  if (!entry) {
    throw new Error("Nenhum vídeo encontrado no feed");
  }

  const videoId = readXmlTag(entry, "yt:videoId");
  const title = decodeXml(readXmlTag(entry, "title"));
  const publishedAt = readXmlTag(entry, "published");
  const channelTitle = decodeXml(readXmlTag(entry, "name"));
  const link = entry.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? `https://www.youtube.com/watch?v=${videoId}`;

  if (!videoId) {
    throw new Error("ID do vídeo não encontrado no feed");
  }

  return {
    title: title || "Último vídeo",
    url: link,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt,
    channelTitle: channelTitle || "YouTube",
  } satisfies YouTubeVideo;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || profileConfig.youtube.channelId;

  try {
    const video = apiKey
      ? await fetchLatestWithDataApi(apiKey)
      : channelId
        ? await fetchLatestWithRss(channelId)
        : null;

    if (!video) {
      return Response.json(
        {
          error:
            "Configure YOUTUBE_API_KEY para usar a API oficial, ou YOUTUBE_CHANNEL_ID para usar o feed público.",
          channelUrl: profileConfig.youtube.channelUrl,
        },
        { status: 503, headers: cacheHeaders },
      );
    }

    return Response.json({ video }, { headers: cacheHeaders });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Falha ao buscar último vídeo",
        channelUrl: profileConfig.youtube.channelUrl,
      },
      { status: 502, headers: cacheHeaders },
    );
  }
}
