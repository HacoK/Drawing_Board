# 画板实践项目（Drawing Board）

## Request:

编写画板程序，要求能够使用鼠标自由绘制简单的几何图形，如圆、三角形、正方形、长方形等；绘制完成后可以对所绘内容进行识别，识别机制可使用简单的基于笔画数的识别（只是建议，也可采取其他合理策略），并将识别结果显示在界面上（可通过文字或颜色或其他方式）。同时支持对绘制内容及标注信息的存储和读取。

## Instruction:

开发依照的代码原则：

正确性、易用性、便捷性、简洁性、兼容性

#### 1.代码结构说明：

#####a.

fonts文件夹及lib文件夹中的__at.alicdn.com_t_font_611936_r1ahagupcu4pwrk9.js

分别是阿里巴巴矢量图标库web端两种方式使用unicode引用及symbol引用

（ps:左下角图标则借由IcoMoon直接生成代码）

#####b.

layer文件夹为贤心开发的web弹层组件，用于动态html中各种弹窗的产生

lib文件夹下jquery.min.js、jquery-3.1.0.js及vue.min.js为引入的js库

#####c.

lib文件夹下$1.js基于[Unistroke Recognizer](http://depts.washington.edu/madlab/proj/dollar/index.html)修改而成（Add needed classes and delete redundant code）

识别机制为基于gesture的一笔画识别，识别效果还能接受

（目前笔者只加入triangle、square、rectangle、circle及pentagon五芒星，其它图案可通过加入$1.js的Unistroke（name，points）数组实现）

#####d.

根目录下的index.html、main.js、style.css就不赘述了，同一html页面中的各个元素为紧密联系的统一体，故只为drawing-board-page建立一个vue实例

#### 2.功能使用说明：

##### a.识别说明：

实践项目的识别基于gestrue，因而要求图形必须一笔画，另外每次画完识别结果会在结束时自动显示在画板上

##### b.绘制内容及标注信息的两种存储方式：

（1）垃圾桶图标旁边的下载图标将canvas内容保存为.png图片（支持橡皮擦修改）

（2）左下角的保存图标将shapes数组转为json字符串后保存至浏览器缓存localstorage（橡皮擦修改无效）

##### c.垃圾桶的两种使用方式：

（1）一般模式下为清空画板

（2）在左侧工具选中方块后为清除localstorage指定id的shapes

##### ps:

由于部分js库不支持ie，建议用Chrome浏览器运行

其他功能就不赘述了，自行探索即可 :)