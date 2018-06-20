/**
 * SiloHouse
 */
function SiloHouse(obj) {
    this.name = obj.name;
    this.obj = obj;
    obj.siloHouse = this;
    this.height = obj.size[1];

    this.roof = obj.findSubObjects('gaizi')[0];
    this.roof.initPos = this.roof.position; 

    this.temper = this.humi = this.power = this.store = "";
    this.info = null;

    this.heatMap = null;
    this.panel = null;
    this.ui = null;
    this.setupEvents();
    this.simulateData();
}

SiloHouse.current = null;      
SiloHouse.currentOpen = null;   
SiloHouse.summeryPanel = null;  


SiloHouse.prototype.select = function () {
    this.obj.style.outlineColor = 0x0000FF;
    this.showSummery(true);
}

SiloHouse.prototype.unselect = function () {
    this.obj.style.outlineColor = null;
    this.showSummery(false);
}


SiloHouse.prototype.openRoof = function () {
    var pos = this.roof.position;
    pos[1] += 80;
    this.roof.moveTo({ 'position': pos, 'time': 300 });
}

SiloHouse.prototype.resetRoof = function () {
    var pos = this.roof.initPos;
    this.roof.moveTo({ 'position': pos, 'time': 300 });
    this.destroyHeatmap(); 
}


SiloHouse.prototype.setupEvents = function (obj) {
    var that = this;
    var obj = this.obj;


    obj.on('singleclick', function () {
        if (SiloHouse.current)
            SiloHouse.current.unselect();
        SiloHouse.current = that;
        SiloHouse.current.select();
    });

   
    obj.on('dblclick', function () {
        if (SiloHouse.currentOpen == that)
            return;

       
        if (SiloHouse.current) {
            SiloHouse.current.unselect();
            SiloHouse.current = null;
        }


        if (SiloHouse.currentOpen)
            SiloHouse.currentOpen.resetRoof();
        SiloHouse.currentOpen = that;

        that.openRoof();

    
        var pos = SiloHouse.currentOpen.obj.position;
        app.camera.flyTo({
            position: [pos[0], pos[1] + 70, pos[2] - 30],
            target: pos,
            time: 1000,	
            complete: function () {
                if (toolBar.data.cloud == true)
                    SiloHouse.currentOpen.createHeatmap();
            }
        });
    });
}


SiloHouse.prototype.simulateData = function (obj) {
    var that = this;
    this.info = {
        "Overview": {
            "Category": Math.ceil(Math.random() * 2) == 1 ? "Wheat" : "Corn",
            "Quantity": Math.ceil(Math.random() * 9000) + "",
            "Owner": Math.ceil(Math.random() * 2) == 1 ? "Alice" : "Bob",
            "Time": Math.ceil(Math.random() * 2) == 1 ? "11:24" : "19:02",
            "Power Usage": Math.ceil(Math.random() * 100) + "",
            "Comments": "N/A"
        },
        "Status": {
            "Indoor Temperature": Math.ceil(Math.random() * 27 + 25) + "",
            "Grain Temperature": Math.ceil(Math.random() * 25 + 20) + "",
        },
        "Alarms": {
            "Fire": "none",
            "Pest": "none"
        }
    };

   
    var simuTime = Math.ceil(1000 + Math.random() * 1000);
    setInterval(function () {
        that.temper = Math.ceil(20 + Math.random() * 10) + "℃"; 
        that.humi = Math.ceil(30 + Math.random() * 10) + "%"; 
        that.power = Math.ceil(Math.random() * 20) + "KW/h"; 
    }, simuTime);

}


SiloHouse.prototype.createUI = function (width) {
    width = width || 110;
    var panel = THING.widget.Panel({
        cornerType: 's2c3',
        width: width.toString() + "px",
        isClose: false,
        opacity: 0.8,
        media: true
    });
    this.panel = panel;

    var ui = app.create({
        type: 'UI',
        parent: this.obj,
        el: panel.domElement,
        offset: [0, this.height, 0],
        pivot: [0, 3]
    });
    this.ui = ui;
    return panel;
}

SiloHouse.prototype.showUI = function (uiName, boolValue) {
    if (this.panel || this.ui)
        this.hideUI();

        if (boolValue) {
            if (uiName == 'number') {
                this.createUI(70).add(this.obj, 'name').name('');
            } else if (uiName == 'temper') {
                this.createUI().add(this, uiName).name('Temp');
            } else if (uiName == 'humi') {
                this.createUI().add(this, uiName).name('Hum');
            } else if (uiName == 'power') {
                this.createUI(150).add(this, uiName).name('Power');
            }
        }
}

SiloHouse.prototype.hideUI = function () {
    if (this.panel) {
        this.panel.destroy();
        this.panel = null;
    }
    if (this.ui) {
        this.ui.destroy();
        this.ui = null;
    }
}


SiloHouse.prototype.createHeatmap = function () {
    this.heatMap = app.create({
        type: "Heatmap",
        width: this.obj.size[0],
        height: this.obj.size[2],
        minValue: 15,
        maxValue: 45,
        radius: 1.2
    });
    this.heatMap.randomData();

    this.heatMap.position = this.obj.position;
    this.heatMap.moveY(this.obj.size[1] + 1);
    this.heatMap.rotateX(90);
}

SiloHouse.prototype.destroyHeatmap = function () {
    if (!this.heatMap)
        return;
    this.heatMap.destroy();
    this.heatMap = null;
}

SiloHouse.prototype.showSummery = function (boolValue) {
    if (SiloHouse.summeryPanel) {
        SiloHouse.summeryPanel.destroy();
        SiloHouse.summeryPanel = null;
    }

    if (boolValue) {
        SiloHouse.summeryPanel = THING.widget.Panel({
            name: this.name,
            isClose: true,
            isDrag: true,
            isRetract: true,
            hasTitle: true,
            width: "300px",
            media: true
        });
        SiloHouse.summeryPanel.setZIndex(999999);
        SiloHouse.summeryPanel.addTab(this.info);
        SiloHouse.summeryPanel.setPosition({ left: 300, top: 50 });
    }
}

// ----------------------------------------------------------------------------

function VideoCamera(obj) {
    this.obj = obj;
    this.videoFrame = null;
    var that = this;

    this.marker = app.create({
        type: "Marker",
        position: [0, 3.5, 0],
        size: 8,
        url: "https://speech.uinnova.com/static/images/videocamera.png",
        parent: obj
    });
    this.marker.visible = false;
    this.marker.on('click', function () {
        that.showVideoFrame();
    });
}

VideoCamera.prototype.showUI = function (boolValue) {
    this.marker.visible = boolValue;
}

VideoCamera.prototype.showVideoFrame = function () {
    if (this.videoFrame) {
        this.videoFrame.destroy();
        this.videoFrame = null;
    }
    this.videoFrame = THING.widget.Panel({
        name: this.obj.name,
        isClose: true,
        isDrag: true,
        hasTitle: true,
        width: "538px",
        media: true
    });
    var ui2data = { iframe: true };
    var videoUrlList = ["http://3811.liveplay.myqcloud.com/live/m3u8/3811_channel1229.m3u8?AUTH=uJ35fEKPBnilpM4wHenr9hDvIYSpGWLpP7L0ylD7/tO4Q2Gj/dUXjTdCg6uz9x29lgQveYHXx+EH7cLTYS6nig==", "http://3811.liveplay.myqcloud.com/live/m3u8/3811_channel504.m3u8?AUTH=+zCa41hwuZqq6rGUjQQWJxjWwOtd3pTE2z+wimhoEktUr2GPhSmSH0gjgo1KKRm240hwNqSzYR+zAXZ0KkTkjg==", "http://3811.liveplay.myqcloud.com/live/m3u8/3811_channel1549.m3u8?AUTH=NI/a4EhZC0Dpx7UgWyj4uxouAyaALSY+wJMlgnLI2vh0s+gIr3YRnp0K3F09PFjqJ0pBbg8DSCWV+NGsymD5Ng=="];//
    this.videoFrame.addIframe(ui2data, 'iframe').name("　").iframeUrl('http://www.thingjs.com/demos/player/player.html?url=' + videoUrlList[parseInt((videoUrlList.length) * Math.random())]).setHeight('321px');
    this.videoFrame.setPosition({ left: app.domElement.offsetWidth - this.videoFrame.domElement.offsetWidth - 100, top: 100 });
    this.videoFrame.setZIndex(999999);

    var that = this;
    this.videoFrame.bind('close', function () {
        if (that.videoFrame) {
            that.videoFrame.destroy();
            that.videoFrame = null;
        }
    });
}

// ----------------------------------------------------------------------------
function Truck(obj) {
    this.obj = obj;
    this.info = { "Plate": "A12345", "Owner": "uinnova Inc.", "Status": "idle", "ID": "#1", "Weight": "Okey" };
}

Truck.prototype.createUI = function (width) {

    var panel = THING.widget.Panel({
        cornerType: 's2c3',
        width: "350px",
        isClose: false,
        opacity: 0.8,
        media: true
    });
    for (var key in this.info)
        panel.add(this.info, key);
    this.panel = panel;


    var ui = app.create({
        type: 'UI',
        parent: this.obj,
        el: panel.domElement,
        offset: [0, this.height, 0],
        pivot: [0, 1.45]
    });
    this.ui = ui;
    return panel;
}

Truck.prototype.showUI = function (boolValue) {
    if (this.ui || this.panel)
        this.hideUI();
    if (boolValue)
        this.createUI();
}

Truck.prototype.hideUI = function (width) {
    this.panel.destroy();
    this.panel = null;
    this.ui.destroy();
    this.ui = null;
}

//-----------------------------------------------------------------------------
var toolBarState = true;
var startFps = false;
var fpsControl = null;

var app = new THING.App({
    container: "div3d",
    skyBox: 'BlueSky',
    url: "https://uinnova-model.oss-cn-beijing.aliyuncs.com/scenes/silohouse",
    ak: "app_test_key",
    sucess: function () {
        app.camera.position = [98.5, 176.3, 218.5];
        app.camera.target = [19.7, -47.8, -22.5];
    }
});


app.on('load', function () {
    init();
    init_gui();
});

var siloHouseList = [];
var videoCameraList = [];
var truckList = [];
function init() {
    app.camera.flyTo({
        time: 1500,
        position: [-182.16900300883736, 53.24677728392183, 72.21965470775368],
        target: [-68.1412926741533, -18.16319203074775, -23.30416731768694]
    });

    app.setPostEffect({
        enable: true,
        antialias: {
            enable: true,
            type: 'FXAA',
        },
        colorAdjustment: {
            enable: true,
            brightness: 0,
            contrast: 1.15,
            exposure: 0,
            gamma: 1,
            saturation: 1.3
        },
        screenSpaceAmbientOcclusion: {
            enable: false
        }
    });

    app.setLighting({
        ambientLight: {
            intensity: 0.4,
            color: '#FFFFFF',
        },
        mainLight: {
            shadow: true,
            intensity: 0.6,
            color: '#FFFFFF',
            alpha: 45,
            beta: 0,
        },
        secondaryLight: {
            shadow: false,
            intensity: 0,
            color: '#FFFFFF',
            alpha: 0,
            beta: 0,
        }
    });

    app.query("[物体类型=粮仓]").forEach(function (obj) {
        var siloHouse = new SiloHouse(obj);
        siloHouseList.push(siloHouse);
    });


    app.query("[物体类型=摄像头]").forEach(function (obj) {
        videoCameraList.push(new VideoCamera(obj));
    });

    create_truck();
    app.query("[物体类型=卡车]").forEach(function (obj) {
        truckList.push(new Truck(obj));
    });

    // ----------------------------------------------------------------------------------

    app.on('singleclick', function (event) {
        if (event.object == null || event.object.attr('物体类型') != '粮仓') {
            if (SiloHouse.current) {
                SiloHouse.current.unselect();
                SiloHouse.current = null;
            }
        }
    });


    app.on('dblclick', function (event) {
        if (event.object == null || event.object.attr('物体类型') != '粮仓') {
            if (SiloHouse.currentOpen) {
                SiloHouse.currentOpen.resetRoof();
                SiloHouse.currentOpen = null;
            }
        }
    });

    var mouseDownPos = null;
    app.on('mousedown', function (event) {
        if (event.button == 2)
            mouseDownPos = [event.x, event.y];
    });
    app.on('click', function (event) {
        if (event.button == 2 && Math.getDistance(mouseDownPos, [event.x, event.y]) < 4) { // 小于4像素执行click事件
            if (SiloHouse.currentOpen) {
                SiloHouse.currentOpen.resetRoof();
                SiloHouse.currentOpen = null;
            }
        }
    });

    document.body.oncontextmenu = function (evt) {
        evt = evt || event;
        evt.returnValue = false;
        return false;
    };


    fpsControl = new THING.FPSControl({
        startPos: [0, 18, 0]
    });
}

// ----------------------------------------------------------------------------------

var positionList = [];
var truckInfo = { "Plate": "A12345", "Owner": "uinnova Inc.", "Status": "idle", "ID": "#1", "Weight": "Okey" };
var wayPointList = ["L109", "L110", "L104", "L103", "L102", "L108", "L109", "L118", "L119", "L112", "L111", "L117", "L118"];
function create_truck() {
    var path = [];
    for (var i = 0; i < wayPointList.length; i++) {
        var pObj = app.query(wayPointList[i])[0];
        if (!pObj)
            continue;
        path.push(pObj.position);
    }

    truck = app.create({
        type: 'Thing',
        name: "truck",
        url: "https://speech.uinnova.com/static/models/truck"
    });
    truck.movePath({
        'orientToPath': true,
        'orientToPathDegree': 180,
        'path': path,
        'speed': 20,
        'delayTime': 500,
        'lerp': false,
        'loop': true
    });
    truck.attr('物体类型', '卡车');
}


var toolBar = null;
function init_gui() {
    var baseURL = "http://47.93.162.148:8081/liangyw/images/button/";
    toolBar = THING.widget.ToolBar({ media: true });
    toolBar.data = { number: false, temper: false, humi: false, power: false, store: false, video: false, cloud: false, location: false };
    var img0 = toolBar.addImageBoolean(toolBar.data, 'number').name('WID').imgUrl(baseURL + 'warehouse_code.png');
    var img1 = toolBar.addImageBoolean(toolBar.data, 'temper').name('Temp').imgUrl(baseURL + 'temperature.png');
    var img2 = toolBar.addImageBoolean(toolBar.data, 'humi').name('Humidity').imgUrl(baseURL + 'humidity.png');
    var img3 = toolBar.addImageBoolean(toolBar.data, 'power').name('Power').imgUrl(baseURL + 'statistics.png');
    var img4 = toolBar.addImageBoolean(toolBar.data, 'store').name('Capacity').imgUrl(baseURL + 'cereals_reserves.png');
    var img5 = toolBar.addImageBoolean(toolBar.data, 'video').name('Livefeed').imgUrl(baseURL + 'video.png');
    var img6 = toolBar.addImageBoolean(toolBar.data, 'cloud').name('HeatMap').imgUrl(baseURL + 'cloud.png');
    var img7 = toolBar.addImageBoolean(toolBar.data, 'location').name('Locating').imgUrl(baseURL + 'orientation.png');
    img0.onChange(function (boolValue) { onChangeImageButton('number', boolValue); });
    img1.onChange(function (boolValue) { onChangeImageButton('temper', boolValue); });
    img2.onChange(function (boolValue) { onChangeImageButton('humi', boolValue); });
    img3.onChange(function (boolValue) { onChangeImageButton('power', boolValue); });
    img4.onChange(function (boolValue) { onChangeImageButton('store', boolValue); });
    img5.onChange(function (boolValue) { onChangeImageButton('video', boolValue); });
    img6.onChange(function (boolValue) { onChangeImageButton('cloud', boolValue); });
    img7.onChange(function (boolValue) { onChangeImageButton('location', boolValue); });
}

function onChangeImageButton(key, boolValue) {
    if (boolValue) {
        for (var elem in toolBar.data) {
            if (elem == "cloud" || elem == "location" || elem == key)
                continue;
            toolBar.data[elem] = false;
        }
    }

    if (key == "cloud") { 
        if (!boolValue) {
            if (SiloHouse.currentOpen)
                SiloHouse.currentOpen.destroyHeatmap();
        } else {
            if (SiloHouse.currentOpen && app.camera.flying == false)
                SiloHouse.currentOpen.createHeatmap();
        }
    } else if (key == "location") { 
        truckList.forEach(function (tr) {
            tr.showUI(boolValue);
        });
    } else if (key == "video") { 
        videoCameraList.forEach(function (vc) {
            vc.showUI(boolValue);
        });
    } else if (key == "store") { 
        siloHouseList.forEach(function (siloHouse) {
            siloHouse.hideUI();
            siloHouse.obj.visible = !boolValue;
        });
    } else { 
        siloHouseList.forEach(function (siloHouse) {
            siloHouse.showUI(key, boolValue);
        });
    }
}

function changeFPS(start) {
    if (start) {
        app.addControl(fpsControl);
    } else {
        app.removeControl(fpsControl);
    }
}