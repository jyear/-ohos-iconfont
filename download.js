const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const progressStream = require("progress-stream");
const cachePath = path.join(__dirname, "./cache");
const { consoleString } = require("./utils");

const downloadIconfont = function (url) {
  return new Promise((resolve, reject) => {
    const urlTest = /^https?:\/\//;
    if (!url.trim() || !urlTest.test(url)) {
      reject("下载路径错误，请检查iconfont.json文件配置：iconURL");
      return;
    }
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath);
    }
    const fileExt = {
      "application/javascript": "js",
    };
    const cacheInfo = {
      url: url,
      fileName: `${new Date().getTime()}`,
      cacheFileName: `tem_${new Date().getTime()}`,
    };

    let writeStream = null;

    fetch(url).then((res) => {
      let h = {};
      res.headers.forEach(function (v, i, a) {
        h[i.toLowerCase()] = v;
      });
      const suffix = fileExt[h["content-type"]];
      const tmpFileSavePath = path.join(
        cachePath,
        `./${cacheInfo.cacheFileName}.${suffix}`
      );
      const fileSavePath = path.join(
        cachePath,
        `./${cacheInfo.fileName}.${suffix}`
      );
      // 进度
      let progress = progressStream({
        length: h["content-length"],
        time: 5 /* ms */,
      });
      progress.on("progress", function (progressData) {
        let percentage = Math.round(progressData.percentage) + "%";
        consoleString(`下载中...${percentage}`, "green");
      });

      writeStream = fs
        .createWriteStream(tmpFileSavePath, {
          flags: "w",
        })
        .on("error", function (e) {
          console.error("error==>", e);
          reject(e);
        })
        .on("ready", function () {
          consoleString(`开始下载iconfont文件:${url}`, "green");
        })
        .on("finish", function () {
          //下载完成后重命名文件
          fs.renameSync(tmpFileSavePath, fileSavePath);
          resolve(fs.readFileSync(fileSavePath, "utf8"));
          fs.unlinkSync(fileSavePath);
          consoleString(`文件下载完成,即将开始生成`, "green");
        });

      res.body.pipe(progress).pipe(writeStream);
    });
  });
};

module.exports = downloadIconfont;
