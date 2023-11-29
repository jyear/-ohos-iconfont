#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const rootPath = process.cwd();
const xml2js = require("xml2js");
const { template, consoleString } = require("./utils");
const downloadFile = require("./download");
const configJSONPath = path.join(rootPath, "./iconfont.json");
const configJSPath = path.join(rootPath, "./iconfont.js");

let config = null;
if (fs.existsSync(configJSONPath)) {
  config = require(configJSONPath);
}
if (fs.existsSync(configJSPath)) {
  config = require(configJSPath);
}

if (!config) {
  throw new Error(
    "没查询到当前目录存在config,你可以使用iconfont.json 或者 iconfont.js来配置config"
  );
}
if (!config.iconURL) {
  throw new Error("无法获取iconURL,请确认iconfont.json文件配置");
}

const toDir = path.join(rootPath, config.save_dir);

function parseSvg(str) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(
      `<svg>${str}</svg>`,
      {
        rootName: "svg",
      },
      (err, result) => {
        if (result) {
          resolve(result);
        }
      }
    );
  });
}

function parseSvg2Object(obj) {
  const symbols = obj.svg.symbol;
  const result = {};
  symbols.forEach((item) => {
    const id = item.$.id;
    const usePaths = item.path.map((p) => {
      return {
        path: p.$.d,
        fill: p.$.fill,
      };
    });

    result[id] = {
      id: item.$.id,
      viewPort: item.$.viewBox,
      paths: usePaths,
    };
  });
  return result;
}

function getConfigTem(config) {
  return `const config = ${JSON.stringify(config, null, 2)};
export default config;`;
}

async function run() {
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir);
  }
  const res = await downloadFile(config.iconURL);
  const mathes_1 = String(res).match(/'<svg>(.+?)<\/svg>'/);
  if (!mathes_1[1]) {
    throw new Error("无法解析出正确的SVG");
  }
  consoleString(`开始解析iconfont文件`, "green");
  const result = await parseSvg(mathes_1[1]);
  const iconObj = parseSvg2Object(result);
  const iconStr = getConfigTem(iconObj);
  consoleString(`解析完毕，开始生成文件`, "green");
  fs.writeFileSync(path.join(toDir, "./index.ets"), template);
  fs.writeFileSync(path.join(toDir, "./icon.ets"), iconStr);
  consoleString(`生成文件完毕，Success`, "green");
}

run();
