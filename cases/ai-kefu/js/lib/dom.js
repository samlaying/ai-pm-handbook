/* ==========================================================================
   lib/dom.js — 极简 DOM 工具集（零依赖）
   ========================================================================== */

(function (H) {
  "use strict";

  /**
   * 创建元素：el("div", { class: "foo", text: "hi" }, [children])
   * props.text 设纯文本；props.html 设（已由调用方保证安全的）innerHTML；
   * props.dataset 合并 data-* 属性；props.attrs 合并任意属性（如 colspan）。
   */
  function el(tag, props, children) {
    var node = document.createElement(tag);
    props = props || {};
    children = children || [];

    if (props.text != null) node.textContent = props.text;
    if (props.html != null) node.innerHTML = props.html;
    if (props.class) node.className = props.class;
    if (props.id) node.id = props.id;
    if (props.href) node.setAttribute("href", props.href);

    var data = props.dataset || {};
    Object.keys(data).forEach(function (key) {
      node.setAttribute("data-" + key, data[key]);
    });

    var attrs = props.attrs || {};
    Object.keys(attrs).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });

    /* children 支持嵌套数组，统一拍平后挂载 */
    flatten(children).forEach(function (child) {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });

    return node;
  }

  function flatten(list) {
    return list.reduce(function (acc, item) {
      return acc.concat(Array.isArray(item) ? flatten(item) : [item]);
    }, []);
  }

  /** HTML 转义：所有来自数据文件的文本先过这里再注入 */
  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  H.dom = {
    el: el,
    escapeHTML: escapeHTML
  };
})(window.Handbook = window.Handbook || {});
