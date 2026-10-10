/* ==========================================================================
   data/cases.js — 案例画廊注册表
   新增一个案例 = 复制 cases/ai-kefu 为新目录 + 在这里加一条记录。
   status: "live"（已上线，可点击进入）/ "soon"（规划中，展示但不可进入）
   ========================================================================== */

(function (H) {
  "use strict";

  H.cases = [
    {
      num: "01",
      slug: "ai-kefu",
      title: "AI 客服",
      subtitle: "零食电商的客服分流与降本增效",
      desc: "从老板一句模糊的指令，到可运行的 Coze Demo：需求解读、拆解、固化、调研、竞品定位、产品设计、工作流落地，九个模块走完一个 AI 产品的完整生命周期。",
      url: "cases/ai-kefu/",
      status: "live",
      statusLabel: "已上线",
      tags: ["零售电商", "AI 客服", "RAG", "Coze"],
      stats: { modules: 9, terms: 28, demo: "Coze" }
    },
    {
      num: "02",
      slug: "virtual-human",
      title: "虚拟人",
      subtitle: "数字人形象与多模态互动",
      desc: "规划中：虚拟主播、数字员工、形象定制与语音 / 形象多模态互动——沿用同一套方法论，从需求拆解到可演示的落地 Demo。",
      url: null,
      status: "soon",
      statusLabel: "规划中",
      tags: ["数字人", "多模态", "直播", "语音交互"],
      stats: null
    }
  ];
})(window.Handbook = window.Handbook || {});
