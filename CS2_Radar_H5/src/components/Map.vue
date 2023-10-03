<!-- 测试页面 -->
<template>
	<div class="control">
		<div>
			玩家数量:{{playerNum}}
		</div>
		<div>
			tick:{{gameInfo.tick}}
		</div>
		<div>
			avgTick:{{parseInt(allTickVal/tickTimes)}}
		</div>
		<div @click="opchange()">
			人物跟随开关<input type="checkbox" v-model="isOpenFlow" />
		</div>
	</div>
	<div id="map"></div>
</template>

<script>
	import axios from 'axios';

	import localPlayerIcon from '/src/icon/localPlayer_icon.png'
	import enemyIcon from '/src/icon/enemy_icon.png'
	import teammateIcon from '/src/icon/teammate_icon.png'
	import enemyIconHvd from '/src/icon/enemy_icon_hvd.png'
	import teammateIconHvd from '/src/icon/teammate_icon_hvd.png'

	import de_ancient_radar from '/src/map/de_ancient_radar.png'
	//import de_cache_radar from '/src/map/de_cache_radar.png'
	import de_dust2_radar from '/src/map/de_dust2_radar.png'
	import de_inferno_radar from '/src/map/de_inferno_radar.png'
	import de_mirage_radar from '/src/map/de_mirage_radar.png'
	import de_nuke_lower_radar from '/src/map/de_nuke_lower_radar.png'
	import de_nuke_radar from '/src/map/de_nuke_radar.png'
	import de_overpass_radar from '/src/map/de_overpass_radar.png'
	import de_vertigo_lower_radar from '/src/map/de_vertigo_lower_radar.png'
	import de_vertigo_radar from '/src/map/de_vertigo_radar.png'



	var that;
	var mapRadar = {
		de_ancient: {
			map: de_ancient_radar,
			bounds: [
				[-294, -289],
				[217, 213]
			]
		},
		de_dust2: {
			map: de_dust2_radar,
			bounds: [
				[-127, -247],
				[323, 202]
			]
		},
		de_inferno: {
			map: de_inferno_radar,
			bounds: [
				[-112, -206],
				[380, 292]
			]
		},
		de_mirage: {
			map: de_mirage_radar,
			bounds: [
				[-340, -322],
				[172, 188]
			]
		},
		de_nuke: {
			needChangeMap: true,
			map: de_nuke_radar,
			mapLower: de_nuke_lower_radar,
			lowerValue: -480,
			bounds: [
				[-441, -329],
				[304, 357]
			]
		},
		de_overpass: {
			map: de_overpass_radar,
			bounds: [
				[-361, -479],
				[181, 42]
			]
		},
		de_vertigo: {
			needChangeMap: true,
			map: de_vertigo_radar,
			mapLower: de_vertigo_lower_radar,
			lowerValue: 11720,
			bounds: [
				[-223, -312],
				[172, 84]
			]
		}
	};
	export default {
		data() {
			return {
				playerNum:0,
				allTickVal: 0,
				tickTimes: 0,
				isOpenFlow: false,
				zoom: 1,
				lastMapName: null,
				gameInfo: {},
				MarkerList: [],
				map: null,
				imageOverLay: null,
				bounds: [
					[-330, -315],
					[155, 185]
				],
				XSize: 500,
				YSize: 500
			};
		},
		//生命周期 - 创建完成（可以访问当前this实例）
		created() {
			setInterval(() => {
				axios.get("http://127.0.0.1:8080/getGameData").then(response => {
					if (response.data != "") {
						that.gameInfo.mapName = response.data.mapName;
						that.gameInfo.tick = response.data.tick;
						that.playerNum=response.data.playerList.length;
						that.tickTimes++;
						that.allTickVal += response.data.tick;
						that.initPlayerList(response.data.playerList);
					}
				}).catch();
			}, 100)



		},
		//生命周期 - 挂载完成（可以访问DOM元素）
		mounted() {
			that = this;
			window.addEventListener("keydown", this.KeyDown, true);
			this.initMap();
		},
		methods: {
			opchange() {
				this.isOpenFlow = !this.isOpenFlow;
			},
			initPlayerList(data) {
				let MarkerList = [];
				let knowMap = true;
				if (typeof(mapRadar[that.gameInfo.mapName]) == "undefined") {
					knowMap = false;
				}
				if (knowMap) {
					that.initKnowMap();
				} else {
					that.initUnKnowMap();
				}
				if (data.length > 0) {
					this.updatePlayerMarker(data, knowMap);
				}
			},
			initKnowMap() {

				//当变更地图
				//更新地图
				if (that.lastMapName != that.gameInfo.mapName) {
					that.lastMapName = that.gameInfo.mapName;
					//加载单张图
					if (that.imageOverLay != null) {
						this.allTickVal = 0;
						this.tickTimes = 0;
						that.map.removeLayer(that.imageOverLay)
					}
					this.imageOverLay = L.imageOverlay(mapRadar[that.gameInfo.mapName].map, mapRadar[that.gameInfo.mapName]
						.bounds).addTo(this.map);
					//this.imageOverLay = L.imageOverlay(mapRadar[that.gameInfo.mapName].map, this.bounds).addTo(this.map);
				}
			},
			initUnKnowMap() {
				if (that.imageOverLay != null) {
					this.allTickVal = 0;
					this.tickTimes = 0;
					that.map.removeLayer(that.imageOverLay)
					that.imageOverLay = null;
				}
			},
			updatePlayerMarker(data, knowMap) {
				let mlist = [];
				data.forEach(item => {
					if (item.alive) {
						let potin = L.latLng(item.x / 10, item.y / 10);
						let icon = L.icon({
							iconUrl: item.localPlayer ? localPlayerIcon : (item.enemy ? (item.sameLevel ?
								enemyIcon : enemyIconHvd) : (item.sameLevel ? teammateIcon :
								teammateIconHvd)),
							iconSize: [40, 40],
							iconAnchor: [19, 25]
						})
						if (item.localPlayer && this.isOpenFlow) {
							this.map.flyTo(potin, this.map.getZoom());
						}

						mlist.push(this.addMarker(potin, icon, item.localPlayer ? (knowMap ? item.angles : 0) :
							item.angles));
					}
					if (item.localPlayer && knowMap) {
						if (mapRadar[that.gameInfo.mapName].needChangeMap) {
							if (item.z > mapRadar[that.gameInfo.mapName].lowerValue) {
								that.map.removeLayer(that.imageOverLay)
								this.imageOverLay = L.imageOverlay(mapRadar[that.gameInfo.mapName].map, mapRadar[
									that.gameInfo.mapName].bounds).addTo(this.map);
							} else {
								that.map.removeLayer(that.imageOverLay)
								this.imageOverLay = L.imageOverlay(mapRadar[that.gameInfo.mapName].mapLower,
									mapRadar[that.gameInfo.mapName].bounds).addTo(this.map);
							}

						}
					}

				})
				if (that.layerGroup != null) {
					that.map.removeLayer(that.layerGroup)
				}
				that.MarkerList = mlist;
				that.layerGroup = L.layerGroup(that.MarkerList);
				that.map.addLayer(that.layerGroup);
			},
			reloadMap() {
				//加载单张图
				if (that.imageOverLay != null) {
					that.map.removeLayer(that.imageOverLay)
				}
				this.bounds[1] = [this.bounds[0][0] + this.XSize, this.bounds[0][1] + this.YSize];
				this.imageOverLay = L.imageOverlay(mapRadar[that.gameInfo.mapName].map, this.bounds)
					.addTo(this.map);
			},
			KeyDown(e) {


				if (e.keyCode == 96) {
					this.XSize = 500;
					this.YSize = 500;
					this.reloadMap();
				}
				//+ X
				if (e.keyCode == 98) {
					this.XSize += 1
					this.reloadMap();
				}
				//-
				if (e.keyCode == 97) {
					this.XSize -= 1
					this.reloadMap();
				}
				//+ Y
				if (e.keyCode == 101) {
					this.YSize += 1
					this.reloadMap();
				}
				//-
				if (e.keyCode == 100) {
					this.YSize -= 1
					this.reloadMap();
				}
				//←
				if (e.keyCode == 37) {
					this.bounds[0][1] += 1;
					this.reloadMap();
				}
				//↑
				if (e.keyCode == 38) {
					this.bounds[0][0] -= 1;
					this.reloadMap();
				}
				//→
				if (e.keyCode == 39) {
					this.bounds[0][1] -= 1;
					this.reloadMap();
				}
				//↓
				if (e.keyCode == 40) {
					this.bounds[0][0] += 1;
					this.reloadMap();
				}
			},
			// 初始化地图
			initMap() {
				this.map = L.map("map", {
					center: [0, 0],
					zoom: this.zoom,
					crs: L.CRS.Simple,
					maxZoom: 3,
					minZoom: 0
				});

			},
			addMarker(point, icon, angles) {
				return L.marker(point, {
					icon: icon,
					rotationAngle: angles
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
		top: 0;
		left: 0;
		z-index: 0;
	}

	.control {
		position: absolute;
		top: 100px;
		left: 10px;
		z-index: 1;
		background-color: aliceblue;
		border-radius: 10px;
		padding: 5px 10px;
	}
</style>