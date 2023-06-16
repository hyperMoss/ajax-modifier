import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);

export default defineManifest(async (env) => {
  return {
    name: env.mode === "development" ? "[开发环境] Ajax Interceptor" : "Ajax Interceptor",
    description: "修改浏览器请求",
    version: `${major}.${minor}.${patch}.${label}`,
    manifest_version: 3,
    action: {
      // default_title: "点击打开",
      // default_popup: "popup.html",
    },
    devtools_page: "devtools.html",
    background: {
      service_worker: "background.js",
      type: "module",
    },
    host_permissions: ["*://*/*"],
    permissions: ["cookies", "storage","tabs"],
    "icons": {
      "16": "16_gray.png",
      "32": "32_gray.png",
      "48": "48.png",
      "128": "128.png"
    },
    content_scripts: [
      {
        "matches": [
          "<all_urls>"
        ],
        "js": [
          "./content.js"
        ],
        "run_at": "document_start",
        "all_frames": true
      }
    ],
    version_name: version,
    web_accessible_resources: [
      {
        "resources": [
          "main.js",
          "iframe.html",
          "devtools.js"
        ],
        "matches": [
          "<all_urls>"
        ]
      }
    ],
  };
});
