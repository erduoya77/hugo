FROM klakegg/hugo:latest

WORKDIR /src

# 复制除了 content 目录外的所有文件
COPY archetypes ./archetypes
COPY assets ./assets
COPY layouts ./layouts
COPY static ./static
COPY config.toml .
COPY themes ./themes

# 创建 content 目录的挂载点
VOLUME /src/content

# 暴露 Hugo 服务端口
EXPOSE 1313

# 启动 Hugo 服务，开启实时重载
CMD ["server", "--bind", "0.0.0.0", "--port", "1313", "--watch", "--buildDrafts", "--buildFuture"] 