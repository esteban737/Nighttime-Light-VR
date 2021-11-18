import { LngLat, LngLatBounds } from 'mapbox-gl'

AFRAME.registerComponent('mapboxntl', {
	init: function () {
		// let heatmap = this.el.parentElement.querySelector('.heatmap').components['aframe-heatmap3d']

		// this.width = heatmap.data.width
		// this.height = heatmap.data.width / 1.45

	

		this.el.parentElement.addEventListener('model-loaded', () => {
			this.pco = this.el.parentElement.components['potree-loader'].pco
			this.pcoGeo = this.pco.pcoGeometry
			this.mapBounds = this.pcoGeo.originalTightBox

			console.log(this.mapBounds)

			let centerX = (this.mapBounds.max.x + this.mapBounds.min.x) /2
			let centerY = (this.mapBounds.max.y + this.mapBounds.min.y) /2

			this.el.setAttribute('geometry', `primitive: plane; height: ${ 180 }; width: ${ 360 }`)

			this.el.setAttribute('position', `${centerX} ${-10} ${0}`)

			this.el.setAttribute('mapbox', `
				accessToken: pk.eyJ1IjoiZXN0ZWJhbjczNyIsImEiOiJja2tydjQ4MmIwYjlxMm9vaWk0ZHA2cG0wIn0.6Rb7hZT1lSMzaL-BCw9qOA;
				style: https://api.maptiler.com/maps/basic-4326/style.json?key=u3svMEzyEaQvlsZdXNVi;
				pxToWorldRatio: 50;
				zoom: 0;
			`
			)

			this.mapboxInstance = this.el.components['mapbox'].mapInstance

			this.mapboxInstance.setRenderWorldCopies(false)

			this.mapboxInstance.setCenter([0, 0])

			let mapCanvas = this.mapboxInstance.getCanvas();
    		let mapDiv = this.mapboxInstance.getContainer();

			// mapCanvas.style.width = '100vw';
			// mapCanvas.style.width = '4000px';

			console.log(mapDiv)

			// mapDiv.style.width = '50%';
            // mapCanvas.style.width = '100%';

			// this.mapboxInstance.resize()
			

			this.mapboxInstance.fitBounds([
				[this.mapBounds.min.x, this.mapBounds.min.y],
				[this.mapBounds.max.x, this.mapBounds.max.y]
				]);
		})

		this.stylesInitialLoaded = false



		
		

		// this.mapboxInstance = this.el.components['mapbox'].mapInstance

		// console.log(this.mapboxInstance)
		

		// this.mapboxInstance.setRenderWorldCopies(false)

		this.el.addEventListener('mapbox-loaded', () => {
			
			
			this.el.setAttribute('visible', true)
		})

		// this.mapboxInstance.on('styledata', () => {
		// 	if (!this.stylesInitialLoaded) {
		// 		// this.stylesInitialLoaded = true

		// 		// this.layers = this.mapboxInstance.style._layers

		// 		// Object.values(this.layers).forEach(layer => layer.minzoom = 0)
		// 		// console.log(this.layers)
		// 	}
		// });
   
  }
});