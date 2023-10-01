<!-- 测试页面 -->
<template>
	<div id="map"></div>
</template>

<script>
	import icon from "leaflet/dist/images/marker-icon-2x.png";
	export default {
		components: {},

		data() {
			return {
				markerList:[],
				map: null,
				center: [300, 300],
				zoom: 1,
				markerUrl: L.icon({
					iconUrl: icon,
					iconSize: [12, 12],
				}),
				bgImg: "dust2.png",
				bounds: [
					[0, 0],
					[400, 400],
				],
				imageOverLay: null,
				pleyarX:30,
				playerY:30
			};
		},

		computed: {},

		watch: {},

		//生命周期 - 创建完成（可以访问当前this实例）
		created() {
			setInterval(()=>{
				this.markerList.forEach(marker=>{
					console.log(marker.getLatLng())
					console.log(marker.getLatLng().lat)
					console.log(marker.getLatLng().lng)
					marker.setLatLng(L.latLng(marker.getLatLng().lat+1,marker.getLatLng().lng+1))
				})
			},500)
			//setInterval(()=>{
			//	this.pleyarX+=1;
			//	this.playerY+=1;
			//	console.log(this.pleyarX)
			//	console.log(this.playerY)
			//},500)
		},
		//生命周期 - 挂载完成（可以访问DOM元素）
		mounted() {
			this.init();
			
		},

		methods: {
			// 初始化地图
			init() {
				this.map = L.map("map", {
					center: this.center,
					zoom: this.zoom,
					crs: L.CRS.Simple,
					bounds: this.bounds,
					minZoom: 1,
				});
				//加载单张图
				this.imageOverLay = L.imageOverlay(this.bgImg, this.bounds, {
					interactive: true, //允许地图触发事件
				}).addTo(this.map);
				//   画marker
				this.drawMarker();
			},
			drawMarker() {
				//模拟数据
				let arr = [{
					point: [0, 0]
				}, {
					point: [30,30]
				}];
				for (let i = 0; i < arr.length; i++) {
					const marker = L.marker(arr[i].point, {
						icon: this.markerUrl
					}).addTo(
						this.map
					);
					this.markerList.push(marker);
				}
			},
		},
	};
</script>
<style scoped>
	#map {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: 0;
	}
</style>