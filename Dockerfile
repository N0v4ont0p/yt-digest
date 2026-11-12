FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip ca-certificates \
 && pip3 install --break-system-packages --no-cache-dir -U yt-dlp \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# yt-dlp-exec skips its own binary download; the MCP uses ./bin/yt-dlp from the working dir
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true
RUN npm install -g supergateway@4.2.2 @mrsknetwork/ytmcp@1.0.14 \
 && mkdir -p bin && ln -s "$(command -v yt-dlp)" bin/yt-dlp
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
