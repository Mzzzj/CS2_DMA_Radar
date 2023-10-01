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
	import localPlayerIcon from '/src/icon/green.png'
	import enemyicon from '/src/icon/red.png'
	import axios from 'axios';
	var that;
	export default {
		components: {},

		data() {
			return {
				playerInfoList: [],
				MarkerList: [],
				socket: null,
				markerList: [],
				map: null,
				center: [0, 0],
				zoom: 1,
				bgImg: "dust2.png",
				bounds: [
					[-115, -240],
					[335, 210],
				],
				imageOverLay: null,
			};
		},

		computed: {},

		watch: {},

		//生命周期 - 创建完成（可以访问当前this实例）
		created() {
			setInterval(() => {
				axios.get("http://127.0.0.1:8080/getGameData").then(response => {
					let MarkerList=[];
					response.data.playerList.forEach(item => {
						if(item.alive){
							let potin = L.latLng(item.x / 10, item.y / 10);
							let icon = L.icon({
								iconUrl: item.enemy?enemyicon:localPlayerIcon,
								iconSize: [20, 20],
							})
							if (item.localPlayer) {
								this.map.flyTo(potin, 1);
							}
							MarkerList.push(this.addMarker(potin,icon));
						}
						
					})
					if (that.layerGroup != null) {
						that.map.removeLayer(that.layerGroup)
					}
					that.MarkerList=MarkerList;
					that.layerGroup = L.layerGroup(that.MarkerList);
					that.map.addLayer(that.layerGroup);
				});
			}, 100)



		},
		//生命周期 - 挂载完成（可以访问DOM元素）
		mounted() {
			that = this;
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
					maxZoom: 5,
					minZoom: 1
				});
				//加载单张图
				this.imageOverLay = L.imageOverlay(this.bgImg, this.bounds, {
					interactive: true, //允许地图触发事件
				}).addTo(this.map);
			},
			addMarker(point, icon) {
				return L.marker(point, {
					icon: icon
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