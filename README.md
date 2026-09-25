# Personal academic homepage

这是静态网站，可以直接打开 `index.html`，无需安装依赖或运行服务器。

## 更新论文

统一在 `data/publications.json` 中维护论文：

- `papers`：论文记录。`id` 是稳定锚点，请勿随意更改。
- `title`、`authorsHtml`、`venue`、`details`：标题、作者、会议／期刊及详细出版信息。只有 `authorsHtml` 接受 HTML，用 `<strong>` 高亮本人，用 `<sup>` 标记作者贡献。
- `acceptanceYear`：录用年份；预印本填 `null`。
- `publicationYear`：已确认的正式出版年份；未知时填 `null`，分组暂用录用年份。
- `href`：实际存在的本地 PDF 路径或论文链接；暂无全文时填 `null`。
- `award`：奖项名称，没有则填 `null`。
- `topics`：可多选 `supply-chain`、`analysis`、`malware`、`ai`、`software`。初始分类根据论文标题整理，新增论文时请人工确认。
- `selected`：按展示顺序填写代表作 ID，同步生成中英文首页。

修改后运行（使用已安装的 Node.js，无第三方依赖）：

```sh
node scripts/build-pages.cjs
node scripts/build-pages.cjs --check
node scripts/check-site.cjs
```

生成器更新 HTML 中 `BEGIN / END` 注释之间的论文内容。请一并提交 JSON 数据和生成后的 HTML；勿直接编辑生成区域。简介、动态、招生与合作等内容仍在对应 HTML 中维护。

## 检查与预览

`check-site.cjs` 检查本地文件引用、跨页锚点、HTML 标签配对、论文数量，以及搜索、主题筛选与年份分组逻辑。外部链接和实际招生名额需单独确认。

浏览器中检查桌面及窄屏布局，输入 `ForeDroid` 测试搜索，切换主题与年份，再点击清除筛选。禁用 JavaScript 时仍能阅读完整论文列表。

`sitemap.xml` 列出当前三个页面；新增页面时同步维护。研究框架图保持缩略展示，点击后打开原图。
