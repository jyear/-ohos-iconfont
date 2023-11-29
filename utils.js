const xml2js = require("xml2js");
const indexTemplate = `import iconConfig from './icon'

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

function consoleString(str, color = "default") {
  const colorsMap = {
    red: "\x1b[31m%s\x1b[0m",
    green: "\x1b[32m%s\x1b[0m",
    yellow: "\x1b[33m%s\x1b[0m",
    blue: "\x1b[34m%s\x1b[0m",
    purple: "\x1b[35m%s\x1b[0m",
    cyan: "\x1b[36m%s\x1b[0m",
    default: "\x1b[0m",
  };

  console.log(colorsMap[color], str);
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

function getConfigTem(config) {
  return `const config = ${JSON.stringify(config, null, 2)};
export default config;`;
}

function getfilesize(size) {
  if (!size) return "";
  var num = 1024.0; //byte
  if (size < num) return size + "byte";
  if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + "Kb"; //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + "Mb"; //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + "Gb"; //G
  return (size / Math.pow(num, 4)).toFixed(2) + "Tb"; //T
}

module.exports = {
  template: indexTemplate,
  consoleString,
  parseSvg2Object,
  parseSvg,
  getConfigTem,
  getfilesize,
};
