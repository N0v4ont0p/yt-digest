FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip ca-certificates \
 && pip3 install --break-system-packages --no-cache-dir -U yt-dlp \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Skip yt-dlp-exec's own download/python check; the MCP uses ./bin/yt-dlp from the working dir
ENV YOUTUBE_DL_SKIP_DOWNLOAD=true
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
RUN npm init -y >/dev/null \
 && npm install --ignore-scripts @mrsknetwork/ytmcp@1.0.14 \
 && mkdir -p bin && ln -s "$(command -v yt-dlp)" bin/yt-dlp
COPY server.js /app/server.js
CMD ["node", "/app/server.js"]
