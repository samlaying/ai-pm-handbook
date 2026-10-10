# AI 产品实战画廊

一个零框架、零构建的纯静态站点：**画廊首页 + 一个个独立的案例站点**。每个案例是一个完整走通的 AI 产品项目（需求 → 拆解 → 落地 Demo），共享同一套「编辑杂志风」设计系统。

## 线上地址

**https://samlaying.github.io/ai-pm-handbook/** （画廊首页，国内可直连）

- 首页（画廊 + 双入口）：`/`
- 名词词典（站级独立页）：`/glossary.html`
- 案例 01 · AI 客服：`/cases/ai-kefu/`（九模块手册，正文划线词开详解抽屉）

更新内容后重新发布：改完文件 → `git add -A && git commit -m "..." && git push`，Pages 会自动重新构建（约 1 分钟）。

## 目录结构

```
ai-pm-handbook/                 # 仓库根 = 画廊首页
├── index.html                  # 首页：Hero + 双入口（案例/词典）+ 案例画廊
├── glossary.html               # 名词词典（站级独立页：搜索 / 分类 / 三段式抽屉）
├── css/
│   ├── tokens.css              #   设计令牌（与各案例保持一致）
│   ├── gallery.css             #   首页样式（含 site-nav / 双入口卡）
│   └── dictionary.css          #   词典页样式（含详解抽屉）
├── js/
│   ├── lib/dom.js              #   DOM 工具
│   ├── data/cases.js           # ★ 案例注册表：画廊上有什么全在这
│   ├── data/terms.js           # ★ 站级术语数据（词典与各案例共用的唯一数据源）
│   ├── ui/gallery.js           #   首页渲染（统计 / 双入口计数 / 案例卡片）
│   ├── ui/dictionary.js        #   词典页渲染（搜索 + 分类 + 分组列表）
│   ├── ui/drawer.js            #   词典页详解抽屉（模块链接跳回案例）
│   ├── ui/fmt.js               #   行内格式化（**加粗** / [[术语]]）
│   └── main.js                 #   站级启动器（按页面挂载点分发）
└── cases/                      # ★ 每个案例一个自包含目录
    ├── ai-kefu/                #   案例 01：AI 客服（九模块手册）
    │   ├── index.html          #     双 Tab：案例 / 名词查询
    │   ├── css/                #     样式按层拆分（tokens 是唯一变量出处）
    │   └── js/                 #     data / ui / lib / main 完整自治
    └── <下一个案例>/            #   虚拟人等，规划中
```

## 如何新增一个案例（三步）

1. **复制骨架**：`cp -r cases/ai-kefu cases/<新案例slug>`，清空 `js/data/module-*.js` 的内容按新项目重写；
2. **注册**：在 `js/data/cases.js` 加一条记录：

   ```js
   {
     num: "03",
     slug: "xin-slug",
     title: "案例名",
     subtitle: "一句话副标题",
     desc: "画廊卡片上的介绍（两三行）",
     url: "cases/xin-slug/",       // 上线后填，规划中填 null
     status: "live",               // live | soon
     statusLabel: "已上线",
     tags: ["行业", "场景", "技术"],
     stats: { modules: 9, terms: 28, demo: "Coze" }
   }
   ```

3. **发布**：`git add -A && git commit -m "新增案例：xxx" && git push`。

画廊首页的 Hero 统计（已上线数 / 规划中 / 术语沉淀）由注册表自动汇总，无需手改。

## 页面层级与交叉导航

```
首页 /                    —— ◆ AI 产品实战手册 + [案例 | 词典]
├─ 词典 /glossary.html    —— 独立名词词典（搜索 / 分类 / 三段式抽屉）
└─ 案例 /cases/<slug>/    —— 案例手册（顶栏：logo 回首页 + 词典入口 + 模块导航）
```

- 术语数据是**站级唯一数据源**（`js/data/terms.js`），词典页与各案例共用；
- 词典抽屉的「出现在案例」链接带案例路径，可跨页跳进案例对应模块；
- 案例正文划线词照常打开三段式抽屉（模块回跳为页内锚点）。

## 案例内部结构（以 ai-kefu 为例）

- 九模块长文，含每模块「要解决的问题」卡与小节点题句
- 检查清单勾选持久化（localStorage）；进度条 + scroll-spy；移动端抽屉菜单
- 打印友好；`prefers-reduced-motion` 全降级；零框架零构建

案例数据格式（`cases/ai-kefu/js/data/`；术语在站级 `js/data/terms.js`）：

```js
// 模块：blocks 支持 p / table / list / quote / warning / code 六种
{ no: "1.1", heading: "小节标题", goal: "本节解决什么",
  blocks: [{ type: "p", text: "支持 **加粗** 与 [[术语]]" }] }

// 术语：六字段
{ cat: "方法论", def: "定义", case: "项目案例",
  tech: ["技术解析和应用"], modules: ["m05"], related: ["MVP"] }
```

## 本地预览

```bash
cd ai-pm-handbook
python3 -m http.server 8080
# 画廊 http://127.0.0.1:8080/   案例 http://127.0.0.1:8080/cases/ai-kefu/
```

> 提示：改完内容如浏览器显示旧版本，按一次 **Cmd+Shift+R** 强制刷新；
> 案例站资源引用带 `?v=` 版本参数，改完关键文件可顺手 +1。

## 部署到其他平台

整站是纯静态目录，任何托管拖上去即可（也可直接上传 `../ai-pm-handbook-site.zip`）：

- **腾讯云 EdgeOne Pages**（国内最快）：微信登录 → 新建项目 → 拖入 / 传 zip，默认域名免备案；
- **Gitee Pages**：需实名认证后手动开启；
- **Vercel / Netlify**：国内访问不稳定，不推荐面向国内用户。

字体已异步加载：连不上 Google Fonts 时自动回退系统字体，不阻塞渲染。
