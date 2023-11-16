#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const rootPath = process.cwd();
const axios = require("axios");
const xml2js = require("xml2js");
const configPath = path.join(rootPath, "./iconfont.json");

const config = require(configPath);

const toDir = path.join(rootPath, config.save_dir);

if (!fs.existsSync(toDir)) {
  fs.mkdirSync(toDir);
}

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

function genCode(config) {
  const tem = `import iconConfig from './icon'

interface IconConfig {
  id: string;
  viewPort: string
  paths: Array<{
    path: string;
    fill: string;
  }>
}

@Component
export default struct IconFont {
  @Prop name: string;
  @Prop fontSize: number;
  @Prop color: string;
  @State curIcon: IconConfig | null = null
  @State scaleNum: number = 1

  aboutToAppear() {
    this.curIcon = iconConfig[this.name];
    this.scaleNum = this.fontSize / 1024
  }

  build() {
    Row() {
      if (this.curIcon && this.curIcon.paths) {
        Shape() {
          ForEach(this.curIcon.paths, (item) => {
            Path()
              .commands(item.path)
              .fill(this.color || item.fill)
              .width('100%')
              .height('100%')
              .antiAlias(true)
              .scale({ x: this.scaleNum * 3, y: this.scaleNum * 3, centerX: '0', centerY: '0' })
          })
        }
        .viewPort({ x: 0, y: 0, width: 1024, height: 1024 })
        .width(this.fontSize)
        .height(this.fontSize)
        .antiAlias(true)
      }
    }
  }
}`;

  fs.writeFileSync(
    path.join(toDir, "./icon.ets"),
    `const config = ${JSON.stringify(config, null, 2)};
  export default config;
    `
  );
  fs.writeFileSync(path.join(toDir, "./index.ets"), tem);
}

async function run(url) {
  const res = await axios.get(url);
  const mathes_1 = String(res.data).match(/'<svg>(.+?)<\/svg>'/);
  if (!mathes_1[1]) {
    throw new Error("无法解析出正确的SVG");
  }
  const result = await parseSvg(mathes_1[1]);
  const iconObj = parseSvg2Object(result);
  genCode(iconObj);
}

run(config.iconURL);
