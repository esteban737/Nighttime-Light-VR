AFRAME.registerComponent('lightheatmap', {
	schema: {
		src: {default: '#1992'},
		palette: {default: `['#ffff02']`},
		opacityMax: {default: 0.7},
		width: {default: 50}
	},
	init: function () {
		let data = this.data

		if (data.src === "compare") {
			let image = this.el.sceneEl.querySelector('#compare')

			let [heatmapOne, heatmapTwo] = this.el.parentElement.querySelectorAll('.heatmap')

			heatmapOne = heatmapOne.components['aframe-heatmap3d']
			heatmapTwo = heatmapTwo.components['aframe-heatmap3d']

			let canvas = document.createElement('canvas');

			canvas.setAttribute("width", heatmapOne.canvas.width)
			canvas.setAttribute("height", heatmapOne.canvas.height)

			let context = canvas.getContext('2d')
			let imageData = new ImageData(canvas.width, canvas.height)
			let newData = imageData.data

			let imageDataOne = heatmapOne.canvasContext.getImageData(0, 0, canvas.width, canvas.height).data
			let imageDataTwo = heatmapTwo.canvasContext.getImageData(0, 0, canvas.width, canvas.height).data

			for (i = 0 ; i < imageDataOne.length; i += 4) {
				newData[i] = (imageDataTwo[i] - imageDataOne[i])

				newData[i + 3] = 255
			}

			context.putImageData(imageData, 0, 0);

			image.src = canvas.toDataURL()

			

			this.el.setAttribute('aframe-heatmap3d', `
				src: #compare;
				scaleOpacityMethod: linear;
				opacityMin: 0.0;
				opacityMax: ${data.opacityMax};
				loadingAnimDur: 0;
				palette: ${data.palette};
				invertElevation: true;
				width: ${data.width};
			`)

			// console.log(this.el)
		}

		else {
			this.el.setAttribute('aframe-heatmap3d', `
				src: ${data.src};
				scaleOpacityMethod: linear;
				loadingAnimDur: 0;
				palette: ${data.palette};
				opacityMin: 0.0;
				opacityMax: ${data.opacityMax};
				invertElevation: true;
				width: ${data.width};
			`)
		}

		// this.heatmap = this.el.components['aframe-heatmap3d']

				// this.plane.setAttribute('geometry', `primitive: plane; height: ${this.heatmap.data.height}; width: ${this.heatmap.data.width}`)

		// this.width = this.heatmap.canvas.width
		// this.height = this.heatmap.canvas.height


		// this.plane = this.el.querySelector(".ntlplane")

		// this.mapbox = this.el.querySelector('#mapbox')
		



		// let img = this.heatmap.data.src

		// let canvas = document.createElement('canvas');
	
        // canvas.setAttribute("width", img.width);
        // canvas.setAttribute("height", img.height);
		
		// let context = canvas.getContext('2d')
		// context.drawImage(img, 0, 0);

		// let imageData = context.getImageData(0, 0, canvas.width, canvas.height)
		// let data = imageData.data;
		// for (let i = 0; i < data.length; i += 4) {
		// 	let sum = data[i] + data[i+1] + data[i+2] 

		// 	if (sum > 0) {
		// 		data[i] = 255
		// 		data[i+1] = 255
		// 		data[i+2] = 255
		// 	}
		// }

		// context.putImageData(imageData, 0, 0);


		// let planeMesh = this.plane.getObject3D('mesh')
		// planeMesh.material.alphaMap = new THREE.CanvasTexture(canvas)
		// planeMesh.material.transparent = true


		// this.heatmapModel = this.el.object3DMap['terrain-heatmap']

		// console.log(this.heatmapModel)

		// this.heatmapModel.material = new THREE.PointsMaterial({
		// 	opacity: .3,
		// 	vertexColors: this.heatmapModel.material.vertexColors,
		// 	sizeAttenuation: true,
		// 	size: .015,
		// 	transparent: true,
		// })

		// console.log(this.heatmapModel)

		// this.heatmapModel.material.needsUpdate = true

	}
});
