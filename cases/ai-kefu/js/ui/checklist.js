/* ==========================================================================
   ui/checklist.js — 检查清单：勾选状态持久化（localStorage）+ 一键重置
   ========================================================================== */

(function (H) {
  "use strict";

  H.ui = H.ui || {};

  H.ui.checklist = {
    KEY: "checks",

    init: function init() {
      this.restore();
      this.bindChange();
      this.bindReset();
    },

    /* 单条勾选的存储键：模块ID + 序号 */
    keyFor: function keyFor(input) {
      return "check:" + input.dataset.module + ":" + input.dataset.index;
    },

    restore: function restore() {
      var saved = H.store.get(this.KEY, {});
      document.querySelectorAll(".checklist input[type=checkbox]").forEach(function (input) {
        input.checked = !!saved[H.ui.checklist.keyFor(input)];
      });
    },

    bindChange: function bindChange() {
      var self = this;
      document.addEventListener("change", function (event) {
        var input = event.target;
        if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") return;
        if (!input.dataset.module) return;

        var saved = H.store.get(self.KEY, {});
        saved[self.keyFor(input)] = input.checked;
        H.store.set(self.KEY, saved);
      });
    },

    bindReset: function bindReset() {
      var self = this;
      var button = document.querySelector(".reset-checks");
      if (!button) return;

      button.addEventListener("click", function () {
        H.store.set(self.KEY, {});
        document.querySelectorAll(".checklist input[type=checkbox]").forEach(function (input) {
          input.checked = false;
        });
        button.textContent = "已重置";
        window.setTimeout(function () {
          button.textContent = "重置全部勾选";
        }, 1500);
      });
    }
  };
})(window.Handbook = window.Handbook || {});
