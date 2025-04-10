# 仿Twitch直播平台

这是一个包含前端 (Next.js) 和后端 (Koa.js) 的仿 Twitch 直播平台项目。

## 开发环境设置

### 依赖安装

分别进入 `front` 和 `backend` 目录，运行 `pnpm install` 来安装各自的依赖。

### 运行前端

```bash
cd front
pnpm dev
```
前端服务将在 `http://localhost:3000` 启动。

### 运行后端

```bash
cd backend
# 确保已创建 .env 文件并配置数据库连接 (MONGO_URI)
pnpm dev
```
后端服务将在 `http://localhost:5000` (默认) 启动。

### 运行媒体服务器 (SRS)

本项目使用 SRS (Simple Realtime Server) 处理直播推流和拉流。推荐使用 Docker 运行。

1.  **确保已安装 Docker 和 Docker Compose。**
2.  **确保项目根目录下存在 `docker-compose.yml` 和 `srs.conf` 文件。**
3.  **启动 SRS 服务：**

    ```bash
    docker-compose up -d srs
    ```
    这将会在后台启动 SRS 容器。

4.  **查看 SRS 日志 (可选)：**

    ```bash
    docker-compose logs -f srs
    ```

5.  **停止 SRS 服务：**

    ```bash
    docker-compose down
    ```

**SRS 端口映射:**

*   `1935`: RTMP (推流/拉流)
*   `8080`: HTTP-FLV / HLS (Web 播放)
*   `1985`: SRS HTTP API (管理和监控)

**推流地址示例:**

`rtmp://localhost:1935/live`

**HTTP-FLV 播放地址示例:**

`http://localhost:8080/live/{streamKey}.flv`

**HLS 播放地址示例:**

`http://localhost:8080/live/{streamKey}.m3u8`

(`{streamKey}` 需要替换为用户的实际推流密钥)

## 其他

(可以添加更多项目说明...) 
