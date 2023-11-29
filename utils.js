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

module.exports = {
  template: indexTemplate,
  consoleString,
};
