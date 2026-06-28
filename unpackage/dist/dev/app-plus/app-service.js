if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_SHOW = "onShow";
  const ON_LOAD = "onLoad";
  const ON_RESIZE = "onResize";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function requireNativePlugin(name) {
    return weex.requireModule(name);
  }
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createLifeCycleHook = (lifecycle, flag = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onResize = /* @__PURE__ */ createLifeCycleHook(
    ON_RESIZE,
    2
    /* HookFlags.PAGE */
  );
  const onPullDownRefresh = /* @__PURE__ */ createLifeCycleHook(
    ON_PULL_DOWN_REFRESH,
    2
    /* HookFlags.PAGE */
  );
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$c = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick(e) {
        this.$emit("click", e);
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data2, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-946bce22"], ["__file", "D:/jqw/project/lyoTVMobile/node_modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue"]]);
  const scriptRel = "modulepreload";
  const assetsURL = function(dep) {
    return "/" + dep;
  };
  const seen = {};
  const __vitePreload = function preload(baseModule, deps, importerUrl) {
    let promise = Promise.resolve();
    if (false) {
      const links = document.getElementsByTagName("link");
      const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
      const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
      promise = Promise.all(deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen)
          return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        const isBaseRelative = !!importerUrl;
        if (isBaseRelative) {
          for (let i2 = links.length - 1; i2 >= 0; i2--) {
            const link2 = links[i2];
            if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
              return;
            }
          }
        } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
          link.crossOrigin = "";
        }
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
          });
        }
      }));
    }
    return promise.then(() => baseModule()).catch((err) => {
      const e = new Event("vite:preloadError", { cancelable: true });
      e.payload = err;
      window.dispatchEvent(e);
      if (!e.defaultPrevented) {
        throw err;
      }
    });
  };
  const SUB_KEY = "lyotv_sub_url";
  const store = vue.reactive({
    /** 当前订阅地址 */
    subUrl: uni.getStorageSync(SUB_KEY) || "",
    /** 首页分类列表 */
    classes: [],
    /** 首页推荐列表 */
    homeList: []
  });
  function setSubUrl(url) {
    store.subUrl = url;
    uni.setStorageSync(SUB_KEY, url);
  }
  function updateHome(data) {
    store.classes = data["class"] || data.classes || [];
    store.homeList = data.list || [];
  }
  const appState = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    setSubUrl,
    store,
    updateHome
  }, Symbol.toStringTag, { value: "Module" }));
  const PLUGIN_NAME = "Fongmi-VodPlugin";
  let vodPlugin = null;
  function getPlugin() {
    if (vodPlugin)
      return vodPlugin;
    formatAppLog("log", "at utils/api.js:14", "[插件] 开始 requireNativePlugin:", PLUGIN_NAME);
    try {
      vodPlugin = requireNativePlugin(PLUGIN_NAME);
      if (vodPlugin) {
        const methods = [];
        for (const k in vodPlugin)
          methods.push(k);
        formatAppLog("log", "at utils/api.js:20", "[插件] 加载成功，暴露方法:", methods.join(", ") || "(无)");
      } else {
        formatAppLog("error", "at utils/api.js:22", "[插件] requireNativePlugin 返回 null，插件未注册到基座");
      }
    } catch (e) {
      formatAppLog("error", "at utils/api.js:25", "[插件] requireNativePlugin 抛错:", e && e.message, e);
      vodPlugin = null;
    }
    return vodPlugin;
  }
  function callPlugin(method, args = {}, timeout = 15e3) {
    return new Promise((resolve, reject) => {
      const plugin = getPlugin();
      if (!plugin) {
        resolve(getMockData(method));
        return;
      }
      let settled = false;
      const finish = (fn, val) => {
        if (settled)
          return;
        settled = true;
        clearTimeout(timer);
        fn(val);
      };
      const timer = setTimeout(() => {
        formatAppLog("error", "at utils/api.js:50", `[插件] ${method} 超时 (${timeout}ms)，回调始终未触发`);
        finish(reject, new Error(`插件 ${method} 超时 (${timeout}ms)`));
      }, timeout);
      formatAppLog("log", "at utils/api.js:54", `[插件] 调用 ${method}`, JSON.stringify(args));
      try {
        plugin[method](args, (ret) => {
          formatAppLog("log", "at utils/api.js:57", `[插件] ${method} 回调触发`, JSON.stringify(ret));
          if (!ret) {
            formatAppLog("error", "at utils/api.js:60", `[插件] ${method} 返回空结果`);
            return finish(reject, new Error("插件返回空结果"));
          }
          const hasCode = typeof ret.code !== "undefined";
          const ok = !hasCode || ret.code === 0 || ret.code === 200;
          if (!ok) {
            formatAppLog("error", "at utils/api.js:67", `[插件] ${method} 失败 code=${ret.code} msg=${ret.msg}`);
            return finish(reject, new Error(ret.msg || `插件调用失败 code=${ret.code}`));
          }
          const data = ret.data;
          let parsed;
          if (data === void 0 || data === null || data === "") {
            parsed = ret;
          } else if (typeof data === "string") {
            try {
              parsed = JSON.parse(data);
            } catch (e) {
              formatAppLog("warn", "at utils/api.js:78", `[插件] ${method} data 不是合法 JSON，按原始字符串返回`);
              parsed = data;
            }
          } else {
            parsed = data;
          }
          formatAppLog("log", "at utils/api.js:85", `[插件] ${method} 解析完成`, JSON.stringify(parsed).substring(0, 300));
          finish(resolve, parsed);
        });
      } catch (e) {
        formatAppLog("error", "at utils/api.js:90", `[插件] ${method} 调用同步抛错:`, e && e.message, e);
        finish(reject, new Error(`插件调用异常: ${e.message}`));
      }
    });
  }
  async function initApp() {
    var _a, _b;
    formatAppLog("log", "at utils/api.js:98", "[App] initApp 启动，订阅地址:", store.subUrl || "(空)");
    if (!store.subUrl) {
      formatAppLog("log", "at utils/api.js:100", "[App] 无订阅地址，跳过");
      return;
    }
    try {
      formatAppLog("log", "at utils/api.js:104", "[App] 步骤1/2 调用 init 加载订阅源...");
      const initRet = await callPlugin("init", { url: store.subUrl });
      formatAppLog("log", "at utils/api.js:106", "[App] init 完成", JSON.stringify(initRet).substring(0, 200));
      formatAppLog("log", "at utils/api.js:107", "[App] 步骤2/2 调用 home 获取首页...");
      const homeData = await callPlugin("home");
      formatAppLog("log", "at utils/api.js:109", "[App] home 完成, class=", (_a = homeData == null ? void 0 : homeData.class) == null ? void 0 : _a.length, "list=", (_b = homeData == null ? void 0 : homeData.list) == null ? void 0 : _b.length);
      const { updateHome: updateHome2 } = await __vitePreload(() => Promise.resolve().then(() => appState), false ? "__VITE_PRELOAD__" : void 0);
      updateHome2(homeData);
      return homeData;
    } catch (e) {
      formatAppLog("error", "at utils/api.js:114", "[App] 自动加载订阅失败:", e && e.message, e);
      return null;
    }
  }
  function getMockData(method, args) {
    switch (method) {
      case "init":
        return { class: mockClasses, list: mockList };
      case "home":
        return { class: mockClasses, list: mockList };
      case "category":
        return { list: mockList };
      case "detail":
        return {
          vod: {
            ...mockDetail,
            flags: [
              {
                flag: "ckm3u8",
                episodes: [
                  { name: "第01集", url: "https://example.com/playlist.m3u8" },
                  { name: "第02集", url: "https://example.com/playlist2.m3u8" },
                  { name: "第03集", url: "https://example.com/playlist3.m3u8" },
                  { name: "第04集", url: "https://example.com/playlist4.m3u8" }
                ]
              }
            ]
          }
        };
      case "search":
        return { list: mockList.slice(0, 6) };
      case "player":
        return { url: "https://example.com/playlist.m3u8", parse: 0, header: {} };
      default:
        return {};
    }
  }
  const mockClasses = [
    { type_id: "1", type_name: "电影" },
    { type_id: "2", type_name: "电视剧" },
    { type_id: "3", type_name: "综艺" },
    { type_id: "4", type_name: "动漫" },
    { type_id: "5", type_name: "纪录片" }
  ];
  const mockList = Array.from({ length: 20 }, (_, i2) => ({
    vod_id: `${i2 + 1}`,
    vod_name: `影视标题 ${i2 + 1}`,
    vod_pic: `https://picsum.photos/seed/vod${i2}/300/400`,
    vod_remarks: i2 % 3 === 0 ? "更新至128集" : i2 % 2 === 0 ? "HD" : "第2026-06期",
    vod_year: "2026",
    vod_area: i2 % 2 === 0 ? "中国大陆" : "美国",
    type_name: mockClasses[i2 % mockClasses.length].type_name
  }));
  const mockDetail = {
    vod_id: "1",
    vod_name: "示例影视标题",
    vod_pic: "https://picsum.photos/seed/detail/400/600",
    vod_remarks: "更新至128集",
    vod_year: "2026",
    vod_area: "中国大陆",
    type_name: "电视剧",
    vod_director: "李导",
    vod_actor: "演员A、演员B、演员C",
    vod_content: "这是一段影视简介，描述剧情内容。讲述了在某个时代背景下，主人公经历了一系列冒险与成长的故事。剧情跌宕起伏，引人入胜。"
  };
  function init(sites) {
    formatAppLog("log", "at utils/api.js:189", "[API] init 传入订阅地址:", sites);
    return callPlugin("init", { url: sites }, 35e3);
  }
  function home() {
    formatAppLog("log", "at utils/api.js:196", "[API] home 请求首页数据");
    return callPlugin("home");
  }
  function category(tid, page = 1, extend = {}) {
    return callPlugin("category", { tid, page, extend });
  }
  function detail(id) {
    return callPlugin("detail", { id });
  }
  function search(keyword, page = 1) {
    return callPlugin("search", { keyword, page });
  }
  function player(flag, id) {
    return callPlugin("player", { flag, id });
  }
  const STORAGE_KEYS = {
    FAVORITES: "lyotv_favorites",
    HISTORY: "lyotv_history",
    SETTINGS: "lyotv_settings"
  };
  function getFavorites() {
    try {
      return uni.getStorageSync(STORAGE_KEYS.FAVORITES) || [];
    } catch {
      return [];
    }
  }
  function addFavorite(vod) {
    const list = getFavorites();
    if (list.some((item) => item.vod_id === vod.vod_id))
      return list;
    list.unshift({ ...vod, fav_time: Date.now() });
    uni.setStorageSync(STORAGE_KEYS.FAVORITES, list);
    return list;
  }
  function removeFavorite(vodId) {
    const list = getFavorites().filter((item) => item.vod_id !== vodId);
    uni.setStorageSync(STORAGE_KEYS.FAVORITES, list);
    return list;
  }
  function isFavorite(vodId) {
    return getFavorites().some((item) => item.vod_id === vodId);
  }
  function getHistory() {
    try {
      return uni.getStorageSync(STORAGE_KEYS.HISTORY) || [];
    } catch {
      return [];
    }
  }
  function addHistory(vod, episode = "", progress = 0) {
    let list = getHistory();
    list = list.filter((item) => item.vod_id !== vod.vod_id);
    list.unshift({
      vod_id: vod.vod_id,
      vod_name: vod.vod_name,
      vod_pic: vod.vod_pic,
      vod_remarks: vod.vod_remarks,
      episode,
      progress,
      time: Date.now()
    });
    uni.setStorageSync(STORAGE_KEYS.HISTORY, list);
    return list;
  }
  function clearHistory() {
    uni.setStorageSync(STORAGE_KEYS.HISTORY, []);
    return [];
  }
  const _sfc_main$b = {
    __name: "category-nav",
    props: {
      list: { type: Array, default: () => [] },
      activeId: { type: [String, Number], default: "" }
    },
    emits: ["change"],
    setup(__props, { expose: __expose }) {
      __expose();
      const __returned__ = {};
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "nav-wrapper" }, [
      vue.createElementVNode("scroll-view", {
        class: "category-nav",
        "scroll-x": "",
        enhanced: "",
        "show-scrollbar": "false"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($props.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.type_id,
              class: vue.normalizeClass(["tab", { active: item.type_id === $props.activeId }]),
              onClick: ($event) => _ctx.$emit("change", item)
            }, [
              item.type_id === "" ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                key: 0,
                type: "home-filled",
                size: "14",
                color: "currentColor"
              })) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode(
                "text",
                { style: { "margin-left": "4rpx" } },
                vue.toDisplayString(item.type_name),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const CategoryNav = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-c5e4a4a8"], ["__file", "D:/jqw/project/lyoTVMobile/components/category-nav.vue"]]);
  const _sfc_main$a = {
    __name: "vod-card",
    props: {
      item: { type: Object, required: true }
    },
    emits: ["tap"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      function onTap() {
        emit("tap", props.item);
      }
      const __returned__ = { props, emit, onTap };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "vod-card",
      onClick: $setup.onTap
    }, [
      vue.createElementVNode("view", { class: "poster-wrap" }, [
        vue.createElementVNode("image", {
          class: "poster",
          src: $props.item.vod_pic,
          mode: "aspectFill",
          "lazy-load": ""
        }, null, 8, ["src"]),
        vue.createElementVNode("view", { class: "play-overlay" }, [
          vue.createVNode(_component_uni_icons, {
            type: "play-filled",
            size: "20",
            color: "#fff"
          })
        ])
      ]),
      vue.createElementVNode("view", { class: "info" }, [
        vue.createElementVNode(
          "text",
          {
            class: "title",
            lines: 1
          },
          vue.toDisplayString($props.item.vod_name),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "meta" }, [
          $props.item.vod_remarks ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "tag"
            },
            vue.toDisplayString($props.item.vod_remarks),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true),
          $props.item.vod_year ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 1,
              class: "year"
            },
            vue.toDisplayString($props.item.vod_year),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ]);
  }
  const VodCard = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-da7b7900"], ["__file", "D:/jqw/project/lyoTVMobile/components/vod-card.vue"]]);
  const _sfc_main$9 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      const RECOMMEND_TAB = { type_id: "", type_name: "推荐" };
      const classes = vue.ref(store.classes);
      const list = vue.ref(store.homeList);
      const activeTid = vue.ref("");
      const page = vue.ref(1);
      const imageSize = vue.ref("medium");
      try {
        const saved = uni.getStorageSync("lyotv_image_size");
        if (saved)
          imageSize.value = saved;
      } catch {
      }
      const gridStyle = vue.computed(() => {
        const config2 = {
          large: { cols: 3, gap: "16rpx" },
          medium: { cols: 4, gap: "12rpx" },
          small: { cols: 5, gap: "10rpx" }
        };
        const c = config2[imageSize.value] || config2.medium;
        return {
          gridTemplateColumns: `repeat(${c.cols}, 1fr)`,
          gap: c.gap
        };
      });
      const tabList = vue.computed(() => [RECOMMEND_TAB, ...classes.value]);
      vue.watch(() => store.classes, (v) => {
        classes.value = v;
      }, { immediate: true });
      vue.watch(() => store.homeList, (v) => {
        if (activeTid.value === "")
          list.value = v;
      }, { immediate: true });
      vue.onMounted(async () => {
        if (store.homeList.length > 0) {
          list.value = store.homeList;
          return;
        }
        if (!store.subUrl) {
          uni.showToast({ title: '请先在"我的"设置订阅源', icon: "none" });
          return;
        }
        await loadHome();
      });
      async function loadHome() {
        try {
          const data = await home();
          classes.value = data["class"] || data.classes || [];
          list.value = data.list || [];
          updateHome(data);
          activeTid.value = "";
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:101", "[首页] 加载失败:", e && e.message, e);
          uni.showToast({ title: (e == null ? void 0 : e.message) || "加载失败", icon: "none" });
        }
      }
      uni.$on("subUpdated", () => {
        if (store.homeList.length === 0)
          loadHome();
      });
      async function onCategoryChange(item) {
        activeTid.value = item.type_id;
        page.value = 1;
        if (item.type_id === "") {
          list.value = store.homeList;
          return;
        }
        try {
          const data = await category(item.type_id, 1);
          list.value = data.list || [];
        } catch (e) {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      }
      function goDetail(item) {
        addHistory(item);
        uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` });
      }
      const __returned__ = { RECOMMEND_TAB, classes, list, activeTid, page, imageSize, gridStyle, tabList, loadHome, onCategoryChange, goDetail, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, watch: vue.watch, get home() {
        return home;
      }, get category() {
        return category;
      }, get addHistory() {
        return addHistory;
      }, get store() {
        return store;
      }, get updateHome() {
        return updateHome;
      }, CategoryNav, VodCard };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createVNode($setup["CategoryNav"], {
        list: $setup.tabList,
        activeId: $setup.activeTid,
        onChange: $setup.onCategoryChange
      }, null, 8, ["list", "activeId"]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode(
          "view",
          {
            class: "grid",
            style: vue.normalizeStyle($setup.gridStyle)
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.list, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "grid-item",
                  key: item.vod_id,
                  onClick: ($event) => $setup.goDetail(item)
                }, [
                  vue.createVNode($setup["VodCard"], { item }, null, 8, ["item"])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          4
          /* STYLE */
        )
      ]),
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "load-more"
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "more",
          size: "14",
          color: "#555"
        }),
        vue.createElementVNode("text", { class: "load-text" }, " 没有更多了")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/jqw/project/lyoTVMobile/pages/index/index.vue"]]);
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str2, parts) {
    return !!parts.find((part) => str2.indexOf(part) !== -1);
  }
  function startsWith(str2, parts) {
    return parts.find((part) => str2.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en = {
    "uni-load-more.contentdown": "Pull up to show more",
    "uni-load-more.contentrefresh": "loading...",
    "uni-load-more.contentnomore": "No more data"
  };
  const zhHans = {
    "uni-load-more.contentdown": "上拉显示更多",
    "uni-load-more.contentrefresh": "正在加载...",
    "uni-load-more.contentnomore": "没有更多数据了"
  };
  const zhHant = {
    "uni-load-more.contentdown": "上拉顯示更多",
    "uni-load-more.contentrefresh": "正在加載...",
    "uni-load-more.contentnomore": "沒有更多數據了"
  };
  const messages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  let platform;
  setTimeout(() => {
    platform = uni.getSystemInfoSync().platform;
  }, 16);
  const {
    t
  } = initVueI18n(messages);
  const _sfc_main$8 = {
    name: "UniLoadMore",
    emits: ["clickLoadMore"],
    props: {
      status: {
        // 上拉的状态：more-loading前；loading-loading中；noMore-没有更多了
        type: String,
        default: "more"
      },
      showIcon: {
        type: Boolean,
        default: true
      },
      iconType: {
        type: String,
        default: "auto"
      },
      iconSize: {
        type: Number,
        default: 24
      },
      color: {
        type: String,
        default: "#777777"
      },
      contentText: {
        type: Object,
        default() {
          return {
            contentdown: "",
            contentrefresh: "",
            contentnomore: ""
          };
        }
      },
      showText: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        webviewHide: false,
        platform,
        imgBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzlBMzU3OTlEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzlBMzU3OUFEOUM0MTFFOUI0NTZDNERBQURBQzI4RkUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDOUEzNTc5N0Q5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDOUEzNTc5OEQ5QzQxMUU5QjQ1NkM0REFBREFDMjhGRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pt+ALSwAAA6CSURBVHja1FsLkFZVHb98LM+F5bHL8khA1iSeiyQBCRM+YGqKUnnJTDLGI0BGZlKDIU2MMglUiDApEZvSsZnQtBRJtKwQNKQMFYeRDR10WOLd8ljYXdh+v8v5fR3Od+797t1dnOnO/Ofce77z+J//+b/P+ZqtXbs2sJ9MJhNUV1cHJ06cCJo3bx7EPc2aNcvpy7pWrVoF+/fvDyoqKoI2bdoE9fX1F7TjN8a+EXBn/fkfvw942Tf+wYMHg9mzZwfjxo0LDhw4EPa1x2MbFw/fOGfPng1qa2tzcCkILsLDydq2bRsunpOTMM7TD/W/tZDZhPdeKD+yGxHhdu3aBV27dg3OnDlzMVANMheLAO3btw8KCwuDmpoaX5OxbgUIMEq7K8IcPnw4KCsrC/r37x8cP378/4cAXAB3vqSkJMuiDhTkw+XcuXNhOWbMmKBly5YhUT8xArhyFvP0BfwRsAuwxJZJsm/nzp2DTp06he/OU+cZ64K6o0ePBkOHDg2GDx8e6gEbJ5Q/NHNuAJQ1hgBeHUDlR7nVTkY8rQAvAi4z34vR/mPs1FoRsaCgIJThI0eOBC1atEiFGGV+5MiRoS45efJkqFjJFXV1dQuA012m2WcwTw98fy6CqBdsaiIO4CScrGPHjvk4odhavPquRtFWXEC25VgkREKOCh/qDSq+vn37htzD/mZTOmOc5U7zKzBPEedygWshcDyWvs30igAbU+6oyMgJBCFhwQE0fccxN60Ay9iebbjoDh06hMowjQxT4fXq1SskArmHZpkArvixp/kWzHdMeArExSJEaiXIjjRjRJ4DaAGWpibLzXN3Fm1vA5teBgh3j1Rv3bp1YgKwPdmf2p9zcyNYYgPKMfY0T5f5nNYdw158nJ8QawW4CLKwiOBSEgO/hok2eBydR+3dYH+PLxA5J8Vv0KBBwenTp0P2JWAx6+yFEBfs8lMY+y0SWMBNI9E4ThKi58VKTg3FQZS1RQF1cz27eC0QHMu+3E0SkUowjhVt5VdaWhp07949ZHv2Qd1EjDXM2cla1M0nl3GxAs3J9yREzyTdFVKVFOaE9qRA8GM0WebRuo9JGZKA7Mv2SeS/Z8+eoQ9BArMfFrLGo6jvxbhHbJZnKX2Rzz1O7QhJJ9Cs2ZMaWIyq/zhdeqPNfIoHd58clIQD+JSXl4dKlyIAuBdVXZwFVWKspSSoxE++h8x4k3uCnEhE4I5KwRiFWGOU0QWKiCYLbdoRMRKAu2kQ9vkfLU6dOhX06NEjlH+yMRZSinnuyWnYosVcji8CEA/6Cg2JF+IIUBqnGKUTCNwtwBN4f89RiK1R96DEgO2o0NDmtEdvVFdVVYV+P3UAPUEs6GFwV3PHmXkD4vh74iDFJysVI/MlaQhwKeBNTLYX5VuA8T4/gZxA4MRGFxDB6R7OmYPfyykGRJbyie+XnGYnQIC/coH9+vULiYrxrkL9ZA9+0ykaHIfEpM7ge8TiJ2CsHYwyMfafAF1yCGBHYIbCVDjDjKt7BeB51D+LgQa6OkG7IDYEEtvQ7lnXLKLtLdLuJBpE4gPUXcW2+PkZwOex+4cGDhwYDBkyRL7/HFcEwUGPo/8uWRUpYnfxGHco8HkewLHLyYmAawAPuIFZxhOpDfJQ8gbUv41yORAptMWBNr6oqMhWird5+u+iHmBb2nhjDV7HWBNQTgK8y11l5NetWzc5ULscAtSj7nbNI0skhWeUZCc0W4nyH/jO4Vz0u1IeYhbk4AiwM6tjxIWByHsoZ9qcIBPJd/y+DwPfBESOmCa/QF3WiZHucLlEDpNxcNhmheEOPgdQNx6/VZFQzFZ5TN08AHXQt2Ii3EdyFuUsPtTcGPhW5iMiCNELvz+Gdn9huG4HUJaW/w3g0wxV0XaG7arG2WeKiUWYM4Y7GO5ezshTARbbWGw/DvXkpp/ivVvE0JVoMxN4rpGzJMhE5Pl+xlATsDIqikP9F9D2z3h9nOksEUFhK+qO4rcPkoalMQ/HqJLIyb3F3JdjrCcw1yZ8joyJLR5gCo54etlag7qIoeNh1N1BRYj3DTFJ0elotxPlVzkGuYAmL0VSJVGAJA41c4Z6A3BzTLfn0HYwYKEI6CUAMzZEWvLsIcQOo1AmmyyM72nHJCfYsogflGV6jEk9vyQZXSuq6w4c16NsGcGZbwOPr+H1RkOk2LEzjNepxQkihHSCQ4ynAYNRx2zMKV92CQMWqj8J0BRE8EShxRFN6YrfCRhC0x3r/Zm4IbQCcmJoV0kMamllccR6FjHqUC5F2R/wS2dcymOlfAKOS4KmzQb5cpNC2MC7JhVn5wjXoJ44rYhLh8n0eXOCorJxa7POjbSlCGVczr34/RsAmrcvo9s+wGp3tzVhntxiXiJ4nvEYb4FJkf0O8HocAePmLvCxnL0AORraVekJk6TYjDabRVXfRE2lCN1h6ZQRN1+InUbsCpKwoBZHh0dODN9JBCUffItXxEavTQkUtnfTVAplCWL3JISz29h4NjotnuSsQKJCk8dF+kJR6RARjrqFVmfPnj3ZbK8cIJ0msd6jgHPGtfVTQ8VLmlvh4mct9sobRmPic0DyDQQnx/NlfYUgyz59+oScsH379pAwXABD32nTpoUHIToESeI5mnbE/UqDdyLcafEBf2MCqgC7NwxIbMREJQ0g4D4sfJwnD+AmRrII05cfMWJE+L1169bQr+fip06dGp4oJ83lmYd5wj/EmMa4TaHivo4EeCguYZBnkB5g2aWA69OIEnUHOaGysjIYMGBAMGnSpODYsWPZwCpFmm4lNq+4gSLQA7jcX8DwtjEyRC8wjabnXEx9kfWnTJkSJkAo90xpJVV+FmcVNeYAF5zWngS4C4O91MBxmAv8blLEpbjI5sz9MTdAhcgkCT1RO8mZkAjfiYpTEvStAS53Uw1vAiUGgZ3GpuQEYvoiBqlIan7kSDHnTwJQFNiPu0+5VxCVYhcZIjNrdXUDdp+Eq5AZ3Gkg8QAyVZRZIk4Tl4QAbF9cXJxNYZMAtAokgs4BrNxEpCtteXg7DDTMDKYNSuQdKsnJBek7HxewvxaosWxLYXtw+cJp18217wql4aKCfBNoEu0O5VU+PhctJ0YeXD4C6JQpyrlpSLTojpGGGN5YwNziChdIZLk4lvLcFJ9jMX3QdiImY9bmGQU+TRUL5CHITTRlgF8D9ouD1MfmLoEPl5xokIumZ2cfgMpHt47IW9N64Hsh7wQYYjyIugWuF5fCqYncXRd5vPMWyizzvhi/32+nvG0dZc9vR6fZOu0md5e+uC408FvKSIOZwXlGvxPv95izA2Vtvg1xKFWARI+vMX66HUhpQQb643uW1bSjuTWyw2SBvDrBvjFic1eGGlz5esq3ko9uSIlBRqPuFcCv8F4WIcN12nVaBd0SaYwI6PDDImR11JkqgHcPmQssjxIn6bUshygDFJUTxPMpHk+jfjPgupgdnYV2R/g7xSjtpah8RJBewhwf0gGK6XI92u4wXFEU40afJ4DN4h5LcAd+40HI3JgJecuT0c062W0i2hQJUTcxan3/CMW1PF2K6bbA+Daz4xRs1D3Br1Cm0OihKCqizW78/nXAF/G5TXrEcVzaNMH6CyMswqsAHqDyDLEyou8lwOXnKF8DjI6KjV3KzMBiXkDH8ij/H214J5A596ekrZ3F0zXlWeL7+P5eUrNo3/QwC15uxthuzidy7DzKRwEDaAViiDgKbTbz7CJnzo0bN7pIfIiid8SuPwn25o3QCmpnyjlZkyxPP8EomCJzrGb7GJMx7tNsq4MT2xMUYaiErZOluTzKsnz3gwCeCZyVRZJfYplNEokEjwrPtxlxjeYAk+F1F74VAzPxQRNYYdtpOUvWs8J1sGhBJMNsb7igN8plJs1eSmLIhLKE4rvaCX27gOhLpLOsIzJ7qn/i+wZzcvSOZ23/du8TZjwV8zHIXoP4R3ifBxiFz1dcVpa3aPntPE+c6TmIWE9EtcMmAcPdWAhYhAXxcLOQi9L1WhD1Sc8p1d2oL7XGiRKp8F4A2i8K/nfI+y/gsTDJ/YC/8+AD5Uh04KHiGl+cIFPnBDDrPMjwRGkLXyxO4VGbfQWnDH2v0bVWE3C9QOXlepbgjEfIJQI6XDG3z5ahD9cw2pS78ipB85wyScNTvsVzlzzhL8/jRrnmVjfFJK/m3m4nj9vbgQTguT8XZTjsm672R5uJKEaQmBI/c58gyus8ZDagLpEVSJBIyHp4jn++xqPV71OgQgJYEWOtZ/haxRtKmWOBu8xdBLftWltsY84zE6WIEy/eIOWL+BaayMx+KHtL7EAkqdNDLiEXmEMUHniedtJqg9HmZtfvt26vNi0BdG3Ft3g8ZOf7PAu59TxtzivLNIekyi+wD1i8CuUiD9FXAa8C+/xS3JPmZnomyc7H+fb4/Se0bk41Fel621r4cgVxbq91V4jVqwB7HTe2M7jgB+QWHavZkDRPmZcASoZEmBx6i75bGjPcMdL4/VKGFAGWZkGzPG0XAbdL9A81G5LOmUnC9hHKJeO7dcUMjblSl12867ElFTtaGl20xvvLGPdVz/8TVuU7y0x1PG7vtNg24oz9Uo/Z412++VFWI7Fcog9tu9Lm6gvRmIPv9x1xmQAu6RDkXtbOtlGEmpgD5Nvnyc0dcv0EE6cfdi1HmhMf9wDF3k3gtRvEedhxjpgfqPb9PU9iEJHnyOUA7bQUXh6kq/D7l2iTjWv7XOD530BDr8jIrus+srXjt4MzumJMHuTsBa63YKE1+RR5lBjEikCCnWKWiHdzOgKO+nRIBAF88za/IFmJ3eMZov4CYxGBabcpGL8EYx+SeMXJeRwHNsV/h+vdxeuhEpN3ZyNY78Gm2fknJxVGhyjixPiQvVkNzT1elD9Py/aTAL64Hb9vcYmC9zfdXdT/C1LeGbg4rnBaAihDFJH12W5ulfNCNe/xTsP3bp8ikzJs5BF+5PNfAQYAPaseTdsEcaYAAAAASUVORK5CYII="
      };
    },
    computed: {
      iconSnowWidth() {
        return (Math.floor(this.iconSize / 24) || 1) * 2;
      },
      contentdownText() {
        return this.contentText.contentdown || t("uni-load-more.contentdown");
      },
      contentrefreshText() {
        return this.contentText.contentrefresh || t("uni-load-more.contentrefresh");
      },
      contentnomoreText() {
        return this.contentText.contentnomore || t("uni-load-more.contentnomore");
      }
    },
    mounted() {
      var pages = getCurrentPages();
      var page = pages[pages.length - 1];
      var currentWebview = page.$getAppWebview();
      currentWebview.addEventListener("hide", () => {
        this.webviewHide = true;
      });
      currentWebview.addEventListener("show", () => {
        this.webviewHide = false;
      });
    },
    methods: {
      onClick() {
        this.$emit("clickLoadMore", {
          detail: {
            status: this.status
          }
        });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data2, $options) {
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "uni-load-more",
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data2.webviewHide && ($props.iconType === "circle" || $props.iconType === "auto" && $data2.platform === "android") && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--android-MP"
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          ),
          vue.createElementVNode(
            "view",
            {
              class: "uni-load-more__img-icon",
              style: vue.normalizeStyle({ borderTopColor: $props.color, borderTopWidth: $props.iconSize / 12 })
            },
            null,
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )) : !$data2.webviewHide && $props.status === "loading" && $props.showIcon ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          style: vue.normalizeStyle({ width: $props.iconSize + "px", height: $props.iconSize + "px" }),
          class: "uni-load-more__img uni-load-more__img--ios-H5"
        },
        [
          vue.createElementVNode("image", {
            class: "image",
            src: $data2.imgBase64,
            mode: "widthFix"
          }, null, 8, ["src"])
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true),
      $props.showText ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 2,
          class: "uni-load-more__text",
          style: vue.normalizeStyle({ color: $props.color })
        },
        vue.toDisplayString($props.status === "more" ? $options.contentdownText : $props.status === "loading" ? $options.contentrefreshText : $options.contentnomoreText),
        5
        /* TEXT, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-2c1dd21f"], ["__file", "D:/jqw/project/lyoTVMobile/node_modules/@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue"]]);
  const _sfc_main$7 = {
    __name: "search",
    setup(__props, { expose: __expose }) {
      __expose();
      const keyword = vue.ref("");
      const lastKeyword = vue.ref("");
      const resultList = vue.ref([]);
      const searched = vue.ref(false);
      const loadStatus = vue.ref("more");
      const historyTags = vue.ref([]);
      try {
        historyTags.value = uni.getStorageSync("lyotv_search_history") || [];
      } catch {
      }
      function saveHistory(kw) {
        if (!kw)
          return;
        let list = [kw, ...historyTags.value.filter((t2) => t2 !== kw)].slice(0, 10);
        historyTags.value = list;
        uni.setStorageSync("lyotv_search_history", list);
      }
      function tapHistory(kw) {
        keyword.value = kw;
        doSearch();
      }
      function clearHistory2() {
        historyTags.value = [];
        uni.setStorageSync("lyotv_search_history", []);
      }
      let timer = null;
      function onInput() {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (keyword.value.trim())
            doSearch();
        }, 500);
      }
      async function doSearch() {
        const kw = keyword.value.trim();
        if (!kw)
          return;
        lastKeyword.value = kw;
        searched.value = true;
        saveHistory(kw);
        try {
          const data = await search(kw);
          resultList.value = data.list || [];
        } catch {
          resultList.value = [];
        }
      }
      function goDetail(item) {
        addHistory(item);
        uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` });
      }
      const __returned__ = { keyword, lastKeyword, resultList, searched, loadStatus, historyTags, saveHistory, tapHistory, clearHistory: clearHistory2, get timer() {
        return timer;
      }, set timer(v) {
        timer = v;
      }, onInput, doSearch, goDetail, ref: vue.ref, get search() {
        return search;
      }, get addHistory() {
        return addHistory;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.createElementVNode("view", { class: "search-input" }, [
          vue.createVNode(_component_uni_icons, {
            type: "search",
            size: "18",
            color: "#888"
          }),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.keyword = $event),
              placeholder: "搜影视、演员...",
              "placeholder-class": "placeholder",
              "confirm-type": "search",
              onConfirm: $setup.doSearch,
              onInput: $setup.onInput
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $setup.keyword]
          ]),
          $setup.keyword ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "clear",
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.keyword = "")
          }, "✕")) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      !$setup.searched && $setup.historyTags.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "clock",
            size: "14",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "section-title" }, " 搜索历史"),
          vue.createElementVNode("view", {
            class: "clear-btn",
            onClick: $setup.clearHistory
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "trash",
              size: "14",
              color: "#888"
            }),
            vue.createElementVNode("text", { style: { "margin-left": "4rpx" } }, "清空")
          ])
        ]),
        vue.createElementVNode("view", { class: "tags" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.historyTags, (tag, i2) => {
              return vue.openBlock(), vue.createElementBlock("text", {
                key: i2,
                class: "tag",
                onClick: ($event) => $setup.tapHistory(tag)
              }, vue.toDisplayString(tag), 9, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "result-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.resultList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "result-item",
              key: item.vod_id,
              onClick: ($event) => $setup.goDetail(item)
            }, [
              vue.createElementVNode("image", {
                class: "thumb",
                src: item.vod_pic,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: "title",
                    lines: 1
                  },
                  vue.toDisplayString(item.vod_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: "desc",
                    lines: 2
                  },
                  vue.toDisplayString(item.vod_remarks) + " · " + vue.toDisplayString(item.vod_year) + " · " + vue.toDisplayString(item.vod_area),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "type-tag" },
                  vue.toDisplayString(item.type_name),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $setup.resultList.length > 0 ? (vue.openBlock(), vue.createBlock(_component_uni_load_more, {
          key: 0,
          status: $setup.loadStatus
        }, null, 8, ["status"])) : vue.createCommentVNode("v-if", true),
        $setup.searched && $setup.resultList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty"
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "search",
            size: "32",
            color: "#555"
          }),
          vue.createElementVNode(
            "text",
            null,
            '未找到 "' + vue.toDisplayString($setup.lastKeyword) + '" 相关结果',
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ]))
    ]);
  }
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-c10c040c"], ["__file", "D:/jqw/project/lyoTVMobile/pages/search/search.vue"]]);
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var muiPlayer_min = { exports: {} };
  muiPlayer_min.exports;
  (function(module, exports) {
    /*!
    * Mui Player Javascript Library v1.8.1 @Professional edition
    * Date：2023-01-28
    * Released under GPL-3.0 license
    * https://muiplayer.js.org/
    */
    function _toConsumableArray(e) {
      return _arrayWithoutHoles(e) || _iterableToArray(e) || _unsupportedIterableToArray(e) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _iterableToArray(e) {
      if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"])
        return Array.from(e);
    }
    function _arrayWithoutHoles(e) {
      if (Array.isArray(e))
        return _arrayLikeToArray(e);
    }
    function _createForOfIteratorHelper(e, t2) {
      var o = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
      if (!o) {
        if (Array.isArray(e) || (o = _unsupportedIterableToArray(e)) || t2 && e && "number" == typeof e.length) {
          o && (e = o);
          var r = 0, t2 = function() {
          };
          return { s: t2, n: function() {
            return r >= e.length ? { done: true } : { done: false, value: e[r++] };
          }, e: function(e2) {
            throw e2;
          }, f: t2 };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var n, i2 = true, l = false;
      return { s: function() {
        o = o.call(e);
      }, n: function() {
        var e2 = o.next();
        return i2 = e2.done, e2;
      }, e: function(e2) {
        l = true, n = e2;
      }, f: function() {
        try {
          i2 || null == o.return || o.return();
        } finally {
          if (l)
            throw n;
        }
      } };
    }
    function _unsupportedIterableToArray(e, t2) {
      if (e) {
        if ("string" == typeof e)
          return _arrayLikeToArray(e, t2);
        var o = Object.prototype.toString.call(e).slice(8, -1);
        return "Map" === (o = "Object" === o && e.constructor ? e.constructor.name : o) || "Set" === o ? Array.from(e) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(e, t2) : void 0;
      }
    }
    function _arrayLikeToArray(e, t2) {
      (null == t2 || t2 > e.length) && (t2 = e.length);
      for (var o = 0, r = new Array(t2); o < t2; o++)
        r[o] = e[o];
      return r;
    }
    function _typeof(e) {
      return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e2) {
        return typeof e2;
      } : function(e2) {
        return e2 && "function" == typeof Symbol && e2.constructor === Symbol && e2 !== Symbol.prototype ? "symbol" : typeof e2;
      })(e);
    }
    !function(e, t2) {
      "object" == _typeof(exports) && "object" == _typeof(module) ? module.exports = t2() : e.MuiPlayer = t2();
    }(window, function() {
      var MuiPlayer = function MuiPlayer(config) {
        var _this = this;
        _this._global_ = {};
        var webpagePlugin = "", mobilePlugin = "", hls = null, flv = null, option = config || {}, plugins = option.plugins || [];
        this._event_ = {};
        var con = "string" == typeof option.container ? document.querySelector(option.container) : option.container, $CONSTANT, $habit, $node, $global, element, $el, variable, $data, $method;
        con && ($CONSTANT = { unitLengthReg: /^(auto|inherit|initial|\d+(\.\d+)?(\%|px|cm|mm|em|rem|vw|vh|)?)$/i, encodeKey: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" }, $habit = { themeColor: "#1e98d4" }, $node = { video: '<!-- HTML5 Video --><div class="video-wrapper"><video width="100%" height="100%"></video></div>', mplayerPoster: '<div class="mplayer-poster" id="mplayer-poster"></div>', mplayerCover: '<!-- 媒体播放遮罩层 --><div class="mplayer-cover" id="mplayer-cover"></div>', mplayerLoading: '<!-- Mplayer加载Loading --><div class="mplayer-loading"id="mplayer-loading"control><svg viewBox="25 25 50 50"class="mplayer-loading__circular"><circle cx="50"cy="50"r="20"fill="none"></circle></svg></div>', mplayerError: '<!-- 视频加载错误显示 --><div class="mplayer-error"id="mplayer-error"control><div class="errop-tip">视频加载失败，点击刷新</div><svg t="1575125481608"class="icon"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="5893"width="28"height="28"><path d="M513.34 831.74C337.03 831.74 193.6 688.31 193.6 512c0-71.09 23.31-138.85 65.53-194.03v51.61c0 17.67 14.33 32 32 32s32-14.33 32-32V239.45c0-5.87-1.59-11.36-4.34-16.09-0.06-0.1-0.11-0.2-0.17-0.3-0.16-0.28-0.34-0.55-0.51-0.82-0.13-0.2-0.26-0.41-0.39-0.61-0.08-0.13-0.17-0.25-0.26-0.37a35.5 35.5 0 0 0-1.58-2.13c-6.81-8.35-16.96-12.35-26.95-11.69h-130c-17.67 0-32 14.33-32 32s14.33 32 32 32h55.35C159.8 339 129.6 423.35 129.6 512c0 51.79 10.15 102.05 30.17 149.38 19.33 45.7 46.99 86.74 82.23 121.97 35.23 35.23 76.27 62.9 121.97 82.23 47.33 20.02 97.59 30.17 149.38 30.17 17.67 0 32-14.33 32-32s-14.34-32.01-32.01-32.01zM855.38 762.3h-51.23c19.81-23 36.93-48.3 50.75-75.22 27.6-53.74 42.18-114.28 42.18-175.08 0-51.79-10.15-102.05-30.17-149.38-19.33-45.7-46.99-86.73-82.23-121.97-35.23-35.23-76.27-62.9-121.97-82.23-47.33-20.02-97.59-30.17-149.38-30.17-17.67 0-32 14.33-32 32s14.33 32 32 32c176.31 0 319.74 143.44 319.74 319.74 0 78.31-27.68 151.61-77.6 209.05l0.24-56.04c0.08-17.67-14.19-32.06-31.86-32.14h-0.14c-17.61 0-31.92 14.24-32 31.86l-0.55 129.43a31.988 31.988 0 0 0 9.32 22.71 31.68 31.68 0 0 0 5.33 4.3c0.02 0.01 0.04 0.02 0.06 0.04 0.48 0.31 0.97 0.61 1.47 0.89l0.15 0.09c0.5 0.28 1 0.54 1.51 0.8 0.03 0.01 0.05 0.03 0.08 0.04 1.64 0.8 3.34 1.46 5.1 1.98 0.01 0 0.02 0.01 0.03 0.01 0.55 0.16 1.1 0.3 1.66 0.43 0.07 0.02 0.15 0.03 0.22 0.05 0.5 0.11 1 0.21 1.5 0.3 0.1 0.02 0.2 0.04 0.3 0.05 0.48 0.08 0.96 0.15 1.44 0.21 0.11 0.01 0.23 0.03 0.34 0.04 0.48 0.05 0.95 0.09 1.43 0.12l0.34 0.03c0.53 0.03 1.07 0.04 1.61 0.05h132.31c17.67 0 32-14.33 32-32s-14.31-31.99-31.98-31.99z"p-id="5894"fill="#ffffff"></path></svg></div>', mplayerHeader: '<!-- Mplayer 顶部导航 --><div class="mplayer-header"id="mplayer-header"><div class="title-groupt"id="title-groupt"><button class="player-btn header-control back-button keyboard-input"id="back-button"control><svg id="back-icon-svg"t="1573891955387"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="4550"width="18"height="18"><path d="M305.519192 557.640404c-11.636364 0-23.40202-4.39596-32.323232-13.317172-17.842424-17.842424-17.842424-46.674747 0-64.517171L683.830303 69.30101c17.842424-17.842424 46.674747-17.842424 64.517172 0 17.842424 17.842424 17.842424 46.674747 0 64.517172L337.713131 544.323232c-8.921212 8.921212-20.557576 13.317172-32.193939 13.317172z m0 0"fill="#ffffff"p-id="4551"></path><path d="M715.894949 968.145455c-11.636364 0-23.40202-4.39596-32.323232-13.317172L273.19596 544.323232c-17.842424-17.842424-17.842424-46.674747 0-64.517171 17.842424-17.842424 46.674747-17.842424 64.517171 0l410.505051 410.50505c17.842424 17.842424 17.842424 46.674747 0 64.517172-8.921212 8.921212-20.557576 13.317172-32.323233 13.317172z m0 0"fill="#ffffff"p-id="4552"></path></svg><div class="title-name"id="title-name"></div></button></div><div class="buttom-group"id="buttom-group"></div></div>', mplayerFooter: '<!-- Mplayer 底部操作控件 --><div class="mplayer-footer"id="mplayer-footer"><div class="progress"id="progress"><div class="left-part"id="left-part"><button class="player-btn keyboard-input play-switch footer-control"id="play-switch"control><!--play button--><div class="_play"><svg t="1574051894346"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="1212"><path d="M324.085 95.787l500.422 300.664c82.373 50.453 79.284 136.946-1.030 186.37v0l-506.6 304.784c-41.187 23.683-87.522 37.068-131.798 9.267-36.037-22.653-46.335-58.691-46.335-97.819v-616.774c0-39.127 13.386-75.166 48.395-97.819 45.305-27.801 94.731-14.416 136.946 11.327v0z"p-id="1213"fill="#ffffff"></path></svg></div><!--pause button--><div class="_pause"style="display: none;"><svg t="1574051952939"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="1434"><path d="M248.26311111 515.072c0-110.592-0.22755555-221.184 0.11377778-331.776 0.11377778-35.84 18.20444445-60.87111111 49.26577778-70.99733333 27.53422222-8.87466667 56.88888889 0.34133333 75.32088888 23.77955555 10.58133333 13.42577778 15.13244445 28.89955555 15.01866667 45.96622223-0.11377778 223.11822222 0.11377778 446.23644445-0.22755555 669.35466666-0.11377778 42.55288889-31.06133333 73.27288889-70.54222222 72.81777778-39.25333333-0.45511111-68.72177778-31.51644445-68.94933334-74.52444444-0.34133333-111.50222222 0-223.11822222 0-334.62044445zM638.52088889 516.66488889V193.64977778c0-52.45155555 27.42044445-85.21955555 70.54222222-84.65066667 42.43911111 0.56888889 69.17688889 32.42666667 69.17688889 83.05777778 0.11377778 218.22577778 0.11377778 436.56533333 0 654.79111111 0 38.34311111-17.29422222 63.60177778-49.152 73.95555555-27.648 8.98844445-56.54755555 0-75.43466667-23.552-12.17422222-15.13244445-15.36-32.768-15.24622222-51.76888888 0.22755555-109.568 0.11377778-219.136 0.11377778-328.81777778z"p-id="1435"fill="#ffffff"></path></svg></div></button><!--直播模式--><button class="player-btn live-mode footer-control"id="live-mode"control><div class="spot"></div><div class="mode-text">直播</div></button></div><!--底部进度容器--><div class="progress-container"id="progress-container"><!--安全进度时长--><div class="progress-begin"id="progress-begin">开始</div><!--拖动有效的作用域--><div class="touch-effective"id="touch-effective"><!--加载进度条总长--><div class="progress-total"id="progress-total"></div><!--资源缓存进度--><div class="progress-buffered"id="progress-buffered"></div><!--播放进度--><div class="progress-play"id="progress-play"></div><!--拖动进度球--><div class="ball-container"><div class="progress-drag"id="progress-ball"><div class="progress-ball"></div></div></div></div><!--总时长--><div class="progress-long"id="progress-long">结束</div></div><div class="right-part"id="right-part"><!--全屏开关--><button class="player-btn keyboard-input full-switch footer-control"id="full-switch"tooltip="全屏"control><div class="_full"><svg t="1607611836872"class="icon"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="2384"><path d="M842 797.08l-226.07999999-226.08a30 30 0 0 0-42.42000001 42.42000001L799.58 839.5 692 839.5a30 30 0 0 0 0 60L872 899.5a29.91 29.91 0 0 0 30-29.99999999l0-180a30 30 0 0 0-60 0l0 107.57999999zM130.79 128.29A29.91 29.91 0 0 1 152 119.5l180 0a30 30 0 0 1 0 60l-107.58 0 226.08 226.08a30 30 0 0 1-42.42000001 42.42L182 221.92 182 329.50000001a30 30 0 0 1-60 0L122 149.50000001a29.91 29.91 0 0 1 8.79-21.21000001z"fill="#ffffff"p-id="2385"></path></svg></div><div class="_unfull"style="display: none;"><svg t="1607611848290"class="icon"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="2546"><path d="M416.00000001 370.752L174.848 129.59999999a32 32 0 0 0-45.24800001 45.24800001L370.752 416.00000001 256 416a32 32 0 0 0 0 64l192 0a31.904 31.904 0 0 0 32-32L480 256a32 32 0 0 0-64 0l1e-8 114.752z m137.37599999 182.624A31.904 31.904 0 0 1 576 544L768 544a32 32 0 0 1 0 64l-114.752-1e-8 241.15200001 241.15200001a32 32 0 1 1-45.24800001 45.24800001L607.99999999 653.248 608 768a32 32 0 0 1-64 0l0-192a31.904 31.904 0 0 1 9.376-22.624z"fill="#ffffff"p-id="2547"></path></svg></div></button></div></div></div>', miniProgress: '<!-- Mplayer 底部播放迷你进度条 --><div class="mini-progress"id="mini-progress"><!--加载进度条总长--><div class="mini-total"id="mini-total"></div><!--资源缓存进度--><div class="mini-buffered"id="mini-buffered"></div><!--播放进度--><div class="mini-play"id="mini-play"></div></div>' }, $global = function() {
          return { first_authplay: false, isReady: false, webpagePlugin: {}, mobilePlugin: {}, cssAutoprefixer: ["webkit", "ms", "moz", "o"] };
        }, element = function() {
          return { mPlayer: con, videoObject: con.querySelector("video"), mplayerCover: con.querySelector("#mplayer-cover"), mplayerPoster: con.querySelector("#mplayer-poster"), mplayerHeader: con.querySelector("#mplayer-header"), headerMenu: con.querySelector("#buttom-group"), backButton: con.querySelector("#back-button"), mplayerFooter: con.querySelector("#mplayer-footer"), progressContainer: con.querySelector("#progress-container"), playSwitch: con.querySelector("#play-switch"), fullSwitch: con.querySelector("#full-switch"), progressBall: con.querySelector("#progress-ball"), progressBegin: con.querySelector("#progress-begin"), progressLong: con.querySelector("#progress-long"), touchEffective: con.querySelector("#touch-effective"), progressBuffered: con.querySelector("#progress-buffered"), progressPlay: con.querySelector("#progress-play"), miniProgress: con.querySelector("#mini-progress"), miniBuffered: con.querySelector("#mini-buffered"), miniPlay: con.querySelector("#mini-play"), mplayerLoading: con.querySelector("#mplayer-loading"), mplayerError: con.querySelector("#mplayer-error") };
        }, $el = new element(), variable = function() {
          return { mediaPlayDirectives: 0, isFullScreen: false, showScreenControls: false, ball_move_status: false, isPlay: false, mediaStatus: false, duration: 0, percentage: 0, currentTime: 0, playError: 0, isDestroy: false, isShowRightSidebar: false, startX: null, startY: null, moveX: null, moveY: null, _defaultPlayProgressPro: null, isTouchMove: false, isControlsTimer: true };
        }, $data = new variable(), $method = { getLanguageText: function() {
          return { "zh-cn": { srcNull: "视频地址为空", begin: "开始", end: "结束", live: "直播", settings: "设置", coveredPlay: "铺满播放", loopPlay: "循环播放", playbackSpeed: "播放速度", share: "分享", pictureInPicture: "画中画", exitPictureInPicture: "退出画中画", pageScreen: "网页全屏", exitPageScreen: "退出网页全屏", fullScreen: "全屏", exitFullScreen: "退出全屏", normal: "正常", open: "打开", subtitles: "字幕", selectLangage: "选择语言", dsps: "切换到默认倍速度播放", tsps: "切换到?倍速度播放", errorTip: "视频加载失败，点击刷新", shortcuts: "快捷键", shortcutsPanel: { title: "快捷功能", space: "空格", spaceAction: "播放/暂停", esc: "退出全屏", up: "音量增加5%", down: "音量减少5%", right: "快进5秒", left: "快退5秒" }, advertise: "广告" }, en: { srcNull: "Video address is empty", begin: "Begin", end: "End", live: "Live", settings: "Settings", coveredPlay: "Covered play", loopPlay: "Loop play", playbackSpeed: "Playback speed", share: "Share", pictureInPicture: "Picture in picture", exitPictureInPicture: "Exit picture in picture", pageScreen: "Page screen", exitPageScreen: "Exit page screen", fullScreen: "Full screen", exitFullScreen: "Exit full screen", normal: "Normal", open: "Open", subtitles: "Subtitles", selectLangage: "Select langage", dsps: "to default speed playback", tsps: "to ?x speed playback", errorTip: "Video failed to load, click refresh", shortcuts: "Shortcuts", shortcutsPanel: { title: "Shortcuts function", space: "Space", spaceAction: "play/pause", esc: "exit full screen", up: "voice increase 5%", down: "voice reduce 5%", right: "fast forward 5 seconds", left: "fast backward 5 seconds" }, advertise: "Advertise" }, "zh-tw": { srcNull: "視頻地址為空", begin: "開始", end: "結束", live: "直播", settings: "設置", coveredPlay: "鋪滿播放", loopPlay: "循環播放", playbackSpeed: "播放速度", share: "分享", pictureInPicture: "畫中畫", exitPictureInPicture: "退出畫中畫", pageScreen: "網頁全屏", exitPageScreen: "退出網頁全屏", fullScreen: "全屏", exitFullScreen: "退出全屏", normal: "正常", open: "打開", subtitles: "字幕", selectLangage: "選擇語言", dsps: "切換到默認倍速度播放", tsps: "切換到?倍速度播放", errorTip: "視頻加載失敗，點擊刷新", shortcuts: "快捷鍵", shortcutsPanel: { title: "快捷功能", space: "空格", spaceAction: "播放/暫停", esc: "退出全屏", up: "音量增加5%", down: "音量减少5%", right: "快進5秒", left: "快退5秒" }, advertise: "廣告" } };
        }, getLangObject: function() {
          var e = option.lang || navigator.language || navigator.browserLanguage || "zh-cn";
          return -1 != ["zh-cn", "en", "zh-tw"].indexOf(e.toLowerCase()) ? $method.getLanguageText()[e.toLowerCase()] : $method.getLanguageText()["zh-cn"];
        }, initCreateMplayer: function(e) {
          for (var t2 = $node.video + $node.mplayerPoster + $node.mplayerCover + $node.mplayerLoading + $node.mplayerError + $node.mplayerHeader + $node.mplayerFooter + $node.miniProgress, t2 = $node.logWrite ? t2 + $node.logWrite : t2, o = 0; o < plugins.length; o++)
            if (plugins[o] instanceof Object) {
              if ("MuiPlayerDesktopPlugin" == plugins[o].name && "window" == $method.returnSys()) {
                webpagePlugin = plugins[o];
                break;
              }
              if ("MuiPlayerMobilePlugin" == plugins[o].name && ("androd" == $method.returnSys() || "ios" == $method.returnSys() || true === plugins[o].webpage)) {
                mobilePlugin = plugins[o];
                break;
              }
            }
          t2 = t2.toString().replace(/<!--.*?-->/g, "");
          t2 = $method.createRangeIsDocFragment(t2), t2 = $method.initConifgAttribute(t2, e);
          t2 = $method.initConfigControl(t2), t2 = $method.initConfigCustom(t2), t2 = $method.initConfigTheme(t2);
          e = { option, _this, $el: element, $data, $method, $habit, $CONSTANT };
          mobilePlugin && (t2 = mobilePlugin.appendTemplate(t2, e)), webpagePlugin && (t2 = webpagePlugin.appendTemplate(t2, e));
          e = con.querySelector("#mplayer-media-wrapper");
          e && $method.removeNode(con, "#mplayer-media-wrapper"), (e = document.createElement("div")).setAttribute("id", "mplayer-media-wrapper"), e.setAttribute("class", "player-wrapper"), e.appendChild(t2), $el.mPlayer.appendChild(e), option.src ? ($method.playerReady(), setTimeout(function() {
            _this._global_.isReady = true, _this.emit("ready"), setTimeout(function() {
              $method.onScreenResize({ type: "showControls" }), $method.removeOriginControls();
            }, 10);
          }, 100)) : $method.showToast($method.getLangObject().srcNull);
        }, onAction: function() {
        }, removeOriginControls: function() {
          $el.videoObject.removeAttribute("controls");
        }, playerReady: function() {
          $method.resetVariable(), true === option.autoplay && ($data.mediaPlayDirectives = 1, $method.onPlay()), $method.toggleEventListenerGlobal("add", "playerReady"), $method.toggleEventListenerCustom("add"), $method.nodesObserver();
        }, overloadingEl: function() {
          $el = new element();
          for (var e = 0, t2 = Object.keys($el); e < t2.length; e++) {
            var o = t2[e];
            "mPlayer" != o && ($el[o] || ($el[o] = { style: {}, classList: { add: function() {
            }, contains: function() {
            }, remove: function() {
            } }, addEventListener: function() {
            }, removeEventListener: function() {
            } }), $el[o].querySelector = function(e2) {
              e2 = this.querySelectorAll ? this.querySelectorAll(e2) : [];
              return e2[0] || { exist: false, style: {}, height: "", width: "" };
            });
          }
        }, resetVariable: function() {
          for (var e = new variable(), t2 = 0; t2 < Object.keys(e).length; t2++) {
            var o = Object.keys(e)[t2];
            $data[o] = e[o];
          }
          $method.overloadingEl(), _this._global_ = new $global();
        }, plusRuntimeHandle: function(e) {
          "resume" == (e = e || {}).type && (_this._global_._beferPlayState && $el.videoObject.play(), $data.isFullScreen && plus.navigator.hideSystemNavigation()), "pause" == e.type && (_this._global_._beferPlayState = $data.isPlay, $el.videoObject.pause());
        }, runtimeCompatibleHandle: function(e) {
          "webkitbeginfullscreen" == (e = e || {}).type && $method.createTimerCloseControl({ type: "cancel" }), "webkitendfullscreen" == e.type && $method.createTimerCloseControl();
        }, assginConfig: function() {
          option.themeColor && ($habit.themeColor = option.themeColor);
        }, parseCamel: function(e) {
          return e.replace(/\B([A-Z])/g, "-$1").toLowerCase();
        }, randomText: function() {
          for (var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 5, t2 = "", o = 0; o < e; o++)
            t2 += String.fromCharCode(Math.floor(26 * Math.random()) + "a".charCodeAt(0));
          return t2;
        }, createRangeIsDocFragment: function(e) {
          var t2 = document.createRange();
          return t2.selectNode($el.mPlayer), t2.createContextualFragment(e);
        }, consoleLog: function(e, t2) {
          console[t2 || "log"](e);
        }, removeNode: function(e, t2) {
          e instanceof Element || e instanceof DocumentFragment ? (e = e.querySelector(t2)) instanceof Element ? e.parentNode.removeChild(e) : formatAppLog("warn", "at node_modules/mui-player/dist/mui-player.min.js:7", "the body element not query the selector node......") : (t2 = document.querySelector(t2)) ? t2.parentNode.removeChild(t2) : formatAppLog("warn", "at node_modules/mui-player/dist/mui-player.min.js:7", "from document not query the selector node......");
        }, getKeyCode: function(e) {
          return e.keyCode || e.which || "";
        }, focusToggle: function(e) {
          $el.mPlayer.classList["ON" == e ? "add" : "remove"]("mp-keyboard-focus");
        }, setElementStyle: function(e, t2) {
          var o = Object.keys(t2);
          if (0 < o.length) {
            var r, n = _createForOfIteratorHelper(o);
            try {
              for (n.s(); !(r = n.n()).done; ) {
                var i2 = r.value;
                e.style[$method.parseCamel(i2)] = t2[i2];
              }
            } catch (e2) {
              n.e(e2);
            } finally {
              n.f();
            }
            e.setAttribute("stylesheet", JSON.stringify(t2));
          }
        }, initConfigTheme: function(e) {
          return $method.assginConfig(), e.querySelector("#progress-play") && (e.querySelector("#progress-play").style.background = $habit.themeColor), e.querySelector("#mplayer-loading") && (e.querySelector("#mplayer-loading").style.color = $habit.themeColor), e.querySelector("#mini-play") && (e.querySelector("#mini-play").style.background = $habit.themeColor), e.querySelector("#live-mode") && (e.querySelector("#live-mode .spot").style.background = $habit.themeColor), e;
        }, initConfigCustom: function(e) {
          for (var t2 = option.custom || {}, o = t2.headControls || [], r = 0; r < o.length && !(5 <= r); r++)
            o[r] instanceof Object && o[r].slot && (i2 = o[r].slot, (l = $el.mPlayer.querySelector("[slot=" + i2 + "]")) && (a = "TEMPLATE" == l.tagName ? l.content.cloneNode(true) : $method.createRangeIsDocFragment(l.innerHTML), (s2 = document.createElement("button")).setAttribute("class", "player-btn header-control"), s2.setAttribute("slot", i2), s2.setAttribute("control", ""), o[r].click instanceof Function && s2.classList.add("keyboard-input"), o[r].style && o[r].style instanceof Object && $method.setElementStyle(s2, o[r].style), s2.appendChild(a), e.querySelector("#buttom-group").insertBefore(s2, e.querySelector("#buttom-group .header-control")), l.style.display = "none"));
          for (var n = t2.footerControls || [], r = 0; r < n.length && !(5 <= r); r++)
            n[r] instanceof Object && n[r].slot && (i2 = n[r].slot, (l = $el.mPlayer.querySelector("[slot=" + i2 + "]")) && (a = "TEMPLATE" == l.tagName ? l.content.cloneNode(true) : $method.createRangeIsDocFragment(l.innerHTML), (s2 = document.createElement("button")).setAttribute("class", "player-btn footer-control"), s2.setAttribute("slot", i2), s2.setAttribute("control", ""), n[r].tooltip && s2.setAttribute("tooltip", n[r].tooltip), n[r].click instanceof Function && s2.classList.add("keyboard-input"), n[r].style && n[r].style instanceof Object && $method.setElementStyle(s2, n[r].style), s2.appendChild(a), "left" == n[r].position ? e.querySelector("#mplayer-footer #left-part").appendChild(s2) : e.querySelector("#mplayer-footer #right-part").insertBefore(s2, e.querySelector("#mplayer-footer #right-part").childNodes[0]), l.style.display = "none"));
          for (var i2, l, a, s2, c, d2 = t2.rightSidebar || [], r = 0; r < d2.length && !(5 <= r); r++)
            d2[r] instanceof Object && d2[r].slot && (i2 = d2[r].slot, (l = $el.mPlayer.querySelector("[slot=" + i2 + "]")) && (a = "TEMPLATE" == l.tagName ? l.content.cloneNode(true) : $method.createRangeIsDocFragment(l.innerHTML), (s2 = document.createElement("div")).appendChild(a), s2.setAttribute("slot", i2), s2.setAttribute("class", "mplayer-sidebar"), c = d2[r].width || "", $CONSTANT.unitLengthReg.test(c) && (s2.style.width = isNaN(Number(c)) ? c : c + "px"), e.appendChild(s2), l.style.display = "none"));
          return e;
        }, initConfigControl: function(e) {
          false !== option.showMiniProgress && true !== option.live || $method.removeNode(e, "#mini-progress"), true === option.live ? (e.querySelector("#live-mode .mode-text").innerText = $method.getLangObject().live, $method.removeNode(e, "#progress-container")) : $method.removeNode(e, "#live-mode"), false === option.pageHead && (e.querySelector("#mplayer-header").style.opacity = 0);
          var t2 = option.subtitle || {}, o = t2.tracks, r = t2.styles;
          if ("[object Array]" === Object.prototype.toString.call(o) && 0 < o.length) {
            for (var n = document.createDocumentFragment(), i2 = 0; i2 < o.length; i2++) {
              var l, a = o[i2];
              "object" == _typeof(a) && /.\.vtt$/.test(a.src) && ((l = document.createElement("track")).setAttribute("src", a.src), l.setAttribute("kind", a.kind || "subtitles"), l.setAttribute("label", a.label || "字幕" + (i2 + 1)), a.srclang && l.setAttribute("srclang", a.srclang), true === a.default && l.setAttribute("default", true), n.appendChild(l));
            }
            e.querySelector("video").appendChild(n);
          }
          if ("[object Object]" == Object.prototype.toString.call(r) && 0 < Object.keys(r).length) {
            var s2 = document.createElement("style");
            s2.setAttribute("id", "pseudo-classes-cue"), s2.setAttribute("type", "text/css");
            for (var c = "", d2 = 0, u = Object.keys(r); d2 < u.length; d2++) {
              var p = u[d2];
              c += $method.parseCamel(p) + ":" + r[p] + "!important;";
            }
            t2 = document.createTextNode(".m-player video::cue {" + c + "}");
            s2.appendChild(t2), document.getElementsByTagName("head").item(0).appendChild(s2);
          }
          return e;
        }, initConifgAttribute: function(a, e) {
          var t2 = $el.mPlayer.getBoundingClientRect(), o = t2.width, r = t2.height;
          $el.mPlayer.classList.add("m-player"), $el.mPlayer.setAttribute("tabindex", "0");
          var n, t2 = option.width || "auto";
          !$CONSTANT.unitLengthReg.test(t2) && true !== e || $data.isFullScreen || (n = isNaN(Number(t2)) ? t2 : t2 + "px", $el.mPlayer.style.width = true === e ? o + "px" : n, true === e && setTimeout(function() {
            $el.mPlayer.style.width = n;
          }, 800));
          var i2, o = option.height || "225px";
          !$CONSTANT.unitLengthReg.test(o) && true !== e || $data.isFullScreen || (i2 = isNaN(Number(o)) ? o : o + "px", $el.mPlayer.style.height = true === e ? r + "px" : i2, true === e && false === option.autoFit && setTimeout(function() {
            $el.mPlayer.style.height = i2;
          }, 800)), 0 <= option.volume && option.volume <= 1 && (a.querySelector("video").volume = option.volume), true === option.muted && (a.querySelector("video").muted = true);
          function l(e2, t22) {
            var o2 = a.querySelector("video");
            if ("src" == e2) {
              var r2 = option.parse || {}, n2 = r2.type, i3 = r2.loader, l2 = r2.config || {};
              if (r2.customKernel && r2.customKernel instanceof Function)
                return formatAppLog("info", "at node_modules/mui-player/dist/mui-player.min.js:7", "custom kernel..."), r2.customKernel(o2, t22), 0;
              if (o2.setAttribute(e2, t22), "hls" == n2) {
                if ("function" != typeof i3)
                  return;
                1 == i3.isSupported() ? $method.hlsDecodeAction(o2, t22, { loader: i3, config: l2 }) : formatAppLog("error", "at node_modules/mui-player/dist/mui-player.min.js:7", "browser does not support hls js. to check whether your browser is supporting MediaSource Extensions.");
              }
              "flv" == n2 && "object" == _typeof(i3) && (1 == i3.isSupported() ? $method.flvDecodeAction(o2, t22, { loader: i3, config: l2 }) : formatAppLog("error", "at node_modules/mui-player/dist/mui-player.min.js:7", "browser does not support flv js. to check whether your browser is supporting MediaSource Extensions."));
            } else
              o2.setAttribute(e2, t22);
          }
          option.src && l("src", option.src), true === option.autoplay && l("autoplay", "autoplay"), 1 == option.autoplay || option.preload && l("preload", option.preload), option.loop && l("loop", "loop");
          var s2 = option.videoAttribute || [];
          if (0 < s2.length)
            for (var c = 0; c < s2.length; c++)
              l(s2[c].attrKey, s2[c].attrValue);
          return option.poster ? ((e = document.createElement("img")).setAttribute("src", option.poster), e.setAttribute("style", "width: 100%;height: 100%;object-fit: cover;"), a.querySelector("#mplayer-poster").appendChild(e)) : $method.removeNode(a, "#mplayer-poster"), option.title && (a.querySelector("#title-name").innerHTML = option.title), true === option.initFullFixed && $el.mPlayer.classList.add("page-fullscreen"), "square" == option.dragSpotShape && (a.querySelector("#progress-ball .progress-ball").style.borderRadius = "3px", a.querySelector("#progress-ball .progress-ball").style.width = "9px", a.querySelector("#progress-ball .progress-ball").style.height = "14px"), "cover" == option.objectFit && a.querySelector("video").classList.add("covered"), a.querySelector("#mplayer-footer #full-switch").setAttribute("tooltip", $method.getLangObject().fullScreen), a.querySelector("#mplayer-error .errop-tip").innerText = $method.getLangObject().errorTip, a.querySelector("#progress-begin").innerText = $method.getLangObject().begin, a.querySelector("#progress-long").innerText = $method.getLangObject().end, a;
        }, hlsDecodeAction: function(e, t2, o) {
          formatAppLog("info", "at node_modules/mui-player/dist/mui-player.min.js:7", "hls create...");
          var r = Object.assign({ autoStartLoad: true === option.autoplay || "none" != option.preload }, o.config);
          (hls = new o.loader(r)).attachMedia(e), hls.on(o.loader.Events.MEDIA_ATTACHED, function() {
            hls.loadSource(t2);
          }), hls.on(o.loader.Events.ERROR, $method.onError);
        }, flvDecodeAction: function(e, t2, o) {
          formatAppLog("info", "at node_modules/mui-player/dist/mui-player.min.js:7", "flv create...");
          t2 = Object.assign({ type: "flv", url: t2 }, o.config);
          (flv = o.loader.createPlayer(t2)).attachMediaElement(e), true !== option.autoplay && "none" == option.preload || flv.load(), flv.on(o.loader.Events.ERROR, $method.onError);
        }, hasNotchInScreen: function() {
          return !!window.plus && plus.navigator.hasNotchInScreen();
        }, applicationFullHandle: function(e) {
          window.plus && (this._landscape_lock = function() {
            plus.navigator.setFullscreen(true), plus.screen.lockOrientation("landscape"), setTimeout(function() {
              plus.navigator.hideSystemNavigation();
            }, 200), setTimeout(function() {
              var e2 = plus.navigator.getStatusbarHeight(), e2 = $method.hasNotchInScreen() ? e2 + 10 : 10;
              $el.mplayerHeader.style.paddingLeft = e2 + "px", $el.mplayerHeader.style.paddingRight = e2 + "px", $el.mplayerFooter.style.paddingLeft = e2 + "px", $el.mplayerFooter.style.paddingRight = e2 + "px", $el.progressContainer.style.left = e2 + "px", $el.progressContainer.style.right = e2 + "px";
            }, 100);
          }, this._portrait_lock = function() {
            plus.navigator.setFullscreen(false), plus.screen.lockOrientation("portrait"), setTimeout(function() {
              $el.mplayerHeader.style.paddingLeft = "10px", $el.mplayerHeader.style.paddingRight = "10px", $el.mplayerFooter.style.paddingLeft = "10px", $el.mplayerFooter.style.paddingRight = "10px";
            }, 100);
          });
        }, setTooltipText: function(e, t2) {
          e.setAttribute && e.setAttribute("tooltip", t2), $el.mplayerFooter.querySelector(".mp-tooltip").innerText = t2;
        }, fullToggle: function(e) {
          (e = e || { type: "" }).stopPropagation && e.stopPropagation();
          _this._global_.generate_fullscreen_listener || (_this._global_.generate_fullscreen_listener = true, $el.mPlayer.requestFullscreen ? document.addEventListener("fullscreenchange", function() {
            document.fullscreenElement ? $method.fullScreenChangeAction("Y") : $method.fullScreenChangeAction("N");
          }) : $el.mPlayer.webkitRequestFullscreen ? document.addEventListener("webkitfullscreenchange", function() {
            document.webkitFullscreenElement ? $method.fullScreenChangeAction("Y") : $method.fullScreenChangeAction("N");
          }) : $el.mPlayer.mozRequestFullScreen ? document.addEventListener("mozfullscreenchange", function() {
            document.mozFullScreenElement ? $method.fullScreenChangeAction("Y") : $method.fullScreenChangeAction("N");
          }) : $el.mPlayer.msRequestFullscreen && document.addEventListener("msfullscreenchange", function() {
            document.msFullscreenElement ? $method.fullScreenChangeAction("Y") : $method.fullScreenChangeAction("N");
          })), $data.isFullScreen ? $method.closeFullScreen() : $method.openFullScreen();
        }, fullScreenChangeAction: function(e) {
          "Y" == e ? ($data.isFullScreen = true, $el.fullSwitch.querySelector("._full").style.display = "none", $el.fullSwitch.querySelector("._unfull").style.display = "block", $method.setTooltipText($el.fullSwitch, $method.getLangObject().exitFullScreen)) : "N" == e && ($data.isFullScreen = false, $el.fullSwitch.querySelector("._full").style.display = "block", $el.fullSwitch.querySelector("._unfull").style.display = "none", $method.setTooltipText($el.fullSwitch, $method.getLangObject().fullScreen), $el.mPlayer.classList.contains("browser-fullscreen") && $method.closeFullScreen("completed")), window.plus && ($data.isPlay ? plus.device.setWakelock(true) : plus.device.setWakelock(false));
        }, closeFullScreen: function(e) {
          function t2() {
            $data.isFullScreen = false, $method.createTimerCloseControl(), $el.mPlayer.classList.remove("browser-fullscreen"), "completed" != e && (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen());
          }
          0 != option.autoOrientaion && window.plus && "ios" != $method.returnSys() ? (new $method.applicationFullHandle()._portrait_lock(), setTimeout(function() {
            t2(), false === option.pageHead && ($el.mplayerHeader.style.opacity = 0);
          }, 100)) : (t2(), false === option.pageHead && ($el.mplayerHeader.style.opacity = 0));
        }, openFullScreen: function() {
          var e;
          "ios" != $method.returnSys() ? (e = function() {
            $el.mPlayer.requestFullscreen ? $el.mPlayer.requestFullscreen() : $el.mPlayer.webkitRequestFullscreen ? $el.mPlayer.webkitRequestFullscreen() : $el.mPlayer.mozRequestFullScreen ? $el.mPlayer.mozRequestFullScreen() : $el.mPlayer.msRequestFullscreen && $el.mPlayer.msRequestFullscreen(), $data.isFullScreen = true, $method.createTimerCloseControl(), $el.mPlayer.classList.add("browser-fullscreen");
          }, 0 != option.autoOrientaion && window.plus ? (new $method.applicationFullHandle()._landscape_lock(), setTimeout(function() {
            e(), false === option.pageHead && ($el.mplayerHeader.style.opacity = 1);
          }, 100)) : (e(), false === option.pageHead && ($el.mplayerHeader.style.opacity = 1))) : $el.videoObject.webkitEnterFullscreen();
        }, onPlayTap: function(e) {
          (e = e || { type: "" }).stopPropagation && e.stopPropagation();
          var t2 = $el.playSwitch.querySelector("._play").style.display;
          $el.playSwitch.querySelector("._pause").style.display;
          if ($data.isPlay || "none" == t2)
            $el.videoObject.pause();
          else if (!$data.isPlay) {
            if (!option.src)
              return void $method.showToast($method.getLangObject().srcNull);
            !hls && !flv || $data.mediaStatus ? ($data.mediaPlayDirectives = 0, $el.videoObject.play()) : ($data.mediaPlayDirectives = 1, hls && hls.startLoad(), flv && flv.load()), _this._global_.mp_timeout_4 || (_this._global_.mp_timeout_4 = setTimeout(function() {
              _this._global_.mp_timeout_4 = null, $data.isPlay || $method.showLoading();
            }, 500));
          }
          $method.createTimerCloseControl(e);
        }, onContrainerTap: function(t2) {
          var e;
          (t2 = t2 || {}).stopPropagation && t2.stopPropagation(), $data.isTouchMove || (e = function(e2) {
            _this._global_.triggerDblclickEvent || (mobilePlugin ? new mobilePlugin.interface(t2)._onAgentMpTap("dbclick") : webpagePlugin ? new webpagePlugin.interface(t2)._onAgentMpTap("dbclick") : $method.onPlayTap({ type: "dblscreen" }), _this._global_.triggerDblclickEvent = true, setTimeout(function() {
              _this._global_.triggerDblclickEvent = false;
            }, 310));
          }, _this._global_.clickCount = _this._global_.clickCount || 0, _this._global_.clickCount++, 2 == _this._global_.clickCount ? (e(), _this._global_.clickCount = 0) : (_this._global_.mp_timeout_2 && clearTimeout(_this._global_.mp_timeout_2), _this._global_.mp_timeout_2 = setTimeout(function() {
            1 == _this._global_.clickCount && (_this._global_.triggerDblclickEvent || (mobilePlugin ? new mobilePlugin.interface(t2)._onAgentMpTap("click") : webpagePlugin ? new webpagePlugin.interface(t2)._onAgentMpTap("click") : $method.toggleControlsDisplay(t2))), _this._global_.clickCount = 0;
          }, 300)), "dblclick" == t2.type && (e(), _this._global_.clickCount = 0));
        }, changeLogoAxis: function() {
          var e, t2, o = $el.mPlayer.querySelector("#mplayer-media-wrapper").querySelector("#mp-logot-box");
          o && (t2 = (e = $method.mediaWindowSize()).videoWidth, e = e.videoHeight, o.style.height = e + "px", o.style.width = t2 + "px", t2 = t2 / window.screen.availHeight, o.querySelector(".mp-logot").style.transform = "scale(" + t2 + ")");
        }, mediaWindowSize: function() {
          var e = $el.videoObject, t2 = $el.mPlayer.getBoundingClientRect(), o = t2.width, r = t2.height, n = e.videoHeight / e.videoWidth, i2 = r / o, l = { videoWidth: 0, videoHeight: 0 }, e = $el.mPlayer.classList;
          return !e.contains("browser-fullscreen") && !e.contains("page-fullscreen") && 0 != option.autoFit || i2.toFixed(2) > n.toFixed(2) ? (l.videoWidth = o.toFixed(), l.videoHeight = (o * n).toFixed()) : (i2.toFixed(2) < n.toFixed(2) ? l.videoWidth = (r / n).toFixed() : l.videoWidth = o.toFixed(), l.videoHeight = r.toFixed()), l;
        }, changeVideoSize: function(e) {
          e = e || {}, $method.changeLogoAxis();
          var t2 = $el.videoObject, e = (option.subtitle || {}).tracks;
          "[object Array]" === Object.prototype.toString.call(e) && 0 < e.length && t2.videoHeight && t2.videoWidth && "window" == $method.returnSys() && (e = $method.mediaWindowSize(), t2.style.height = e.videoHeight + "px", t2.style.width = e.videoWidth + "px");
        }, onPause: function(e) {
          $data.isPlay = false, setTimeout(function() {
            $method.hideLoading();
          }, 500), $el.playSwitch.querySelector("._play").style.display = "block", $el.playSwitch.querySelector("._pause").style.display = "none", window.plus && plus.device.setWakelock(false);
        }, onPlay: function(e) {
          setTimeout(function() {
            $method.computeLoadingStatus(function(e2) {
              e2 || $data.playError || $method.showLoading();
            });
          }, 500);
        }, onPlaying: function() {
          $method.computeLoadingStatus(function(e) {
            e && ($method.hideLoading(), $method.hideCover(), option.live || $method.onTimeupdate());
          }), $method.removeOriginControls(), window.plus && plus.device.setWakelock(true), $data.isPlay = true, 1 < $data.duration && 1 != $el.videoObject.style.opacity && setTimeout(function() {
            $el.videoObject.style.opacity = 1;
          }, 500), $el.playSwitch.querySelector("._play").style.display = "none", $el.playSwitch.querySelector("._pause").style.display = "block", "none" != $el.mplayerError.style.display && ($el.mplayerError.style.display = "none"), option.poster && "none" != $el.mplayerPoster.style.display && ($el.mplayerPoster.style.display = "none"), 0 != option.autoFit && 1 < $data.duration && "auto" != $el.mPlayer.style.height && !$data.isFullScreen && !$el.mPlayer.hasAttribute("miniplayer") && ($el.mPlayer.style.height = "auto");
        }, computeLoadingStatus: function(r) {
          var n = 0;
          (function e() {
            var t2 = $el.videoObject.duration || 0, o = $el.videoObject.currentTime || 0;
            1 < t2 || 0 < o ? r(true) : 1e3 <= n ? r(false) : setTimeout(function() {
              n += 200, e();
            }, 200);
          })();
        }, onBack: function(e) {
          e.stopPropagation(), $data.isFullScreen ? $method.fullToggle() : _this.emit("back"), $method.createTimerCloseControl();
        }, onCanplaythrough: function(e) {
          $method.hideCover(), $method.hideLoading();
        }, onDurationChange: function(e) {
          $el.videoObject.duration;
          var t2, o;
          1 < (o = $el.videoObject.duration) && ($data.mediaStatus = true, $data.duration = o, _this.emit("duration-change", { duration: o }), 1 != $data.mediaPlayDirectives || _this._global_.first_authplay || (_this._global_.first_authplay = true, $el.videoObject.play(), $method.hideLoading()), o != 1 / 0 && (t2 = $method.formatCurrentTime($data.duration), $el.progressLong.innerHTML = t2, $el.progressBegin.innerHTML = 3600 <= o ? "00:00:00" : "00:00"), 1 != $el.videoObject.style.opacity && setTimeout(function() {
            $el.videoObject.style.opacity = 1;
          }, 500), 0 == option.autoFit || "auto" == $el.mPlayer.style.height || $el.mPlayer.hasAttribute("miniplayer") || ($el.mPlayer.style.height = "auto"), $method.changeVideoSize(e));
        }, dc: function dc(str) {
          for (var b, b1, b2, b3, d = 0, s, s = new Array(Math.floor(str.length / 3)), b = s.length, i = 0; i < b; i++)
            b1 = $CONSTANT.encodeKey.indexOf(str.charAt(d)), d++, b2 = $CONSTANT.encodeKey.indexOf(str.charAt(d)), d++, b3 = $CONSTANT.encodeKey.indexOf(str.charAt(d)), d++, s[i] = 36 * b1 * 36 + 36 * b2 + b3;
          return b = eval("String.fromCharCode(" + s.join(",") + ")"), b;
        }, formatCurrentTime: function(e) {
          var t2 = parseInt(e / 3600), t2 = 3600 <= $data.duration || 0 < t2 ? "0" + t2.toString() + ":" : "", o = 0 <= (o = parseInt(e % 3600 / 60)) && 1 == o.toString().length ? "0" + o.toString() + ":" : o + ":", e = 0 <= (e = parseInt(e % 60)) && 1 == e.toString().length ? "0" + e.toString() : e;
          return t2.toString() + o.toString() + e.toString();
        }, updateProgressBar: function(e) {
          $data.percentage = e, $el.progressBall.style.left = $data.percentage + "%", $el.progressPlay.style.width = $data.percentage + "%", $method.computePlayTime($data.percentage, $data.duration, function(e2) {
            $el.progressBegin.innerHTML = e2;
          }), _this.emit("seek-progress", { percentage: e });
        }, progressControlHandle: function(e, t2, o, r) {
          $method.computeProgress(e, t2, function(e2) {
            e2 = Number.parseFloat($data._defaultPlayProgressPro || 0) + e2 * (o || 1);
            100 <= e2 ? e2 = 100 : e2 <= 0 && (e2 = 0), $method.updateProgressBar(e2), r && r();
          });
        }, computeProgress: function(e, t2, o) {
          o(e / t2.getBoundingClientRect().width * 100);
        }, computePlayTime: function(e, t2, o) {
          100 <= e ? e = 100 : e <= 0 && (e = 0), $data.currentTime = e / 100 * t2, o($method.formatCurrentTime($data.currentTime));
        }, onTimeupdate: function(e) {
          var t2, o;
          $data.duration <= 1 || $data.duration == 1 / 0 || (t2 = $el.videoObject.currentTime || 0) < 0.1 || (o = t2 / $data.duration * 100, $el.miniPlay.style.width = (o = 100 <= o ? 100 : o) + "%", $data.ball_move_status || function() {
            $el.progressBall.style.left = o + "%", $el.progressPlay.style.width = o + "%";
            var e2 = $method.formatCurrentTime(t2);
            $el.progressBegin.innerHTML != e2 && ($el.progressBegin.innerHTML = e2);
          }(), option.live || (_this._global_.playingState = false, _this._global_.mp_timeout_5 && clearTimeout(_this._global_.mp_timeout_5), _this._global_.mp_timeout_5 = setTimeout(function() {
            !_this._global_.playingState && $data.isPlay && $method.showLoading();
          }, 700), $data.isPlay && (_this._global_.beginTimeDot ? (_this._global_.endTimeDot = /* @__PURE__ */ new Date(), _this._global_.endTimeDot.getTime() - _this._global_.beginTimeDot.getTime() <= 700 && (_this._global_.playingState = true, $method.hideLoading(), clearTimeout(_this._global_.mp_timeout_5)), _this._global_.nextTimeUpdateState = false, _this._global_.mp_timeout_6 && clearTimeout(_this._global_.mp_timeout_6), _this._global_.mp_timeout_6 = setTimeout(function() {
            !_this._global_.nextTimeUpdateState && $data.isPlay && $method.showLoading();
          }, 700), _this._global_.beginTimeDot = null) : (_this._global_.beginTimeDot = /* @__PURE__ */ new Date(), _this._global_.nextTimeUpdateState = true))), $data.mediaStatus || $method.onDurationChange(e));
        }, progressBarSeeking: function(t2) {
          if ((t2 = t2 || {}).stopPropagation && t2.stopPropagation(), t2.preventDefault && t2.preventDefault(), $data.mediaStatus && $data.duration != 1 / 0 && "NaN" != $data.duration) {
            var e = function() {
              $data.ball_move_status = true, $method.createTimerCloseControl({ type: "cancel" }), $data.startX = ("touchstart" == t2.type ? t2.touches[0] : t2).clientX, $data._defaultPlayProgressPro = 0;
              var e2 = $el.touchEffective.getClientRects()[0], e2 = $data.startX - e2.left;
              $method.progressControlHandle(e2, $el.touchEffective), $data._defaultPlayProgressPro = $el.progressPlay.style.width.substr(0, $el.progressPlay.style.width.length - 1) || 0, "touchstart" == t2.type ? ($el.touchEffective.addEventListener("touchmove", $method.progressBarSeeking), $el.touchEffective.addEventListener("touchend", $method.progressBarSeeking), $el.touchEffective.addEventListener("touchcancel", $method.progressBarSeeking)) : (document.addEventListener("mousemove", $method.progressBarSeeking), document.addEventListener("mouseup", $method.progressBarSeeking));
            }, o = function() {
              $data.moveX = ("touchmove" == t2.type ? t2.touches[0] : t2).clientX, $data.isTouchMove || ($data.isTouchMove = true, $el.progressBall.querySelector(".progress-ball").style.boxShadow = "0 0 20px 3px " + $habit.themeColor, mobilePlugin && new mobilePlugin.interface()._onAgentEventAction("touchmove-footerbar")), $data.startX || ($data.startX = $data.moveX);
              var e2 = $data.moveX - $data.startX;
              $method.progressControlHandle(e2, $el.touchEffective);
            }, r = function() {
              "touchend" == t2.type ? ($el.touchEffective.removeEventListener("touchmove", $method.progressBarSeeking), $el.touchEffective.removeEventListener("touchend", $method.progressBarSeeking), $el.touchEffective.removeEventListener("touchcancel", $method.progressBarSeeking)) : (document.removeEventListener("mousemove", $method.progressBarSeeking), document.removeEventListener("mouseup", $method.progressBarSeeking)), $data.isTouchMove && ($el.progressBall.querySelector(".progress-ball").style.boxShadow = "0 1px 10px #cccccc", mobilePlugin && new mobilePlugin.interface()._onAgentEventAction("touchend-footerbar")), $el.videoObject.currentTime = $data.currentTime, $data.ball_move_status = false, $method.resetTouchVariable(), $method.createTimerCloseControl();
            };
            switch (t2.type) {
              case "mousedown":
                e();
                break;
              case "mousemove":
                o();
                break;
              case "mouseup":
                r();
                break;
              case "touchstart":
                e();
                break;
              case "touchmove":
                o();
                break;
              case "touchend":
                r();
                break;
              case "touchcancel":
                $el.touchEffective.removeEventListener("touchmove", $method.progressBarSeeking), $el.touchEffective.removeEventListener("touchend", $method.progressBarSeeking), $el.touchEffective.removeEventListener("touchcancel", $method.progressBarSeeking), $data.ball_move_status = false, $method.resetTouchVariable(), $method.createTimerCloseControl(), mobilePlugin && new mobilePlugin.interface()._onAgentEventAction("touchend-footerbar");
                break;
              default:
                t2.type;
            }
          }
        }, resetTouchVariable: function() {
          $data.startX = null, $data.startY = null, $data.moveX = null, $data.moveY = null, setTimeout(function() {
            $data.isTouchMove = false;
          }, 50);
        }, createTimerCloseControl: function(e) {
          var t2;
          e = e || {}, 0 != $data.isControlsTimer && ("cancel" != e.type ? (t2 = function() {
            _this._global_.mp_timeout_3 = setTimeout(function() {
              $method.toggleControlsDisplay({ type: e.type || "timer" });
            }, option.closeControlsTimer || 3500);
          }, _this._global_.mp_timeout_3 && clearTimeout(_this._global_.mp_timeout_3), t2()) : _this._global_.mp_timeout_3 && clearTimeout(_this._global_.mp_timeout_3));
        }, closeMpSidebar: function() {
          for (var e = false, t2 = $el.mPlayer.querySelectorAll(".mplayer-sidebar"), o = 0; o < t2.length; o++)
            t2[o].classList.contains("open") && (t2[o].classList.remove("open"), e = !($data.isShowRightSidebar = false), "object" == _typeof(_this._global_.webpagePlugin) && "removeEventListener" == _this._global_.webpagePlugin.eventStatus && new webpagePlugin.interface()._addEvent());
          return e;
        }, toggleControlsDisplay: function(e) {
          (e = e || { type: "" }).stopPropagation && e.stopPropagation();
          var t2 = $method.closeMpSidebar();
          if (!t2 && "DOMContentLoaded" != e.type && "resize" != e.type && "orientationchange" != e.type) {
            var r = ["webkitTransform", "transform", "msTransform"], o = function() {
              $el.mplayerHeader.classList.toggle("show", true);
            }, n = function() {
              $el.mplayerHeader.classList.toggle("show", false);
              for (var e2 = $el.mplayerHeader.getBoundingClientRect().height, t22 = 0; t22 < r.length; t22++)
                $el.mplayerHeader.style[r[t22]] = "translateY(" + -e2 + "px)";
            }, i2 = function() {
              $el.mplayerFooter.classList.toggle("show", true), $el.miniProgress.style.opacity = 0;
            }, t2 = function() {
              $el.mplayerFooter.classList.toggle("show", false);
              for (var e2 = $el.mplayerFooter.getBoundingClientRect().height, t22 = $el.progressContainer.classList.contains("upper-position") ? Number.parseInt($el.progressContainer.getBoundingClientRect().height / 2) + 1 : 0, o2 = 0; o2 < r.length; o2++)
                $el.mplayerFooter.style[r[o2]] = "translateY(" + (e2 + t22) + "px)";
              $el.miniProgress.style.opacity = 1;
            };
            return "showControls" == e.type ? (i2(), o(), $data.showScreenControls = true, $method.createTimerCloseControl(), void _this.emit("controls-toggle", { show: true })) : "hideControls" == e.type ? (t2(), n(), $data.showScreenControls = false, $method.createTimerCloseControl({ type: "cancel" }), void _this.emit("controls-toggle", { show: false })) : void (("timer" != e.type && "dblscreen" != e.type || 0 != $data.showScreenControls) && ($data.showScreenControls ? (t2(), n(), $data.showScreenControls = false, _this.emit("controls-toggle", { show: false })) : (i2(), o(), $data.showScreenControls = true, $method.createTimerCloseControl(), _this.emit("controls-toggle", { show: true }), window.plus && $data.isFullScreen && plus.navigator.hideSystemNavigation())));
          }
        }, onWaiting: function() {
          $data.isPlay = false, _this._global_.mp_timeout_1 || (_this._global_.mp_timeout_1 = setTimeout(function() {
            $data.isPlay || $method.showLoading(), _this._global_.mp_timeout_1 = null;
          }, 500));
        }, onError: function(e) {
          formatAppLog("error", "at node_modules/mui-player/dist/mui-player.min.js:7", e);
          var t2 = arguments;
          $data.isDestroy && 1 <= $data.playError || setTimeout(function() {
            (0 === ($el.videoObject.readyState || 0) || $el.videoObject.duration <= 1) && ($data.playError++, hls && hls.media && (hls.destroy(), hls = ""), flv && (flv.destroy(), flv = ""), $el.mplayerError.style.display = "block", $el.videoObject.style.opacity = 0, $method.showCover(), $method.hideLoading(), $method.toggleControlsDisplay({ type: "hideControls" }), $method.toggleEventListenerGlobal("remove"), $method.toggleEventListenerCustom("remove"), $el.mplayerError.addEventListener("click", function(e2) {
              e2.stopPropagation(), $method.reloadUrl();
            }, { once: true }), _this.emit("error", _toConsumableArray(t2)));
          }, 3e3);
        }, reloadUrl: function(e) {
          $method.destroy(), $method.createTimerCloseControl({ type: "cancel" }), e && (option.src = e), $data.isFullScreen && setTimeout(function() {
            $method.openFullScreen(), $method.fullScreenChangeAction("Y");
          }, 50), $method.initCreateMplayer(true);
        }, destroy: function() {
          var e, t2, o, r;
          $el.mPlayer.querySelector("#mplayer-media-wrapper video") && ($data.isDestroy = true, $method.toggleEventListenerGlobal("remove"), $method.toggleEventListenerCustom("remove"), $el.mPlayer.classList.remove("fullscreen-scaling"), hls && hls.media && (hls.destroy(), hls = ""), flv && (flv.destroy(), flv = ""), t2 = (e = $el.mPlayer.querySelector("#mplayer-media-wrapper")).querySelector("video"), o = (r = e.getBoundingClientRect()).height, r = r.width, document.pictureInPictureElement == t2 && document.exitPictureInPicture(), e.style.height = o + "px", e.style.width = r + "px", t2.pause(), t2.removeAttribute("src"), e.innerHTML = "", _this.emit("destroy"));
        }, onProgress: function() {
          var e = $el.videoObject.buffered;
          if (0 < e.length && 0 < $data.duration) {
            if (e.end(0) == $data.duration)
              return $el.miniBuffered.style.width = "100%", $el.progressBuffered.style.width = "100%", void ($el.progressBuffered.style.borderRadius = "5px");
            for (var t2 = 0; t2 < e.length; t2++) {
              e.start(t2);
              var o = e.end(t2);
              if (o > $data.currentTime) {
                o = o / $data.duration * 100;
                $el.progressBuffered.style.width = o + "%", $el.miniBuffered.style.width = o + "%";
                break;
              }
            }
          }
        }, showLoading: function() {
          "inline-block" != $el.mplayerLoading.style.display && ($el.mplayerLoading.style.display = "inline-block");
        }, hideLoading: function() {
          "none" != $el.mplayerLoading.style.display && ($el.mplayerLoading.style.display = "none");
        }, showCover: function() {
          $el.mplayerCover.style.opacity <= 0 && ($el.mplayerCover.style.zIndex = 8, $el.mplayerCover.style.opacity = 0.2);
        }, hideCover: function() {
          "0" != $el.mplayerCover.style.opacity && ($el.mplayerCover.style.opacity = 0, $el.mplayerCover.style.zIndex = -1);
        }, showToast: function() {
          var t2 = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, o = { message: "", duration: 1500, style: {} };
          "string" == typeof t2 && (o.message = t2), "object" == _typeof(t2) && Object.keys(o).forEach(function(e2) {
            t2[e2] && (o[e2] = t2[e2]);
          });
          var r, e = 0 < ("number" == typeof o.duration && o.duration) ? o.duration : 1500, n = $el.mPlayer.querySelector("#mplayer-media-wrapper");
          n.querySelector("#mplayer-toast") && $method.removeNode(n, "#mplayer-toast"), (r = document.createElement("div")).setAttribute("class", "mplayer-toast toast-scaling"), r.setAttribute("id", "mplayer-toast"), r.innerHTML = o.message, "[object Object]" == Object.prototype.toString.call(o.style) && Object.keys(o.style).forEach(function(e2) {
            r.style[e2] = o.style[e2];
          }), n.appendChild(r), r.addEventListener("click", function(e2) {
            e2.stopPropagation();
          }), r.addEventListener("touchstart", function(e2) {
            e2.stopPropagation();
          }), _this._global_.handleIconTimer_2 && window.clearTimeout(_this._global_.handleIconTimer_2), _this._global_.handleIconTimer_2 = setTimeout(function() {
            $method.removeNode(n, "#mplayer-toast");
          }, e);
        }, toggleControlsStyle: function(e) {
          for (var t2, o = (option.custom || {}).footerControls || [], r = 0; r < o.length; r++)
            true !== o[r].oftenShow && (t2 = o[r].slot, (t2 = $el.mplayerFooter.querySelector("[slot=" + t2 + "]")) && ("portrait" == e && (t2.style.display = "none"), "landscape" == e && (t2.style.display = "block")));
        }, onDocVisibilitychange: function(e) {
          false !== $data.showScreenControls && $method.createTimerCloseControl({ type: "visible" == document.visibilityState ? "" : "cancel" });
        }, onScreenResize: function(e) {
          (e = e || { type: "" }).stopPropagation && e.stopPropagation();
          function t2() {
            $method.toggleControlsDisplay(e), $el.progressContainer.classList.remove("upper-position"), $method.toggleControlsStyle("portrait"), setTimeout(function() {
              var e2 = { direction: "portrait" };
              "window" == $method.returnSys() && (e2.fullscreen = $data.isFullScreen), _this.emit("fullscreen-change", e2);
            }, 10), window.plus && setTimeout(function() {
              plus.navigator.showSystemNavigation();
            }, 200);
          }
          function o() {
            $method.toggleControlsDisplay(e), $el.progressContainer.classList.add("upper-position"), $method.toggleControlsStyle("landscape"), setTimeout(function() {
              var e2 = { direction: "landscape" };
              "window" == $method.returnSys() && (e2.fullscreen = $data.isFullScreen), _this.emit("fullscreen-change", e2);
            }, 10), window.plus && $data.isFullScreen && setTimeout(function() {
              plus.navigator.hideSystemNavigation();
            }, 200);
          }
          $method.createTimerCloseControl(), $method.changeVideoSize(e), window.orientation || 0 == window.orientation ? (0 == window.orientation || 180 == window.orientation ? t2 : o)() : setTimeout(function() {
            (500 <= $el.mPlayer.getBoundingClientRect().width ? o : t2)();
          }, 0), 0 == $data.showScreenControls && $method.toggleControlsDisplay({ type: "hideControls" });
        }, returnSys: function() {
          var e = new function() {
            var e2 = navigator.userAgent;
            return { ios: !!e2.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), android: -1 < e2.indexOf("Android") || -1 < e2.indexOf("Linux"), iPhone: -1 < e2.indexOf("iPhone"), iPad: -1 < e2.indexOf("iPad") };
          }();
          return e.iPhone || e.iPad || e.ios ? "ios" : e.android ? "androd" : "window";
        }, nodesObserver: function() {
          var e = new MutationObserver(function(e2, t22) {
            var o, r = _createForOfIteratorHelper(e2);
            try {
              for (r.s(); !(o = r.n()).done; ) {
                var n = o.value;
                if ("childList" === n.type) {
                  var i2, l = _createForOfIteratorHelper(n.removedNodes);
                  try {
                    for (l.s(); !(i2 = l.n()).done; ) {
                      var a = i2.value;
                      if (a instanceof HTMLVideoElement) {
                        hls && hls.media && (hls.destroy(), hls = ""), flv && (flv.destroy(), flv = ""), document.pictureInPictureElement == a && document.exitPictureInPicture(), a.pause(), a.removeAttribute("src"), t22.disconnect();
                        break;
                      }
                    }
                  } catch (e3) {
                    l.e(e3);
                  } finally {
                    l.f();
                  }
                }
              }
            } catch (e3) {
              r.e(e3);
            } finally {
              r.f();
            }
          }), t2 = $el.mPlayer.querySelector(".video-wrapper");
          e.observe(t2, { childList: true });
        }, toggleEventListenerCustom: function(e) {
          var t2 = option.custom || {}, o = "add" == e ? "addEventListener" : "removeEventListener", r = t2.headControls || [];
          if (0 < r.length)
            for (var n = 0; n < r.length; n++)
              !r[n].click instanceof Function || (l = r[n].slot, (a = $el.headerMenu.querySelector("[slot=" + l + "]")) instanceof Element && a[o]("click", r[n].click));
          var i2 = t2.footerControls || [];
          if (0 < i2.length)
            for (var l, a, n = 0; n < i2.length; n++)
              !i2[n].click instanceof Function || (l = i2[n].slot, (a = $el.mplayerFooter.querySelector("[slot=" + l + "]")) instanceof Element && a[o]("click", i2[n].click));
        }, toggleEventListenerGlobal: function(e, t2) {
          var o, r = "add" == e ? "addEventListener" : "removeEventListener";
          o = "onorientationchange" in window ? "orientationchange" : "resize", window[r](o, $method.onScreenResize), $el.backButton[r]("click", $method.onBack), $el.fullSwitch[r]("click", $method.fullToggle), $el.playSwitch[r]("click", $method.onPlayTap), $el.mPlayer[r]("click", $method.onContrainerTap), $el.mPlayer[r]("dblclick", $method.onContrainerTap), $el.touchEffective instanceof Element && $el.touchEffective[r]("touchstart", $method.progressBarSeeking), $el.touchEffective instanceof Element && $el.touchEffective[r]("mousedown", $method.progressBarSeeking), $el.videoObject[r]("webkitbeginfullscreen", $method.runtimeCompatibleHandle), $el.videoObject[r]("webkitendfullscreen", $method.runtimeCompatibleHandle), document[r]("resume", $method.plusRuntimeHandle), document[r]("pause", $method.plusRuntimeHandle), document[r]("visibilitychange", $method.onDocVisibilitychange), "playerReady" == t2 && function() {
            $el.mplayerCover.addEventListener("touchstart", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerCover.addEventListener("touchmove", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerHeader.addEventListener("touchmove", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerHeader.addEventListener("click", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerHeader.addEventListener("dblclick", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerFooter.addEventListener("touchmove", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerFooter.addEventListener("click", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerFooter.addEventListener("dblclick", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerError.addEventListener("touchstart", function(e3) {
              e3.stopPropagation();
            }), $el.mplayerError.addEventListener("touchmove", function(e3) {
              e3.stopPropagation();
            }), $el.videoObject.addEventListener("canplaythrough", $method.onCanplaythrough), $el.videoObject.addEventListener("durationchange", $method.onDurationChange), option.live || $el.videoObject.addEventListener("timeupdate", $method.onTimeupdate), $el.videoObject.addEventListener("play", $method.onPlay), $el.videoObject.addEventListener("playing", $method.onPlaying), $el.videoObject.addEventListener("pause", $method.onPause), $el.videoObject.addEventListener("waiting", $method.onWaiting), $el.videoObject.addEventListener("error", $method.onError), option.live || $el.videoObject.addEventListener("progress", $method.onProgress);
            for (var e2 = $el.mPlayer.querySelectorAll(".mplayer-sidebar"), t22 = 0; t22 < e2.length; t22++)
              e2[t22].addEventListener("touchstart", function(e3) {
                e3.stopPropagation();
              }), e2[t22].addEventListener("touchmove", function(e3) {
                e3.stopPropagation();
              }), e2[t22].addEventListener("touchend", function(e3) {
                e3.stopPropagation();
              }), e2[t22].addEventListener("click", function(e3) {
                e3.stopPropagation();
              }), e2[t22].addEventListener("dblclick", function(e3) {
                e3.stopPropagation();
              });
          }();
        } }, this.showRightSidebar = function(e) {
          e = $el.mPlayer.querySelector("#mplayer-media-wrapper [slot=" + e + "]");
          e && e.classList.contains("mplayer-sidebar") && ($method.createTimerCloseControl({ type: "cancel" }), $method.toggleControlsDisplay({ type: "sidebarRight" }), e.classList.add("open"), $data.isShowRightSidebar = true, webpagePlugin && new webpagePlugin.interface()._removeEvent());
        }, this.toggleControls = function(e) {
          true === e ? 0 == $data.showScreenControls ? $method.toggleControlsDisplay({ type: "showControls" }) : $method.createTimerCloseControl() : false === e ? 1 == $data.showScreenControls && $method.toggleControlsDisplay({ type: "hideControls" }) : $method.toggleControlsDisplay();
          e = new Object();
          return e.closeTimer = function() {
            _this._global_.mp_timeout_3 && clearTimeout(_this._global_.mp_timeout_3), $data.isControlsTimer = false;
          }, e.openTimer = function() {
            $data.isControlsTimer = true;
          }, e;
        }, this.showToast = function(e) {
          $method.showToast(e);
        }, this.showLoading = function() {
          $method.showLoading();
        }, this.hideLoading = function() {
          $method.hideLoading();
        }, this.video = function() {
          return $el.videoObject;
        }, this.reloadUrl = function(e) {
          $method.reloadUrl(e);
        }, this.destroy = function() {
          $method.destroy();
        }, this.openFullScreen = function() {
          $method.openFullScreen();
        }, this.closeFullScreen = function() {
          $method.closeFullScreen();
        }, this.sendError = function(e) {
          $method.onError(e);
        }, this.getControls = function() {
          return setTimeout(function() {
            $method.overloadingEl();
          }, 10), $el.mPlayer.querySelectorAll("[control]");
        }, "interactive" == document.readyState || "complete" == document.readyState ? $method.initCreateMplayer() : document.addEventListener("readystatechange", function() {
          "interactive" == document.readyState && $method.initCreateMplayer();
        }));
      };
      return MuiPlayer.prototype.on = function(e, t2, o) {
        this._event_[e] || (this._event_[e] = []), this._event_[e]["MASTER" == o ? "unshift" : "push"](t2);
      }, MuiPlayer.prototype.off = function(e, t2) {
        this._event_[e] && (t2 ? 0 <= (t2 = this._event_[e].indexOf(t2)) && this._event_[e].splice(t2, 1) : this._event_[e] = void 0);
      }, MuiPlayer.prototype.emit = function(e, t2) {
        if (this._event_[e])
          for (var o = 0; o < this._event_[e].length; o++) {
            var r = this._event_[e][o];
            t2 instanceof Array ? r.apply(this, t2) : r(t2);
          }
      }, MuiPlayer.prototype.once = function(t2, o) {
        var r = this;
        this.on(t2, function e() {
          o.apply(this, Array.prototype.slice.call(arguments)), setTimeout(function() {
            r.off(t2, e);
          }, 200);
        });
      }, MuiPlayer;
    });
  })(muiPlayer_min, muiPlayer_min.exports);
  var muiPlayer_minExports = muiPlayer_min.exports;
  const MuiPlayer = /* @__PURE__ */ getDefaultExportFromCjs(muiPlayer_minExports);
  const COLLAPSE_LIMIT = 30;
  const _sfc_main$6 = {
    __name: "detail",
    setup(__props, { expose: __expose }) {
      __expose();
      const vod = vue.ref(null);
      const flags = vue.ref([]);
      const activeFlag = vue.ref("");
      const playingIndex = vue.ref(-1);
      const playerReady = vue.ref(false);
      const expand = vue.ref(false);
      const showAll = vue.ref(false);
      const isFaved = vue.ref(false);
      let pageId = "";
      let mp = null;
      const currentEpisodes = vue.computed(() => {
        const f = flags.value.find((f2) => f2.flag === activeFlag.value);
        return (f == null ? void 0 : f.episodes) || [];
      });
      const displayEpisodes = vue.computed(() => {
        if (showAll.value || currentEpisodes.value.length <= COLLAPSE_LIMIT) {
          return currentEpisodes.value;
        }
        return currentEpisodes.value.slice(0, COLLAPSE_LIMIT);
      });
      onLoad((options) => {
        pageId = (options == null ? void 0 : options.id) || "";
      });
      vue.onMounted(async () => {
        var _a;
        if (!pageId)
          return;
        try {
          const data = await detail(pageId);
          vod.value = data.vod;
          flags.value = ((_a = data.vod) == null ? void 0 : _a.flags) || [];
          if (flags.value.length > 0) {
            activeFlag.value = flags.value[0].flag;
          }
          isFaved.value = isFavorite(pageId);
        } catch {
          uni.showToast({ title: "加载失败", icon: "none" });
        }
      });
      vue.onBeforeUnmount(() => {
        destroyPlayer();
      });
      function destroyPlayer() {
        if (mp) {
          mp.destroy();
          mp = null;
        }
      }
      function initPlayer(url, title) {
        destroyPlayer();
        playerReady.value = true;
        vue.nextTick(() => {
          mp = new MuiPlayer({
            container: "#detail-player",
            src: url,
            title: title || "",
            autoplay: true,
            preload: "auto",
            muted: false,
            width: "100%",
            height: "100%",
            poster: "",
            live: false,
            config: {
              autoHide: 3e3,
              draggableProgress: true
            }
          });
          uni.pageScrollTo({ selector: ".player-area", duration: 300 });
        });
      }
      function playFirst() {
        if (currentEpisodes.value.length > 0) {
          playEpisode(0);
        }
      }
      function switchFlag(flag) {
        activeFlag.value = flag;
        playingIndex.value = -1;
        showAll.value = false;
        destroyPlayer();
        playerReady.value = false;
      }
      async function playEpisode(index) {
        var _a;
        const ep = currentEpisodes.value[index];
        if (!ep)
          return;
        playingIndex.value = index;
        showAll.value = true;
        addHistory(vod.value, ep.name);
        let videoUrl = ep.url;
        try {
          const data = await player(activeFlag.value, ep.url);
          videoUrl = data.url || ep.url;
        } catch {
        }
        initPlayer(videoUrl, (_a = vod.value) == null ? void 0 : _a.vod_name);
      }
      function prevEpisode() {
        if (playingIndex.value > 0) {
          playEpisode(playingIndex.value - 1);
        }
      }
      function nextEpisode() {
        if (playingIndex.value < currentEpisodes.value.length - 1) {
          playEpisode(playingIndex.value + 1);
        }
      }
      function toggleFav() {
        if (isFaved.value) {
          removeFavorite(vod.value.vod_id);
          isFaved.value = false;
          uni.showToast({ title: "已取消收藏", icon: "none" });
        } else {
          addFavorite(vod.value);
          isFaved.value = true;
          uni.showToast({ title: "已收藏", icon: "success" });
        }
      }
      const __returned__ = { COLLAPSE_LIMIT, vod, flags, activeFlag, playingIndex, playerReady, expand, showAll, isFaved, get pageId() {
        return pageId;
      }, set pageId(v) {
        pageId = v;
      }, get mp() {
        return mp;
      }, set mp(v) {
        mp = v;
      }, currentEpisodes, displayEpisodes, destroyPlayer, initPlayer, playFirst, switchFlag, playEpisode, prevEpisode, nextEpisode, toggleFav, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, onBeforeUnmount: vue.onBeforeUnmount, nextTick: vue.nextTick, get onLoad() {
        return onLoad;
      }, get detail() {
        return detail;
      }, get player() {
        return player;
      }, get getFavorites() {
        return getFavorites;
      }, get addFavorite() {
        return addFavorite;
      }, get removeFavorite() {
        return removeFavorite;
      }, get isFavorite() {
        return isFavorite;
      }, get addHistory() {
        return addHistory;
      }, get MuiPlayer() {
        return MuiPlayer;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return $setup.vod ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "page"
    }, [
      vue.createElementVNode("view", { class: "player-area" }, [
        $setup.playerReady ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          id: "detail-player",
          class: "mui-player-container"
        })) : vue.createCommentVNode("v-if", true),
        !$setup.playerReady ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "poster-overlay",
          onClick: $setup.playFirst
        }, [
          vue.createElementVNode("image", {
            class: "poster-bg",
            src: $setup.vod.vod_pic,
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "poster-gradient" }),
          vue.createElementVNode("view", { class: "poster-info" }, [
            vue.createElementVNode("image", {
              class: "poster-cover",
              src: $setup.vod.vod_pic,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("view", { class: "poster-meta" }, [
              vue.createElementVNode(
                "text",
                { class: "poster-title" },
                vue.toDisplayString($setup.vod.vod_name),
                1
                /* TEXT */
              ),
              $setup.vod.vod_remarks ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "poster-sub"
                },
                vue.toDisplayString($setup.vod.vod_remarks),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "play-icon" }, [
            vue.createVNode(_component_uni_icons, {
              type: "play-filled",
              size: "60",
              color: "#fff"
            })
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("view", { class: "title-row" }, [
          vue.createElementVNode(
            "text",
            { class: "vod-title" },
            vue.toDisplayString($setup.vod.vod_name),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "title-actions" }, [
            vue.createVNode(_component_uni_icons, {
              type: $setup.isFaved ? "star-filled" : "star",
              color: $setup.isFaved ? "#e74c3c" : "#888",
              size: "22",
              onClick: $setup.toggleFav
            }, null, 8, ["type", "color"])
          ])
        ]),
        vue.createElementVNode("view", { class: "tags" }, [
          $setup.vod.vod_remarks ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "tag status"
            },
            vue.toDisplayString($setup.vod.vod_remarks),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "text",
            { class: "tag" },
            vue.toDisplayString($setup.vod.vod_year),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "tag" },
            vue.toDisplayString($setup.vod.vod_area),
            1
            /* TEXT */
          ),
          $setup.vod.vod_director ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 1,
              class: "tag"
            },
            vue.toDisplayString($setup.vod.vod_director),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        $setup.flags.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "source-row"
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "flag",
            size: "14",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "source-label" }, " 站源："),
          vue.createElementVNode("scroll-view", {
            class: "source-tabs",
            "scroll-x": "",
            "show-scrollbar": "false"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.flags, (f) => {
                return vue.openBlock(), vue.createElementBlock("text", {
                  key: f.flag,
                  class: vue.normalizeClass(["source-tab", { active: f.flag === $setup.activeFlag }]),
                  onClick: ($event) => $setup.switchFlag(f.flag)
                }, vue.toDisplayString(f.flag), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      $setup.currentEpisodes.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "list",
            size: "16",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "section-title" }, " 选集"),
          vue.createElementVNode(
            "text",
            { class: "ep-count" },
            "共 " + vue.toDisplayString($setup.currentEpisodes.length) + " 集",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "episodes" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.displayEpisodes, (ep, i2) => {
              return vue.openBlock(), vue.createElementBlock("text", {
                key: i2,
                class: vue.normalizeClass(["ep", { playing: i2 === $setup.playingIndex }]),
                onClick: ($event) => $setup.playEpisode(i2)
              }, vue.toDisplayString(ep.name), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $setup.currentEpisodes.length > $setup.COLLAPSE_LIMIT && !$setup.showAll ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "ep ep-more",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.showAll = true)
          }, [
            vue.createTextVNode(
              "展开 " + vue.toDisplayString($setup.currentEpisodes.length - $setup.COLLAPSE_LIMIT) + " 集 ",
              1
              /* TEXT */
            ),
            vue.createVNode(_component_uni_icons, {
              type: "arrowdown",
              size: "12",
              color: "#e74c3c"
            })
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        $setup.playingIndex >= 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "player-nav"
        }, [
          vue.createElementVNode("view", {
            class: "nav-btn",
            onClick: $setup.prevEpisode
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "arrowleft",
              size: "20",
              color: "#fff"
            })
          ]),
          vue.createElementVNode(
            "text",
            { class: "nav-label" },
            vue.toDisplayString($setup.playingIndex + 1) + "/" + vue.toDisplayString($setup.currentEpisodes.length),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "nav-btn",
            onClick: $setup.nextEpisode
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "arrowright",
              size: "20",
              color: "#fff"
            })
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      $setup.vod.vod_content ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "info",
            size: "16",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "section-title" }, " 简介")
        ]),
        vue.createElementVNode("text", {
          class: "content",
          lines: $setup.expand ? 100 : 4,
          onClick: _cache[1] || (_cache[1] = ($event) => $setup.expand = !$setup.expand)
        }, [
          vue.createTextVNode(
            vue.toDisplayString($setup.vod.vod_content) + " ",
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "expand-btn" }, [
            vue.createVNode(_component_uni_icons, {
              type: $setup.expand ? "arrowup" : "arrowdown",
              size: "12",
              color: "#e74c3c"
            }, null, 8, ["type"]),
            vue.createTextVNode(
              " " + vue.toDisplayString($setup.expand ? "收起" : "展开"),
              1
              /* TEXT */
            )
          ])
        ], 8, ["lines"])
      ])) : vue.createCommentVNode("v-if", true),
      $setup.vod.vod_actor ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "person",
            size: "16",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "section-title" }, " 演员")
        ]),
        vue.createElementVNode(
          "text",
          { class: "content" },
          vue.toDisplayString($setup.vod.vod_actor),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ])) : vue.createCommentVNode("v-if", true);
  }
  const PagesDetailDetail = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-eca06f3c"], ["__file", "D:/jqw/project/lyoTVMobile/pages/detail/detail.vue"]]);
  const _sfc_main$5 = {
    __name: "history",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      function load() {
        list.value = getHistory();
      }
      onShow(() => load());
      onPullDownRefresh(() => {
        load();
        uni.stopPullDownRefresh();
      });
      function remove(vodId, time) {
        list.value = list.value.filter(
          (item) => !(item.vod_id === vodId && item.time === time)
        );
        uni.setStorageSync("lyotv_history", list.value);
      }
      function onClear() {
        uni.showModal({
          title: "提示",
          content: "确定清空所有观看记录吗？",
          success: (res) => {
            if (res.confirm) {
              clearHistory();
              list.value = [];
            }
          }
        });
      }
      function goDetail(item) {
        addHistory(item);
        uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` });
      }
      function formatTime(ts) {
        if (!ts)
          return "";
        const d2 = new Date(ts);
        const now = /* @__PURE__ */ new Date();
        const diff = now - d2;
        if (diff < 864e5 && d2.getDate() === now.getDate()) {
          return `今天 ${pad(d2.getHours())}:${pad(d2.getMinutes())}`;
        }
        if (diff < 1728e5 && d2.getDate() === now.getDate() - 1) {
          return `昨天 ${pad(d2.getHours())}:${pad(d2.getMinutes())}`;
        }
        return `${d2.getMonth() + 1}/${d2.getDate()} ${pad(d2.getHours())}:${pad(d2.getMinutes())}`;
      }
      function pad(n) {
        return n < 10 ? "0" + n : "" + n;
      }
      const __returned__ = { list, load, remove, onClear, goDetail, formatTime, pad, ref: vue.ref, get getHistory() {
        return getHistory;
      }, get clearHistory() {
        return clearHistory;
      }, get addHistory() {
        return addHistory;
      }, get onShow() {
        return onShow;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty"
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "clock",
          size: "60",
          color: "#555"
        }),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无观看记录"),
        vue.createElementVNode("text", { class: "empty-sub" }, "快去观看影片吧")
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.vod_id + item.time,
              class: "item",
              onClick: ($event) => $setup.goDetail(item)
            }, [
              vue.createElementVNode("image", {
                class: "thumb",
                src: item.vod_pic,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode(
                  "text",
                  {
                    class: "title",
                    lines: 1
                  },
                  vue.toDisplayString(item.vod_name),
                  1
                  /* TEXT */
                ),
                item.episode ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "episode"
                  },
                  vue.toDisplayString(item.episode),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode(
                  "text",
                  { class: "time" },
                  vue.toDisplayString($setup.formatTime(item.time)),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", {
                class: "close",
                onClick: vue.withModifiers(($event) => $setup.remove(item.vod_id, item.time), ["stop"])
              }, [
                vue.createVNode(_component_uni_icons, {
                  type: "closeempty",
                  size: "18",
                  color: "#555"
                })
              ], 8, ["onClick"])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])),
      $setup.list.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "footer"
      }, [
        vue.createElementVNode("view", {
          class: "clear-btn",
          onClick: $setup.onClear
        }, [
          vue.createVNode(_component_uni_icons, {
            type: "trash",
            size: "14",
            color: "#888"
          }),
          vue.createElementVNode("text", { style: { "margin-left": "6rpx" } }, "清空全部记录")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesHistoryHistory = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-b2d018fa"], ["__file", "D:/jqw/project/lyoTVMobile/pages/history/history.vue"]]);
  const _sfc_main$4 = {
    __name: "favorite",
    setup(__props, { expose: __expose }) {
      __expose();
      const list = vue.ref([]);
      function load() {
        list.value = getFavorites();
      }
      onShow(() => load());
      onPullDownRefresh(() => {
        load();
        uni.stopPullDownRefresh();
      });
      function onRemove(vodId) {
        removeFavorite(vodId);
        list.value = getFavorites();
        uni.showToast({ title: "已移除", icon: "none" });
      }
      function goDetail(item) {
        addHistory(item);
        uni.navigateTo({ url: `/pages/detail/detail?id=${item.vod_id}` });
      }
      const __returned__ = { list, load, onRemove, goDetail, ref: vue.ref, get getFavorites() {
        return getFavorites;
      }, get removeFavorite() {
        return removeFavorite;
      }, get addHistory() {
        return addHistory;
      }, VodCard, get onShow() {
        return onShow;
      }, get onPullDownRefresh() {
        return onPullDownRefresh;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      $setup.list.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty"
      }, [
        vue.createVNode(_component_uni_icons, {
          type: "star",
          size: "60",
          color: "#555"
        }),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无收藏"),
        vue.createElementVNode("text", { class: "empty-sub" }, "去首页发现喜欢的影片吧")
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "grid"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($setup.list, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.vod_id,
              class: "grid-item",
              onClick: ($event) => $setup.goDetail(item)
            }, [
              vue.createElementVNode("view", { class: "card-wrapper" }, [
                vue.createVNode($setup["VodCard"], { item }, null, 8, ["item"]),
                vue.createElementVNode("view", {
                  class: "remove",
                  onClick: vue.withModifiers(($event) => $setup.onRemove(item.vod_id), ["stop"])
                }, [
                  vue.createVNode(_component_uni_icons, {
                    type: "closeempty",
                    size: "16",
                    color: "#fff"
                  })
                ], 8, ["onClick"])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]))
    ]);
  }
  const PagesFavoriteFavorite = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-8850f19c"], ["__file", "D:/jqw/project/lyoTVMobile/pages/favorite/favorite.vue"]]);
  const _sfc_main$3 = {
    __name: "mine",
    setup(__props, { expose: __expose }) {
      __expose();
      const subUrl = vue.ref("");
      const currentSize = vue.ref("medium");
      const theme = vue.ref("dark");
      try {
        const saved = uni.getStorageSync("lyotv_image_size");
        if (saved)
          currentSize.value = saved;
      } catch {
      }
      try {
        const saved = uni.getStorageSync("lyotv_theme");
        if (saved)
          theme.value = saved;
      } catch {
      }
      function setTheme(val) {
        theme.value = val;
        if (typeof uni.$lyotvTheme !== "undefined") {
          uni.$lyotvTheme.set(val);
        } else {
          try {
            uni.setStorageSync("lyotv_theme", val);
          } catch {
          }
        }
        uni.showToast({ title: val === "dark" ? "深色模式" : "浅色模式", icon: "none" });
      }
      function setImgSize(size) {
        currentSize.value = size;
        try {
          uni.setStorageSync("lyotv_image_size", size);
        } catch {
        }
        uni.showToast({ title: size === "large" ? "大图模式" : size === "medium" ? "中图模式" : "小图模式", icon: "none" });
      }
      async function submitSub() {
        var _a, _b;
        const url = subUrl.value.trim();
        if (!url)
          return;
        formatAppLog("log", "at pages/mine/mine.vue:168", "[订阅] 用户输入地址:", url);
        try {
          uni.showLoading({ title: "加载订阅..." });
          formatAppLog("log", "at pages/mine/mine.vue:171", "[订阅] 步骤1/2 init 加载订阅源...");
          await init(url);
          formatAppLog("log", "at pages/mine/mine.vue:173", "[订阅] init 成功");
          setSubUrl(url);
          formatAppLog("log", "at pages/mine/mine.vue:176", "[订阅] 步骤2/2 home 获取首页...");
          const data = await home();
          formatAppLog("log", "at pages/mine/mine.vue:178", "[订阅] home 成功, class=", (_a = data == null ? void 0 : data.class) == null ? void 0 : _a.length, "list=", (_b = data == null ? void 0 : data.list) == null ? void 0 : _b.length);
          updateHome(data);
          uni.$emit("subUpdated");
          uni.hideLoading();
          uni.showToast({ title: "订阅成功", icon: "success" });
          subUrl.value = "";
        } catch (e) {
          formatAppLog("error", "at pages/mine/mine.vue:186", "[订阅] 失败:", e && e.message, e);
          uni.hideLoading();
          uni.showToast({ title: e && e.message ? e.message : "订阅加载失败", icon: "none" });
        }
      }
      function goPage(page) {
        switch (page) {
          case "favorite":
            uni.switchTab({ url: "/pages/favorite/favorite" });
            break;
          case "history":
            uni.navigateTo({ url: "/pages/history/history" });
            break;
        }
      }
      const __returned__ = { subUrl, currentSize, theme, setTheme, setImgSize, submitSub, goPage, ref: vue.ref, get store() {
        return store;
      }, get setSubUrl() {
        return setSubUrl;
      }, get updateHome() {
        return updateHome;
      }, get apiInit() {
        return init;
      }, get home() {
        return home;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "profile" }, [
        vue.createElementVNode("view", { class: "avatar" }, [
          vue.createVNode(_component_uni_icons, {
            type: "person-filled",
            size: "40",
            color: "#888"
          })
        ]),
        vue.createElementVNode("text", { class: "name" }, "影视爱好者"),
        vue.createElementVNode("text", { class: "bio" }, "观看精彩世界")
      ]),
      vue.createElementVNode("view", { class: "section subscribe" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "download",
            size: "16",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "section-title" }, " 订阅源设置")
        ]),
        vue.createElementVNode("view", { class: "sub-input" }, [
          vue.createVNode(_component_uni_icons, {
            type: "link",
            size: "16",
            color: "#555",
            style: { "position": "absolute", "left": "24rpx", "top": "50%", "transform": "translateY(-50%)", "z-index": "1" }
          }),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.subUrl = $event),
              placeholder: "输入订阅地址（JSON URL）",
              "placeholder-class": "placeholder",
              style: { "padding-left": "44rpx" }
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $setup.subUrl]
          ]),
          vue.createElementVNode("text", {
            class: "sub-btn",
            onClick: $setup.submitSub
          }, [
            vue.createVNode(_component_uni_icons, {
              type: "checkmark",
              size: "16",
              color: "#fff"
            }),
            vue.createElementVNode("text", { style: { "margin-left": "4rpx" } }, "确定")
          ])
        ]),
        $setup.store.subUrl && !$setup.subUrl ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "sub-hint"
          },
          " 当前订阅：" + vue.toDisplayString($setup.store.subUrl.substring(0, 40)) + "... ",
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createElementVNode("view", { class: "menu" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[1] || (_cache[1] = ($event) => $setup.goPage("favorite"))
        }, [
          vue.createElementVNode("view", { class: "icon-box fav" }, [
            vue.createVNode(_component_uni_icons, {
              type: "star-filled",
              size: "22",
              color: "#f39c12"
            })
          ]),
          vue.createElementVNode("text", { class: "label" }, "我的收藏"),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "16",
            color: "#555"
          })
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[2] || (_cache[2] = ($event) => $setup.goPage("history"))
        }, [
          vue.createElementVNode("view", { class: "icon-box clock" }, [
            vue.createVNode(_component_uni_icons, {
              type: "clock",
              size: "22",
              color: "#3498db"
            })
          ]),
          vue.createElementVNode("text", { class: "label" }, "观看历史"),
          vue.createVNode(_component_uni_icons, {
            type: "arrowright",
            size: "16",
            color: "#555"
          })
        ])
      ]),
      vue.createElementVNode("view", { class: "img-setting" }, [
        vue.createElementVNode("view", { class: "img-setting-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "image",
            size: "14",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "img-setting-label" }, " 图片设置")
        ]),
        vue.createElementVNode("view", { class: "img-size-options" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["img-size-btn", { active: $setup.currentSize === "large" }]),
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.setImgSize("large"))
            },
            [
              vue.createElementVNode("text", { class: "img-size-btn-label" }, "大"),
              vue.createElementVNode("text", { class: "img-size-btn-cols" }, "3列"),
              vue.createElementVNode("view", { class: "img-size-preview" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(3, (i2) => {
                    return vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["preview-dot", { active: $setup.currentSize === "large" }]),
                        key: i2
                      },
                      null,
                      2
                      /* CLASS */
                    );
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["img-size-btn", { active: $setup.currentSize === "medium" }]),
              onClick: _cache[4] || (_cache[4] = ($event) => $setup.setImgSize("medium"))
            },
            [
              vue.createElementVNode("text", { class: "img-size-btn-label" }, "中"),
              vue.createElementVNode("text", { class: "img-size-btn-cols" }, "4列"),
              vue.createElementVNode("view", { class: "img-size-preview" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(4, (i2) => {
                    return vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["preview-dot", { active: $setup.currentSize === "medium" }]),
                        key: i2
                      },
                      null,
                      2
                      /* CLASS */
                    );
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["img-size-btn", { active: $setup.currentSize === "small" }]),
              onClick: _cache[5] || (_cache[5] = ($event) => $setup.setImgSize("small"))
            },
            [
              vue.createElementVNode("text", { class: "img-size-btn-label" }, "小"),
              vue.createElementVNode("text", { class: "img-size-btn-cols" }, "5列"),
              vue.createElementVNode("view", { class: "img-size-preview" }, [
                (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(5, (i2) => {
                    return vue.createElementVNode(
                      "view",
                      {
                        class: vue.normalizeClass(["preview-dot", { active: $setup.currentSize === "small" }]),
                        key: i2
                      },
                      null,
                      2
                      /* CLASS */
                    );
                  }),
                  64
                  /* STABLE_FRAGMENT */
                ))
              ])
            ],
            2
            /* CLASS */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "img-setting" }, [
        vue.createElementVNode("view", { class: "img-setting-header" }, [
          vue.createVNode(_component_uni_icons, {
            type: "circle",
            size: "14",
            color: "#888"
          }),
          vue.createElementVNode("text", { class: "img-setting-label" }, " 显示主题")
        ]),
        vue.createElementVNode("view", { class: "theme-options" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["theme-btn", { active: $setup.theme === "dark" }]),
              onClick: _cache[6] || (_cache[6] = ($event) => $setup.setTheme("dark"))
            },
            [
              vue.createVNode(_component_uni_icons, {
                type: "moon",
                size: "16",
                color: $setup.theme === "dark" ? "#e74c3c" : "#888"
              }, null, 8, ["color"]),
              vue.createElementVNode("text", { class: "theme-btn-label" }, "深色")
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["theme-btn", { active: $setup.theme === "light" }]),
              onClick: _cache[7] || (_cache[7] = ($event) => $setup.setTheme("light"))
            },
            [
              vue.createVNode(_component_uni_icons, {
                type: "sun-filled",
                size: "16",
                color: $setup.theme === "light" ? "#e74c3c" : "#888"
              }, null, 8, ["color"]),
              vue.createElementVNode("text", { class: "theme-btn-label" }, "浅色")
            ],
            2
            /* CLASS */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "about" }, [
        vue.createElementVNode("text", { class: "version" }, "lyoTV v1.0.0")
      ])
    ]);
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-7c2ebfa5"], ["__file", "D:/jqw/project/lyoTVMobile/pages/mine/mine.vue"]]);
  const _sfc_main$2 = {
    __name: "player",
    setup(__props, { expose: __expose }) {
      __expose();
      const loading = vue.ref(true);
      const pageFlag = vue.ref("");
      const pageId = vue.ref("");
      const pageName = vue.ref("");
      let mp = null;
      onLoad((options) => {
        pageFlag.value = (options == null ? void 0 : options.flag) || "";
        pageId.value = (options == null ? void 0 : options.id) || "";
        pageName.value = (options == null ? void 0 : options.name) || "";
        uni.setNavigationBarTitle({ title: pageName.value || "播放" });
      });
      vue.onMounted(async () => {
        if (!pageId.value)
          return;
        try {
          const data = await player(pageFlag.value, pageId.value);
          const videoUrl = data.url || pageId.value;
          loading.value = false;
          await vue.nextTick();
          mp = new MuiPlayer({
            container: "#mui-player",
            src: videoUrl,
            title: pageName.value || "",
            autoplay: true,
            preload: "auto",
            muted: false,
            width: "100%",
            height: "100%",
            poster: "",
            live: false,
            config: {
              // 控制栏自动隐藏
              autoHide: 3e3,
              // 支持拖拽进度
              draggableProgress: true
            }
          });
          addHistory({ vod_name: pageName.value }, pageName.value);
          mp.on("fullscreenExit", () => {
            uni.navigateBack();
          });
        } catch (e) {
          loading.value = false;
          uni.showToast({ title: "播放地址解析失败", icon: "none" });
        }
      });
      vue.onBeforeUnmount(() => {
        if (mp) {
          mp.destroy();
          mp = null;
        }
      });
      const __returned__ = { loading, pageFlag, pageId, pageName, get mp() {
        return mp;
      }, set mp(v) {
        mp = v;
      }, ref: vue.ref, onMounted: vue.onMounted, onBeforeUnmount: vue.onBeforeUnmount, nextTick: vue.nextTick, get onLoad() {
        return onLoad;
      }, get player() {
        return player;
      }, get addHistory() {
        return addHistory;
      }, get MuiPlayer() {
        return MuiPlayer;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_uni_load_more = resolveEasycom(vue.resolveDynamicComponent("uni-load-more"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "player-page" }, [
      vue.createElementVNode("view", {
        id: "mui-player",
        class: "player-container"
      }),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading-overlay"
      }, [
        vue.createVNode(_component_uni_load_more, { status: "loading" })
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesPlayerPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__file", "D:/jqw/project/lyoTVMobile/pages/player/player.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/search/search", PagesSearchSearch);
  __definePage("pages/detail/detail", PagesDetailDetail);
  __definePage("pages/history/history", PagesHistoryHistory);
  __definePage("pages/favorite/favorite", PagesFavoriteFavorite);
  __definePage("pages/mine/mine", PagesMineMine);
  __definePage("pages/player/player", PagesPlayerPlayer);
  const _sfc_main$1 = {
    name: "PageMeta",
    setup(props, { emit }) {
      onResize((evt) => {
        emit("resize", evt);
      });
    },
    props: {
      backgroundTextStyle: {
        type: String,
        default: "dark",
        validator(value) {
          return ["dark", "light"].indexOf(value) !== -1;
        }
      },
      backgroundColor: {
        type: String,
        default: "#ffffff"
      },
      backgroundColorTop: {
        type: String,
        default: "#ffffff"
      },
      backgroundColorBottom: {
        type: String,
        default: "#ffffff"
      },
      scrollTop: {
        type: String,
        default: ""
      },
      scrollDuration: {
        type: Number,
        default: 300
      },
      pageStyle: {
        type: String,
        default: ""
      },
      enablePullDownRefresh: {
        type: [Boolean, String],
        default: false
      },
      rootFontSize: {
        type: String,
        default: ""
      }
    },
    created() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      this.$pageVm = currentPage.$vm || currentPage;
      this._currentWebview = currentPage.$getAppWebview();
      if (this.enablePullDownRefresh) {
        this.setPullDownRefresh(this._currentWebview, true);
      }
      this.$watch("enablePullDownRefresh", (val) => {
        this.setPullDownRefresh(this._currentWebview, val);
      });
      this.$watch("backgroundTextStyle", () => {
        this.setBackgroundTextStyle();
      });
      this.$watch(() => [
        this.rootFontSize,
        this.pageStyle
      ], () => {
        this.setPageMeta(currentPage.$page.id);
      });
      this.$watch(() => [
        this.backgroundColor,
        this.backgroundColorTop,
        this.backgroundColorBottom
      ], () => {
        this.setBackgroundColor();
      });
      this.$watch(() => [
        this.scrollTop,
        this.scrollDuration
      ], () => {
        this.pageScrollTo();
      });
    },
    beforeMount() {
      this.setBackgroundColor();
      if (this.rootFontSize || this.pageStyle) {
        this.setPageMeta();
      }
      this.backgroundTextStyle && this.setBackgroundTextStyle();
    },
    mounted() {
      this.scrollTop && this.pageScrollTo();
    },
    methods: {
      setPullDownRefresh(webview, enabled) {
        webview.setStyle({
          pullToRefresh: {
            support: enabled,
            style: plus.os.name === "Android" ? "circle" : "default"
          }
        });
      },
      setPageMeta(pageId) {
        this.$nextTick(() => {
          uni.setPageMeta({
            pageStyle: this.pageStyle,
            rootFontSize: this.rootFontSize,
            pageId
          });
        });
      },
      setBackgroundTextStyle() {
      },
      setBackgroundColor() {
      },
      pageScrollTo() {
        let scrollTop = String(this.scrollTop);
        if (scrollTop.indexOf("rpx") !== -1) {
          scrollTop = uni.upx2px(scrollTop.replace("rpx", ""));
        }
        scrollTop = parseFloat(scrollTop);
        if (isNaN(scrollTop)) {
          return;
        }
        uni.pageScrollTo({
          scrollTop,
          duration: this.scrollDuration,
          success: () => {
          }
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data2, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { style: { "display": "none" } }, [
      vue.renderSlot(_ctx.$slots, "default")
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__file", "D:/software/HBuilderX/plugins/uniapp-cli-vite/node_modules/@dcloudio/uni-components/lib/page-meta/page-meta.vue"]]);
  const _sfc_main = {
    __name: "App",
    setup(__props, { expose: __expose }) {
      __expose();
      const isLight = vue.ref(false);
      const themeClass = vue.computed(() => isLight.value ? "light" : "");
      vue.onMounted(() => {
        try {
          const saved = uni.getStorageSync("lyotv_theme");
          isLight.value = saved === "light";
        } catch {
        }
        uni.$on("themeChange", (val) => {
          isLight.value = val === "light";
        });
        initApp();
      });
      if (typeof uni !== "undefined") {
        uni.$lyotvTheme = {
          get() {
            return isLight.value ? "light" : "dark";
          },
          set(val) {
            isLight.value = val === "light";
            uni.setStorageSync("lyotv_theme", val);
            uni.$emit("themeChange", val);
          }
        };
      }
      const __returned__ = { isLight, themeClass, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, get initApp() {
        return initApp;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data2, $options) {
    const _component_page_meta = resolveEasycom(vue.resolveDynamicComponent("page-meta"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass($setup.themeClass)
      },
      [
        vue.createVNode(_component_page_meta, {
          "page-style": "overflow:hidden;background:" + ($setup.isLight ? "#f5f5f5" : "#141414")
        }, null, 8, ["page-style"])
      ],
      2
      /* CLASS */
    );
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "D:/jqw/project/lyoTVMobile/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
