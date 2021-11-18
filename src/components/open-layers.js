import Map from 'ol/Map';
import View from 'ol/View';
import VectorTile from 'ol/layer/VectorTile'
import TileGrid from 'ol/tilegrid/TileGrid';
import * as proj from'ol/proj'
import {applyBackground, applyStyle} from 'ol-mapbox-style';
import MVT from 'ol/format/MVT';
import * as sources from 'ol/source'
import { GreaterDepth, GreaterEqualDepth, LessDepth } from 'three';
import { closestOnCircle } from 'ol/coordinate';
import LineString from 'ol/geom/LineString';

let mapId = 0;

AFRAME.registerComponent('ol', {
	schema: {
		map: {
			type: 'string',
			default: 'map'
		},
		height: {
			type: 'number'
		},
		width: {
			type: 'number'
		},
		pixToVRRatio: {
			default: 100
		},
		aframeEvent: {
			type: 'string',
			default: 'click'
		},
		OlEvent: {
			type: 'string',
			default: 'click'
		}
	},
	init: function () {
		this.offset = false

		this.el.sceneEl.addEventListener('clouds-loaded', () => {
			this.scaleHeight = this.el.parentEl.getAttribute('scaleheight')
			this.labelContainer = this.el.parentEl.querySelector('.label')
			this.borderContainer = this.el.parentEl.querySelector('.border')
	
	
			let projection = 'EPSG:4326';
	
			var tileGridOpts = {"extent": [-180, -90, 180, 90], "minZoom": 0, "sizes": [[2, 1], [4, 2], [8, 4], [16, 8], [32, 16], [64, 32], [128, 64], [256, 128], [512, 256], [1024, 512], [2048, 1024], [4096, 2048], [8192, 4096], [16384, 8192]], "tileSizes": [[512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512], [512, 512]], "resolutions": [0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 8.58306884765625e-05, 4.291534423828125e-05]};
			var tilegrid = new TileGrid(tileGridOpts);
	
			this.sizes = tileGridOpts.sizes
	
			let viewResolutions = tileGridOpts.resolutions.concat();
			let overzoomLevels = 3;
			while (overzoomLevels-- > 0) {
			viewResolutions.push(viewResolutions[viewResolutions.length - 1] / 2);
			}
	
			let view = new View({
				constrainResolution: true,
				projection: projection,
				resolutions: viewResolutions,
				center: [0,0],
				zoom: 0
			})
	
			this.view = view
	
			let map = new Map({
				layers: [],
				view
			});
	
			let layer = null;
			let desiredLayers = {
				'boundary': true,
				'water': true,
				'place': true
			}
	
			let desiredStyles = [
				// 'admin_country',
				// 'admin_sub',
				'water',
				// 'poi_label',
				// 'country_label',
				// 'country_label-other'
			]
	
			let newLayers = []
			let currentLabels = {}
			let currentBorders = []
			let borderMaterial = new THREE.MeshBasicMaterial( { color: '#363636', transparent: true, opacity: 0.7 } );
			let firstRender = true
	
			let borderFeatures = []
	
			let placeTypes = {
				continent: 0,
				country: 1,
				state: 2,
				city: 3,
				town: 4,
				village: 5,
				hamlet: 6,
			}
	
			fetch('https://api.maptiler.com/maps/basic-4326/style.json?key=u3svMEzyEaQvlsZdXNVi')
			.then((response) => { return response.json() })
			.then((style) => {
				let mapExtent = tileGridOpts.extent;
				let center = style.center;
				let styleDict = {}
	
				style.layers.forEach((layer) => {
					styleDict[layer.id] = layer
				})
	
				desiredStyles.forEach(name => newLayers.push(styleDict[name]))
	
				style.layers = newLayers
	
				styleDict['water'].paint = {'fill-color': '#01009c', 'fill-opacity': '.1'}
				// styleDict['water_intermittent'].paint = {'fill-color': '#0600ff', 'fill-opacity': '.1'}
	
				// styleDict['landcover-glacier'].paint['fill-color'] = '#3d3d3d'
				
	
				if (!center || center.length < 2) {
					let bounds = proj.transformExtent(mapExtent, projection, 'EPSG:4326');
					center = [
					bounds ? bounds[0] + (bounds[2] - bounds[0]) / 2 : 0,
					bounds ? bounds[1] + (bounds[3] - bounds[1]) / 2 : 0
					];
				}
	
				Object.keys(style.sources).forEach((sourceId) => {
					let source = style.sources[sourceId];
					if (source && source.url) {
					fetch(source.url)
					.then(response => response.json())
					.then(tileJSON => {
						let zIndex = style.layers.findIndex(l => l.source == sourceId);
						let newVectorLayers =[]
	
						if (source.type == 'vector') {
							layer = new VectorTile({
								zIndex: zIndex,
								renderMode: 'image',
								extent: mapExtent,
								source: new sources.VectorTile({
									attributions: tileJSON.attribution,
									format: new MVT(),
									projection: projection,
									tileGrid: tilegrid,
									urls: tileJSON.tiles,
									tileLoadFunction: (tile, url) => {
										tile.setLoader((extent, resolution, projection) => {
										  fetch(url).then((response) => {
											response.arrayBuffer().then((data) => {
											  const format = tile.getFormat() // ol/format/MVT configured as source format
	
											  let features = format.readFeatures(data, {
												extent: extent,
												featureProjection: projection
											  });
	
	
											  features = features.filter(feature => {
												let props  = feature.properties_
	
												return desiredLayers[props.layer]
											  })
	
											  tile.setFeatures(features);
											});
										  });
										});
									  }
								})
						});
	
						applyStyle(layer, style, sourceId, undefined, viewResolutions)
						.then(() => {
							map.addLayer(layer);
							map.on('rendercomplete', () => {
								this.layer = layer
								let features = layer.getSource().getFeaturesInExtent(layer.getExtent())
								let zoom = view.getZoom()
	
								if (firstRender) {
									borderFeatures = features.filter(feature => feature['type_'] === 'LineString')
		
									firstRender = false
								}
	
								let context = layer.renderer_.context
								let canvas = context.canvas
	
								this.labelContainer.querySelectorAll('.place').forEach(place => {
									currentLabels = {}
									place.remove()
								})
	
								let shape = new THREE.Shape();
								shape.moveTo( 0,0 );
								shape.lineTo( 0, .001 );
								shape.lineTo( -60, .001 );
								shape.lineTo( -60, 0 );
								shape.lineTo( 0, 0 );
	
								this.borderContainer.object3D.children.forEach(child => {
									child.geometry.dispose()
									this.borderContainer.object3D.remove(child)
									this.borderContainer.object3D.children = []
								})
							
	
								features.forEach(feature => {
									let props = feature.properties_
									let id = feature['id_']
									if (feature['type_'] === 'Point' && !currentLabels[id] && props.rank < 3) {
										let placeEl = document.createElement('a-text')
										let scaleFactor = 5 - zoom
		
										placeEl.setAttribute('position',  `${feature.flatCoordinates_[0]} ${feature.flatCoordinates_[1]} ${(zoom + 1 - placeTypes[props.class])}`)
										placeEl.setAttribute('scale',  `${scaleFactor} ${scaleFactor} ${scaleFactor}`)
										placeEl.setAttribute('value',  props.name_int)
										placeEl.setAttribute('look-camera', '')
										placeEl.setAttribute('width', (props.name_int.length + 5) * .1)
										placeEl.setAttribute('wrap-count', props.name_int.length + 5)
										placeEl.setAttribute('class', 'place')
										placeEl.setAttribute('align', 'center')
										placeEl.setAttribute('color', '#2c3037')
										placeEl.setAttribute('z-offset', .01)
										placeEl.setAttribute('letter-spacing', 5)
										placeEl.setAttribute('geometry', "primitive: plane; height: auto; width: auto;")
										placeEl.setAttribute('material', "shader: flat; color: #d3d3d4;")
	
										this.labelContainer.appendChild(placeEl)
										currentLabels[id] = true
									}
								})
	
								borderFeatures.forEach(feature => {
									let props = feature.properties_
									if ( props['admin_level'] <= zoom + 2) {
										// if (!currentBorders.some(extent =>
										// 	 extent.every((coord, index) => feature['extent_'][index] === coord))) {
		
										let points = []
	
										for (let i = 0; i < feature.flatCoordinates_.length; i += 2) {
											points.push(new THREE.Vector3(feature.flatCoordinates_[i], feature.flatCoordinates_[i + 1], 0.0))
										}
	
										const closedSpline = new THREE.CatmullRomCurve3( points );
						
										closedSpline.curveType = 'catmullrom';
										closedSpline.closed = false;
						
										let extrudedLine = new THREE.ExtrudeGeometry(shape, { steps: 10, bevelEnabled: false, extrudePath: closedSpline})
	
										this.borderContainer.object3D.add(new THREE.Mesh(extrudedLine, borderMaterial))
	
										// currentBorders.push(feature['extent_'])
									// 	}
									}
								})
	
						
								
					
								let img  = canvas.toDataURL("png")
								let texture = new THREE.TextureLoader().load(img)
	
								this.mesh.material = new THREE.MeshBasicMaterial({
									map: texture,
									color: styleDict['background'].paint['background-color'],
									transparent: true,
									depthWrite: false,
								})
							});
						});
						}
					});
					}
				});
			});
	
			this.map = map
			this.mapId = mapId++;
	
			this.tilePositions = []
	
			let tempMapDiv = document.querySelector('#map' + this.mapId)
	
			if (tempMapDiv) tempMapDiv.remove()
	
			this.mapDiv = document.createElement('div')
			this.mapDiv.setAttribute('id', 'map' + this.mapId)
	
			document.querySelector('a-assets').appendChild(this.mapDiv)
	
			map.setTarget(this.mapDiv)
	
			this.scale = new THREE.Vector3()
	
			if (this.data.full) {
				let zoom = map.getView().getZoom()
				let zoomFactor = Math.pow(2, zoom)
				
				// this.pco = this.el.parentElement.querySelector('.cloud').components['potree-loader'].pco
				// this.pcoGeo = this.pco.pcoGeometry
				// this.mapBounds = this.pcoGeo.originalTightBox
	
				// let centerX = (this.mapBounds.max.x + this.mapBounds.min.x) /2
				// let centerY = (this.mapBounds.max.y + this.mapBounds.min.y) /2
				// this.el.setAttribute('position', `${0} ${0} ${0}`)
	
				this.el.setAttribute('geometry', `primitive: plane; height: ${ 180 }; width: ${ 360 }`)
	
				this.mesh = this.el.getObject3D('mesh')
	
				map.setSize([1024 * zoomFactor, 512 * zoomFactor]);
			}
		})

		this.el.sceneEl.addEventListener('enter-vr', () => {
			if (!this.offset) {
				let pos = this.el.getAttribute('position')

				this.el.setAttribute('position', `${pos.x} ${pos.y + 0.5} ${pos.z}`)
			}

			this.offset = true
		})
	},
	update: function (oldData) {
		let data = this.data;  // Component property values.
		let el = this.el;  // Reference to the component's entity.
		let comp=this;
		let map = this.map

		// Nothing changed
		if (AFRAME.utils.deepEqual(oldData, data)) {
			return;
		}  


		// map.renderSync();
	},
	tick: function() {
		let tempHeight = this.el.parentEl.getAttribute('scaleheight')

		if (this.scaleHeight !== tempHeight) this.scaleHeight = tempHeight
	},
	zoom(isZooming) {
		if (isZooming) {
			let zoom = this.view.getZoom() + 1

			if (zoom === 3) return

			let zoomFactor = Math.pow(2, zoom)

			this.view.setZoom(zoom)

			this.map.setSize([1024 * zoomFactor, 512 * zoomFactor]);
		}
		else {
			let zoom = this.view.getZoom() - 1

			if (zoom === -1) return

			let zoomFactor = Math.pow(2, zoom)

			this.view.setZoom(zoom)

			this.map.setSize([1024 * zoomFactor, 512 * zoomFactor]);
		}
	},
	visibleTiles: function(sizes, tileSize) {
		let tilePositions = []

		let rowPos = this.bbox.min.z + tileSize / 2
		let colPos = this.bbox.min.x + tileSize / 2

		for (let i = 0; i < sizes[1]; i++) {
			tilePositions.push([])

			for (let j = 0; j < sizes[0]; j++) {
				let center = new THREE.Vector3(colPos, this.position.y, rowPos)

				colPos += tileSize;

				tilePositions[i].push(center)
			}
			colPos = this.bbox.min.x + tileSize / 2
			rowPos += tileSize;
		}

		this.tilePositions = tilePositions;
	},
	updateLayerExtent: function(extent) {
		// let zoom = this.map.getView().getZoom()
		// let zoomFactor = this.Math.pow(2, zoom)

		// this.el.setAttribute('geometry', `primitive: plane; height: ${ 180 }; width: ${ 360 }`)

		// if (this.zoom !== zoom) this.map.setSize([1024 * zoomFactor, 512 * zoomFactor]);
		// this.zoom = zoom
		let pastExtent = this.layer.getExtent()

		if (!extent.every((coord, index) => coord === pastExtent[index])) {
			this.layer.setExtent(extent)
		}
	},
	calculateProjection: function() {
		if (this.loaded && this.layer) {
			this.position = new THREE.Vector3()
			this.mesh.getWorldPosition(this.position)

			let sizes = this.sizes[this.map.getView().getZoom()]

			this.bbox = new THREE.Box3().setFromObject(this.mesh)

			let tileSize = (this.bbox.max.x - this.bbox.min.x) / sizes[0]
			let tileWorldSize = 360 / sizes[0]

			this.visibleTiles(sizes, tileSize)

			let camPos = new THREE.Vector3()
			let camera = document.querySelector('#head').components['camera'].camera
			camera.getWorldPosition(camPos)

			// let north = -1;
			// let south = -1;
			// let east = -1;
			// let west = -1;

			for (let i = 0; i < sizes[1]; i++) {
				for (let j = 0; j < sizes[0]; j++) {
					camPos.y = this.tilePositions[i][j].y

					let distance = camPos.distanceTo(this.tilePositions[i][j])

					let vFOV = THREE.MathUtils.degToRad( camera.fov ); // convert vertical fov to radians

					let projectionFactor = tileSize / (Math.tan( vFOV / 2 ) * distance);

					if (projectionFactor >= 0.1) {
						if (north === -1) north = i
						if (west === -1) west = j
						south = Math.max(south, i)
						east = Math.max(east, j)
					}
				}
			}

			// this.north = 90 - (tileWorldSize * north);
			// this.south = 90 - (tileWorldSize * south) - tileWorldSize 

			// this.east = -180 + (tileWorldSize * east) + tileWorldSize;
			// this.west = -180 + (tileWorldSize * west)

			// this.updateLayerExtent([this.west, this.south, this.east, this.north])
		}
	}
});