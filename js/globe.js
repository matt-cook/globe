var LABEL_ZOOM_ALTITUDE = 500000;
var LABEL_ALTITUDE = 25000; //in meters
var MAX_LABEL_SIZE = 1.25;
var MIN_LABEL_SIZE = 0.75;

var route = {
	"christiana": [[59.852012, 10.607650],[59.798170, 10.560958],[59.727631, 10.558212],[59.622932, 10.624130],[59.430015, 10.532119],[59.205072, 10.635116],[58.589941, 9.876711]],
	"arendal": [[58.267834, 8.898928]],
	"kristiansand": [[56.497599, 6.822512],[54.122449, 7.987063],[53.870583, 9.041751],[53.857625, 9.305422],[53.591115, 9.607546]],
	"hamburg": [[53.591115, 9.607546],[53.857625, 9.305422],[53.870583, 9.041751],[53.991894, 5.081285],[51.038227, 1.719470],[49.947980, -1.752210],[47.350299, -15.507093],[34.772241, -57.664898]],
	"new-york": [[40.608892, -87.723492],[41.491916, -89.305523]],
	"stoughton": []
};

var lines = {};

var SETTINGS = {};
SETTINGS["Outline Norway"] = false;
SETTINGS["Zoom Duration"] = 10.0;
SETTINGS["Video Transition"] = 30; //point at which video is solid white, in seconds
var isZoomed = false;
SETTINGS["Zoom"] = function(){
	if(isZoomed){
		$("#content").transition({opacity:0});
		viewer.scene.camera.flyTo({
			destination : start.position,
			direction: start.direction,
			up: start.up,
			duration: SETTINGS["Zoom Duration"]
		});
	}else{
		var v = document.getElementById('zoom');
		v.playbackRate = v.duration/SETTINGS["Zoom Duration"];
		v.currentTime = 0;
		v.onended = function(){
			document.getElementById('zoom').pause();
		}
		v.addEventListener('timeupdate',function(){
			var v = document.getElementById('zoom');
			if(v.currentTime >= SETTINGS["Video Transition"]){
				v.pause();
				$("#content").css({opacity:1});
				v.play();
			}
		});
		v.play();
		viewer.scene.camera.flyTo({
			destination : new Cesium.Cartesian3(3171739,362164.0727772717,5505013.132590841),
			duration: SETTINGS["Zoom Duration"]
		});
	}
	isZoomed = !isZoomed;
};

var viewer = new Cesium.Viewer('map', {
	animation:false,
		baseLayerPicker:false,
		fullscreenButton:false,
		geocoder:false,
		homeButton:false,
		infoBox:false,
		sceneModePicker:false,
		selectionIndicator:false,
		timeline:false,
		navigationHelpButton:false,
		navigationInstructionsInitiallyVisible:false,
		contextOptions :{
			webgl : {
				alpha : true,
        preserveDrawingBuffer: true
			}
		},
		imageryProvider : new Cesium.TileMapServiceImageryProvider({
			url : './tiles',
		maximumLevel: 8
		}),
		baseLayerPicker : false
});
//viewer.resolutionScale = 2.0;
var start = {}; //norway starting position
start.position = new Cesium.Cartesian3(4386332.163006191,1188368.0173394924,6153437.48635143);
start.direction = new Cesium.Cartesian3(-0.9008236819028285,-0.3410092694636061,-0.2687552274150766);
start.up = new Cesium.Cartesian3(-0.2423848364942298,-0.1185885488280502,0.9629051599843687);

viewer.scene.skyBox.destroy();
viewer.scene.skyBox = undefined;
viewer.scene.sun.destroy();
viewer.scene.sun = undefined;
viewer.scene.moon.destroy();
viewer.scene.moon = undefined;
viewer.scene.skyAtmosphere.destroy();
viewer.scene.skyAtmosphere = undefined;
viewer.scene.backgroundColor = new Cesium.Color(0,0.0,0,0.0);

/*var terrainProvider = new Cesium.CesiumTerrainProvider({
	url : '//cesiumjs.org/tilesets/terrain/smallterrain'
	});
	viewer.scene.terrainProvider = terrainProvider;*/

var ds = new Cesium.GeoJsonDataSource();
ds.loadUrl('./norway.json').then(function(){
  var e = ds.entities.entities;
  for (var i = 0; i < e.length; i++) {
    var color = Cesium.Color.fromRandom({
      alpha : 1.0
    });
    e[i].polygon.material = Cesium.ColorMaterialProperty.fromColor(color);
  }
});

window.onload = function() {
	var gui = new dat.GUI();
	var f0 = gui.addFolder('Camera');
	var f1 = f0.addFolder('Positon');
	gui.remember(viewer.scene.camera.position);
	f1.add(viewer.scene.camera.position, 'x').listen();
	f1.add(viewer.scene.camera.position, 'y').listen();
	f1.add(viewer.scene.camera.position, 'z').listen();
	var f1 = f0.addFolder('Direction');
	gui.remember(viewer.scene.camera.direction);
	f1.add(viewer.scene.camera.direction, 'x').listen();
	f1.add(viewer.scene.camera.direction, 'y').listen();
	f1.add(viewer.scene.camera.direction, 'z').listen();
	var f1 = f0.addFolder('Up');
	gui.remember(viewer.scene.camera.up);
	f1.add(viewer.scene.camera.up, 'x').listen();
	f1.add(viewer.scene.camera.up, 'y').listen();
	f1.add(viewer.scene.camera.up, 'z').listen();
	gui.add(SETTINGS,'Outline Norway').onChange(function(value) {
		if(value) viewer.dataSources.add(ds);
		else viewer.dataSources.remove(ds);
	});
	gui.add(SETTINGS,'Zoom');
	gui.add(SETTINGS,'Zoom Duration',0.1,30.0);
  gui.add(viewer,'resolutionScale',0.01,3.0);
};

viewer.scene.camera.flyTo({
	destination : start.position,
	direction: start.direction,
	up: start.up
});

 /*var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
	 handler.setInputAction(function(movement) {

	 var c = viewer.scene.camera;
	 console.log("--------------");
	 //camera height in meters
	 var height = viewer.scene.globe.ellipsoid.cartesianToCartographic(viewer.scene.camera.position).height;
	 console.log('height',height);
	 console.log('position',c.position);
	 console.log('up',c.up);
	 console.log('direction',c.direction);
	 console.log('viewMatrix',c.viewMatrix);

	 }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);*/


//This is the accessor function we talked about above
var lineFunction = d3.svg.line()
	.x(function(d) { return d.x; })
	.y(function(d) { return d.y; })
	.interpolate("basis");

	//The SVG Container
	var svgContainer = d3.select("body").append("svg")
	.attr("class","container");


	var force = d3.layout.force();


	// Ellipsoid radii - WGS84 shown here

	var scale = 1.00; //hide point before reaching edge

	var rX = 6378137.0 * scale;
	var rY = 6378137.0 * scale;
	var rZ = 6356752.3142451793 * scale;

  var glowContext = document.getElementById('glow').getContext('2d');

	viewer.scene.postRender.addEventListener(function(scene,time) {

    //draw to glow canvas
    glowContext.canvas.width  = window.innerWidth;
    glowContext.canvas.height = window.innerHeight;
    glowContext.drawImage(scene.canvas, 0, 0);

		var height = scene.globe.ellipsoid.cartesianToCartographic(scene.camera.position).height;

		// Vector CV
		var cvX = viewer.scene.camera.position.x / rX;
		var cvY = viewer.scene.camera.position.y / rY;
		var cvZ = viewer.scene.camera.position.z / rZ;

		var vhMagnitudeSquared = cvX * cvX + cvY * cvY + cvZ * cvZ - 1.0;

		function getPointPosition($p,height){

			var p = getCartesian(parseFloat($p.data('latitude')),parseFloat($p.data('longitude')),height);

			// Target position, transformed to scaled space
			var tX = p.x / rX;
			var tY = p.y / rY;
			var tZ = p.z / rZ;

			// Vector VT
			var vtX = tX - cvX;
			var vtY = tY - cvY;
			var vtZ = tZ - cvZ;
			var vtMagnitudeSquared = vtX * vtX + vtY * vtY + vtZ * vtZ;

			// VT dot VC is the inverse of VT dot CV
			var vtDotVc = -(vtX * cvX + vtY * cvY + vtZ * cvZ);

			var isOccluded = vtDotVc > vhMagnitudeSquared &&
				vtDotVc * vtDotVc / vtMagnitudeSquared > vhMagnitudeSquared;
			var p = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, p);
			if(p && p.x && p.y)
				return {
					x: p.x,
						y: p.y,
						visible: !isOccluded
				}
			else return;
		}

		function getCartesian(latitude,longitude,height){
			latitude = latitude * (Math.PI / 180); //radians
			longitude = longitude * (Math.PI / 180);
			return viewer.scene.globe.ellipsoid.cartographicToCartesian(new Cesium.Cartographic(longitude,latitude,height));
		}

		function getCartPosition(latitude,longitude){
			var p = getCartesian(latitude,longitude);
			return Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, p);

		}

		var lineData = [];

		$('.point').each(function(){
			var $p = $(this);
			var $l =  $('.label[data-city="'+$p.data('city')+'"');
			var p = getPointPosition($p);
			var l = getPointPosition($p,LABEL_ALTITUDE);
      if(p && l){
        if(p.x > w || p.x < 0 || p.y > h || p.y < 0) p.visible = false;
        $p.css({
          left: p.x+'px',
          top: p.y+'px'
        });
        $l.css({
          left: (l.x-$l.width()/2)+'px',
          top: (l.y-15)+'px',
          scale: MIN_LABEL_SIZE + (MAX_LABEL_SIZE - MIN_LABEL_SIZE) * (LABEL_ZOOM_ALTITUDE / height)
        });
        if(p.visible) {
          $l.fadeIn();
          $p.fadeIn();
        }else{
          $l.fadeOut();
          $p.fadeOut();
        }
      }

		});

		var prevCity, prevP, prevPoints;
		var h = $('.container').height();
		var w = $('.container').width();
		$.each(route,function(city,points){
			var p = getPointPosition($('.'+city));
			if(p){
				if(p.x > w || p.x < 0 || p.y > h || p.y < 0) p.visible = false;
				if(prevP){
					if(!lines[prevCity]) lines[prevCity] = {};
					if(!lines[prevCity][city]) lines[prevCity][city] = svgContainer.append("path")
			.attr("stroke", "yellow")
			.attr("stroke-width", 3)
			//.style("stroke-dasharray", ("10, 8"))
			.attr("fill", "none");
		var lineData = [];
		lineData.push({
			"x": prevP.x,
			"y": prevP.y
		});
		$.each(prevPoints,function(i,v){
			var v = getCartPosition(v[0],v[1]);
      if(v && v.x && v.y){
        lineData.push({
          "x": v.x,
          "y": v.y
        });
      }
		});
		lineData.push({
			"x": p.x,
			"y": p.y
		});
		lines[prevCity][city].attr("d", lineFunction(lineData));
		if(p.visible && prevP.visible){
			lines[prevCity][city].transition().style("opacity",1).duration(100);
		}else{
			lines[prevCity][city].transition().style("opacity",0).duration(100);
		}
				}
				prevCity = city;
				prevP = p;
				prevPoints = points;
			}
		});


	});
