type VideoEvent = {
  type: "video_event";
  videoId: string;
  action: "play" | "pause" | "stop";
  timestamp: string;
};
