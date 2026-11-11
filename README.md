# 圣农品牌应用中心

圣农品牌标识、VI 规范与圣小农 IP 形象展示网站。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run dev
```

## 构建

```sh
npm run build
```

生成的 `dist` 目录可直接托管。图片、MiSans 字体及三维模型均为本地资源。页面采用 Hash 路由，可兼容 GitHub Pages 子目录部署。

## GitHub Pages

仓库设置的 Pages 中选择 GitHub Actions。提交到 main 后自动构建和部署。

品牌素材的权利归其原权利人所有。
