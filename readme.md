## ohos-iconfont
基于iconfont的生成鸿蒙系统图标库

在项目根目录创建iconfont.json

```
{
  "iconURL": "xxx", //https://iconfont内的symbol地址
  "save_dir": "./entry/src/main/ets/components/iconfont" //生成后的代码到处地址
}
```
执行命令
```
OIconfont
```
生成两个文件夹
```
iconfont
    --icon.ets
    --index.ets
``` 
使用方法
```
import IconFont from './iconfont';


// name为iconfont对应的类名，fontSize表示大小，color为图标颜色  如果不传入color则会采用iconfont自带的fill颜色
IconFont({ name: 'icon-fenlei', fontSize: 130, color: "#4e6ef2" })


```

现阶段为第一版本 对应api9,由于shape的viewport无法缩放，采用自己计算缩放使path缩放到合适的位置在模拟器上会出现锯齿，真机正常

