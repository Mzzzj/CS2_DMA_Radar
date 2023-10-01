<!-- 测试页面 -->
<template>
	<div style="height: 100px;z-index: 999;">
		<div v-for="(item,index) in playerInfoList" :style="item.localPlayer?'color: red;font-weight: 700;':''">
			{{JSON.stringify(item)}}
		</div>
	</div>
	<div id="map"></div>
</template>

<script>
	import icon from "/green.png";
	var that;
	export default {
		components: {},

		data() {
			return {
				playerInfoList:[],
				MarkerList:[],
				socket: null,
				markerList: [],
				map: null,
				center: [300, 300],
				zoom: 1,
				markerUrl: L.icon({
					iconUrl: icon,
					iconSize: [18, 18],
				}),
				bgImg: "dust2.png",
				bounds: [
					[0, 0],
					[400, 400],
				],
				imageOverLay: null,
			};
		},

		computed: {},

		watch: {},

		//生命周期 - 创建完成（可以访问当前this实例）
		created() {

			// setInterval(() => {
			// 	this.markerList.forEach(marker => {
			// 		console.log(marker.getLatLng())
			// 		console.log(marker.getLatLng().lat)
			// 		console.log(marker.getLatLng().lng)
			// 		marker.setLatLng(L.latLng(marker.getLatLng().lat + 1, marker.getLatLng().lng + 1))
			// 	})
			// }, 500)
			
			
		},
		//生命周期 - 挂载完成（可以访问DOM元素）
		mounted() {
			that=this;
			this.init();
			this.websocket = new WebSocket("ws://127.0.0.1:8800")
			this.websocket.onmessage = (res) => {
				that.playerInfoList=JSON.parse(res.data).playerList;
				that.playerInfoList.forEach(item=>{
					if(item.localPlayer){
						//console.log(item.x+"----"+item.y)
						
						//let potin=L.latLng(item.x/8.69309, item.y/4.437411)
						//this.MarkerList[0].setLatLng(potin)
						//this.map.flyTo(potin,3);
					}
				})
				//4.16525 8.69309
				//this.$forceUpdate();
				//console.log(that.bounds)
			}
			this.websocket.onopen = () => {
				//this.map.removeLayer(this.MarkerList[0]);
				if (that.layerGroup !== null) {
					//that.layerGroup.clearLayers(); //批量移除图层
				}
				setInterval(()=>{
					this.websocket.send("1")
				},1000)
			}
			
		},
		methods: {
			// 初始化地图
			init() {
				this.map = L.map("map", {
					center: this.center,
					zoom: this.zoom,
					crs: L.CRS.Simple,
					bounds: this.bounds,
					maxZoom:3,
					minZoom: 1
				});
				//加载单张图
				this.imageOverLay = L.imageOverlay(this.bgImg, this.bounds, {
					interactive: true, //允许地图触发事件
				}).addTo(this.map);
				//   画marker
				
				//1561.9688----3059.9688
				//375,352
				//-1031.9688-----2203.8438
				//15,18
				//8.1599168 4.437411
				console.log(1561.9688+1031.9688)
				console.log(3059.9688-2203.8438)
				console.log(375-15)
				console.log(352-18)
				this.MarkerList.push(this.addMarker(15,18));
				that.layerGroup = L.layerGroup(this.MarkerList);
				that.map.addLayer(that.layerGroup);
			},
			addMarker(X,Y) {
				return L.marker([X,Y], {
					icon: this.markerUrl
				});
			},
		},
	};
</script>
<style scoped>
	#map {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 5;
		left: 0;
		z-index: 0;
	}
</style>