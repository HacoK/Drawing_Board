/**
 * Created by mengfanxu on 17/3/22.
 * # 为工具性方法
 */


$(function () {
    /**
     *  工具 currentToolNum
     *      1：普通笔
     *      2：毛笔
     *      3：方形
     *      4：橡皮擦
     *  线条宽度 lineWidth
     *  笔触颜色 pageLineColor
     *  填充颜色 pageFillColor
     */
    var xu = new Vue({
        el: '#drawing-board-page',
        data: {
            popupColorShow: false,
            popupColorType: '1', //1 为线条颜色
            popupColorPosition: {
                x: '535',
                y: '-516'
            },
            currentTool: 'iconfont icon-shouhui',
            currentToolNum: '1',
            tools: [
                {dataTool: '1', toolClass: 'iconfont icon-shouhui'},
                {dataTool: '2', toolClass: 'iconfont icon-maobi'},
                {dataTool: '3', toolClass: 'iconfont icon-fangkuai'},
                {dataTool: '4', toolClass: 'iconfont icon-xiangpicas'},
            ],
            selectedToolIndex: '0',
            lineWidth: '1',
            colors: ['#000000','#FFDAB9', '#E6E6FA', '#8470FF', '#00CED1', '#7FFFD4', '#00FF7F', '#FFD700', '#CD5C5C', '#BBFFFF',
                '#FFA500', '#FF0000', '#8A2BE2', '#EED5B7', '#F0FFDF', '#0000FF', '#00BFFF', '#AB82FF', '#E066FF',
                '#8B1C62', '#FF82AB', '#EE1289', '#EE0000', '#FF6347', '#FF7F00', '#00FF00', '#00FF7F', '#00FFFF'],
            pageColor: '000000',
            pageLineColor: '000000',
            pageFillColor: 'ffffff',
            newColor: '000000',
            RColor: '00',
            GColor: '00',
            BColor: '00',
            hexColorArr: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
            hexColorStr: '0123456789ABCDEF',
            shapes : [],
        },
        methods: {
            // 工具 ~选择
            selectTool: function (tool, index) {
                this.currentToolNum = tool.dataTool;
                this.currentTool = tool.toolClass;
                tool.selected = true;
                this.selectedToolIndex = index;
                if(index===0){
                    layer.msg('铅笔线条末端为平直边缘噢~', {icon: 6});
                }
                if(index===1){
                    layer.msg('毛笔线条末端为圆形线帽噢~', {icon: 6});
                }
                if(index===2){
                    layer.msg('可用垃圾桶删除缓存图片啦~', {icon: 6});
                }
                if(index===3){
                    layer.msg('橡皮擦擦除痕迹仍会被缓存噢~', {icon: 5});
                }
            },
            // 颜色选择器 ~出现
            clickPopupColorShow: function (e) {
                var currentBkColor = $(e.target).data('type') == '1' ? this.pageLineColor : this.pageFillColor;
                this.popupColorType = $(e.target).data('type');
                this.trBk = true;
                this.popupColorShow = true;
                this.pageColor = currentBkColor;
                this.RColor = this.getRGBColor(currentBkColor)[0];
                this.GColor = this.getRGBColor(currentBkColor)[1];
                this.BColor = this.getRGBColor(currentBkColor)[2];
            },
            // 颜色选择器 ~拖拽
            dragPopupColor: function (e) {
                var _this = this,
                    _self = $(e.target),
                    mouseX = _self.offset().left,
                    mouseY = _self.offset().top,
                    offsetX = mouseX - e.pageX,
                    offsetY = mouseY - e.pageY,
                    moving = true;
                document.onmousemove = function (e) {
                    if (!moving) return false;
                    mouseX = e.pageX + offsetX;
                    mouseY = e.pageY + offsetY;
                    _this.popupColorPosition.x = mouseX;
                    _this.popupColorPosition.y = mouseY;
                };
                document.onmouseup = function () {
                    moving = false;
                };
            },
            // 颜色选择器 ~确定
            colorConfirm: function () {
                this.popupColorShow = false;
                this.popupColorType == '1' ? this.pageLineColor = this.newColor
                    : this.pageFillColor = this.newColor;
            },
            // 颜色选择器 ~取消
            colorCancel: function () {
                this.popupColorShow = false;
            },
            // 颜色选择器 ~选择
            selectColor: function (e) {
                var selectedColor = this.getAttrValue($(e.target), 'backgroundColor');
                this.newColor = this.getHexColorFromRgb(selectedColor);
                this.RColor = this.getRGBColor(this.getHexColorFromRgb(selectedColor))[0];
                this.GColor = this.getRGBColor(this.getHexColorFromRgb(selectedColor))[1];
                this.BColor = this.getRGBColor(this.getHexColorFromRgb(selectedColor))[2];
            },
            // 颜色选择器 ~绑定
            bindHex: function (e) {
                this.newColor = $(e.target).val();
                this.RColor = this.getRGBColor($(e.target).val())[0];
                this.GColor = this.getRGBColor($(e.target).val())[1];
                this.BColor = this.getRGBColor($(e.target).val())[2];
            },
            bindRColor: function (e) {
                this.RColor = $(e.target).val();
                this.newColor = '' + this.getHexColorFromRgb([this.RColor, this.GColor, this.BColor]);
            },
            bindGColor: function (e) {
                this.GColor = $(e.target).val();
                this.newColor = '' + this.getHexColorFromRgb([this.RColor, this.GColor, this.BColor]);
            },
            bindBColor: function (e) {
                this.BColor = $(e.target).val();
                this.newColor = '' + this.getHexColorFromRgb([this.RColor, this.GColor, this.BColor]);
            },
            bindLineWidth: function (e) {
                this.lineWidth = $(e.target).val();
                const size = document.getElementById('size');
                size.style.transform = `scale(${$(e.target).val()/20})`;
            },

            //画板 ~绘制
            painting: function (e) {
                var _self = this,
                    canvas = $(e.target),
                    ctx = canvas[0].getContext('2d'),
                    canvasAttribute = {
                        width: parseInt(this.getAttrValue(canvas, 'width', 'px')),
                        height: parseInt(this.getAttrValue(canvas, 'height', 'px')),
                        left: parseInt(canvas.position().left),
                        top: parseInt(canvas.position().top)
                    },
                    lineWidth,//用于橡皮擦
                    mouseStyle = $('<div></div>'), //用于临时橡皮擦
                    moving = false;
                 var dot_num = 0;
                 var step = 2;
                 var markPath = [];
                $(document).on('mousedown', 'canvas', function (e) {
                    e.stopImmediatePropagation();
                    switch (_self.currentToolNum) {
                        case '1':
                            moving = true;
                            ctx.beginPath();
                            ctx.lineCap = "butt";
                            ctx.strokeStyle = '#' + _self.pageLineColor;
                            ctx.lineWidth = _self.lineWidth;
                            ctx.moveTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
                            markPath = [];
                            markPath.push(new Point((e.pageX - canvas.offset().left),(e.pageY - canvas.offset().top)));
                            break;
                        case '2':
                            moving = true;
                            ctx.beginPath();
                            ctx.lineCap = "round";
                            ctx.strokeStyle = '#' + _self.pageLineColor;
                            ctx.lineWidth = _self.lineWidth;
                            ctx.moveTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
                            markPath = [];
                            markPath.push(new Point((e.pageX - canvas.offset().left),(e.pageY - canvas.offset().top)));
                            break;
                        case '4':
                            moving = true;
                            ctx.beginPath();
                            lineWidth = _self.lineWidth < 10 ? 10 : _self.lineWidth;
                            ctx.lineCap = "round";
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = lineWidth;
                            ctx.moveTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
                            mouseStyle.css({
                                position: 'fixed',
                                width: lineWidth + 'px',
                                height: lineWidth + 'px',
                                backgroundColor: '#fff',
                                border: '1px solid #000',
                                borderRadius: '50%'
                            });
                            $('body').append(mouseStyle);
                            break;
                        default:
                            break;
                    }
                });
                $(document).on('mousemove', 'canvas', function (e) {
                    e.stopImmediatePropagation();
                    switch (_self.currentToolNum) {
                        case '1':
                        case '2':
                            if (!moving) return false;
                            ctx.lineTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
                            ctx.stroke();
                            if (dot_num == step) {
                                dot_num = 0;
                                markPath.push(new Point((e.pageX - canvas.offset().left),(e.pageY - canvas.offset().top)));
                            } else {
                                dot_num += 1;
                            }
                            break;
                        case '4':
                            if (!moving) return false;
                            mouseStyle.css({
                                left: e.pageX - lineWidth / 2 + 'px',
                                top: e.pageY - lineWidth / 2 + 'px'
                            });
                            ctx.lineTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
                            ctx.stroke();
                            break;
                        default:
                            break;
                    }
                });
                $(document).on('mouseup', function (e) {
                    e.stopImmediatePropagation();
                    switch (_self.currentToolNum) {
                        case '1':
                            ctx.closePath();
                            let type=(new DollarRecognizer().Recognize(markPath,true)).Name;
                            if(moving){
                                ctx.font = "20px Courier New";
                                let gradient=ctx.createLinearGradient(0,0,canvasAttribute.width,0);
                                gradient.addColorStop("0","magenta");
                                gradient.addColorStop("0.5","blue");
                                gradient.addColorStop("1.0","red");
                                ctx.fillStyle=gradient;
                                ctx.fillText(type,markPath[0].X, markPath[0].Y);
                                _self.shapes.push(new Shape(type,markPath,"butt",_self.pageLineColor,_self.lineWidth));
                            }
                            moving = false;
                            break;
                        case '2':
                            ctx.closePath();
                            let name=(new DollarRecognizer().Recognize(markPath,true)).Name;
                            if(moving){
                                ctx.font = "20px Courier New";
                                let gradient=ctx.createLinearGradient(0,0,canvasAttribute.width,0);
                                gradient.addColorStop("0","magenta");
                                gradient.addColorStop("0.5","blue");
                                gradient.addColorStop("1.0","red");
                                ctx.fillStyle=gradient;
                                ctx.fillText(name,markPath[0].X, markPath[0].Y);
                                _self.shapes.push(new Shape(name,markPath,"round",_self.pageLineColor,_self.lineWidth));
                            }
                            moving = false;
                            break;
                        case '4':
                            moving = false;
                            ctx.closePath();
                            mouseStyle.remove();
                            break;
                        default:
                            break;
                    }
                });
            },
            //画板 ~存储
            loadImage: function () {
                var _self=this;
                layer.prompt({
                    value: '',
                    title: '输入存储后的图片id噢~',
                }, function(value, index){
                    var storage=window.localStorage;
                    storage.setItem(value,JSON.stringify(_self.shapes));
                    layer.close(index);
                    layer.msg('图片已经缓存啦~', {icon: 6});
                });
            },
            // 画板 ~清屏
            clearScreen: function () {
                var _self=this;
                if(_self.currentToolNum!=3) {
                    var canvas = $(document).find('canvas'),
                        ctx = canvas[0].getContext('2d');
                    ctx.clearRect(0, 0, canvas.width(), canvas.height());
                    this.shapes = [];
                    layer.msg('画板已经清空喽~', {icon: 6});
                }else{
                    layer.prompt({
                        value: '',
                        title: '输入想要删除的图片id噢~',
                    }, function(value, index){
                        var storage=window.localStorage;
                        storage.removeItem(value);
                        layer.close(index);
                        layer.msg('已将指定id图片删除啦~', {icon: 6});
                    });
                }
            },
            //加载图片
            onload: function(){
                var _self=this;
                var storage=window.localStorage;
                var c=document.getElementById("drawing-board");
                var ctx=c.getContext("2d");
                if(storage.length!=0){
                var prompt="目前存储的图片id：</br>";
                for(var i=0;i<storage.length-1;i++){
                    prompt+=storage.key(i);
                    prompt+="</br>";
                }
                prompt+=storage.key(storage.length-1);
                layer.alert(prompt, {
                    icon: 6,
                    yes: function(index){
                        layer.close(index);
                        layer.prompt({
                            formType: 0,
                            value: '',
                            title: '输入想要加载的图片id噢~',
                        }, function(value, index){
                            var stored=storage.getItem(value);
                            var temp_shapes=JSON.parse(stored);
                            _self.shapes =_self.shapes.concat(temp_shapes);
                            for(var i=0;i<temp_shapes.length;i++){
                                var path=temp_shapes[i].Path;
                                ctx.beginPath();
                                ctx.lineCap = temp_shapes[i].LineCap;
                                ctx.strokeStyle = '#' + temp_shapes[i].StrokeStyle;
                                ctx.lineWidth = temp_shapes[i].LineWidth;
                                ctx.moveTo(path[0].X, path[0].Y);
                                for(var j=1;j<path.length;j++){
                                    ctx.lineTo(path[j].X, path[j].Y);
                                }
                                ctx.stroke();
                                ctx.closePath();
                                var type=temp_shapes[i].Type;
                                ctx.font = "20px Courier New";
                                var gradient=ctx.createLinearGradient(0,0,c.width,0);
                                gradient.addColorStop("0","magenta");
                                gradient.addColorStop("0.5","blue");
                                gradient.addColorStop("1.0","red");
                                ctx.fillStyle=gradient;
                                ctx.fillText(type,path[0].X, path[0].Y);
                            }
                            layer.close(index);
                            layer.msg('图片已经加载到画板啦~', {icon: 6});
                        });
                    }
                });}
                else{
                    layer.msg('目前还未存储图片噢~', {icon: 5});
                }
            },
            //下载图片
            download:function () {
                var _self = this;
                layer.prompt({
                    value: '',
                    title: '输入下载后图片名字噢~',
                }, function(value, index){
                    var canvas = $(document).find('canvas')[0];
                    type = 'png',
                        imageData = canvas.toDataURL(type).replace(_self.fixType(type), 'image/octet-stream'),
                        filename = '' + value + '.' + type;
                    _self.saveFile(imageData, filename);
                    layer.close(index);
                    layer.msg('图片已经在下载啦~', {icon: 6});
                });
            },
            fixType: function (type) {
                type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
                var r = type.match(/png|jpeg|bmp|gif/)[0];
                return 'image/' + r;
            },
            saveFile: function (data, filename) {
                var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
                save_link.href = data;
                save_link.download = filename;
                var event = document.createEvent('MouseEvents');
                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                save_link.dispatchEvent(event);
            },
            //=========== 方法区 ===========
            // 获取属性的具体数值 #
            getAttrValue: function (target, attr, unit) {
                unit = unit || "";
                return '' + target.css(attr).replace(unit, '');
            },
            // 获取颜色值得具体数值 #
            getColorValue: function (str) {
                return str.replace('#', '');
            },
            //判断16进制数的合法性 #
            hexColorValueValid: function (hexColorValue) {
                if (hexColorValue.length > 6) return false;
                for (var i = 0, len = hexColorValue.length; i < len; i++) {
                    if (this.hexColorStr.indexOf(hexColorValue.toUpperCase().charAt(i)) == -1) return false;
                }
                return true;
            },
            // 获取RGB颜色值 hexColorValue:'000000'
            getRGBColor: function (hexColorValue) {
                //不非法直接返回黑色
                if (!this.hexColorValueValid(hexColorValue)) return ['00', '00', '00'];

                // 获取RGB值
                var tempR, tempG, tempB,
                    hexColorValueTemp = hexColorValue || '000000'; //默认为黑色
                switch (hexColorValueTemp.length) {
                    case 1:
                        tempR = tempG = tempB = this.calRGBValue(hexColorValueTemp.toUpperCase().repeat(2));
                        break;
                    case 2:
                        tempR = tempG = tempB = this.calRGBValue(hexColorValueTemp.toUpperCase());
                        break;
                    case 3:
                        tempR = this.calRGBValue(hexColorValueTemp.substring(0, 1).toUpperCase().repeat(2));
                        tempG = this.calRGBValue(hexColorValueTemp.substring(1, 2).toUpperCase().repeat(2));
                        tempB = this.calRGBValue(hexColorValueTemp.substring(2, 3).toUpperCase().repeat(2));
                        break;
                    case 6:
                        tempR = this.calRGBValue(hexColorValueTemp.substring(0, 2).toUpperCase());
                        tempG = this.calRGBValue(hexColorValueTemp.substring(2, 4).toUpperCase());
                        tempB = this.calRGBValue(hexColorValueTemp.substring(4, 6).toUpperCase());
                        break;
                    default:
                        tempR = tempG = tempB = '00';
                        break;
                }
                return [tempR, tempG, tempB];
            },
            // 获取16进制颜色值
            getHexColorFromRgb: function (RgbColor) {
                var tempR, tempG, tempB;
                if (RgbColor.indexOf('rgb') != -1) {
                    tempR = this.RGBReg(RgbColor)[0];
                    tempG = this.RGBReg(RgbColor)[1];
                    tempB = this.RGBReg(RgbColor)[2];
                } else {
                    tempR = RgbColor[0];
                    tempG = RgbColor[1];
                    tempB = RgbColor[2];
                }
                return '' + this.calHexValue(tempR) + this.calHexValue(tempG) + this.calHexValue(tempB);
            },

            // 计算RGB数值 #
            calRGBValue: function (hexVal) {
                var result = this.getHexIndex(hexVal.charAt(0)) * 16 + this.getHexIndex(hexVal.charAt(1));
                return result >= 10 ? result : '0' + result;
            },
            // 根据位置获得16进制数 #
            getHexValue: function (index) {
                return this.hexColorStr.charAt(index);
            },
            // 把RGB其中一项转化成16进制数 #
            calHexValue: function (val) {
                return this.getHexValue(this.getInt16(val)) + this.getHexValue(this.getRem16(val));
            },
            //获得数字对应的16进制数列表的位置 #
            getHexIndex: function (value) {
                return this.hexColorStr.indexOf(value);
            },
            // 取整 #
            getInt16: function (num) {
                return Math.floor(num / 16);
            },
            // 取余 #
            getRem16: function (num) {
                return num % 16;
            },
            //正则匹配RGB颜色值 #
            /**
             *
             * @param str rgb(n,n,n)
             * @returns {Array} [n,n,n]
             */
            RGBReg: function (str) {
                return str.match(/\d+/g);
            },
            HexReg: function (str) {
                return str.match(/\w+/g);
            },
        }
    });
    created: {
        const size = document.getElementById('size');
        size.style.transform = `scale(${1/20})`;
        window.localStorage.clear();
    }
});