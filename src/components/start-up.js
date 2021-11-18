AFRAME.registerComponent('start-up', {
	init: function () {
	  let spheres = this.el.querySelectorAll('.teleport-sphere')
	  let left = document.querySelector('#ctlL');
	  let right = document.querySelector('#ctlR');
	  let mouse = document.querySelector('#mouse');
	  let yearSelector = document.querySelector('#year-selector')
	  let handStats = left.querySelector('#handstats')
	  let map = document.querySelector('#map').components['ol']
	  let potreeSystem = this.el.sceneEl.systems['potree-loader']
	  this.clipBoxes = []
	  let clipBoxEls = this.el.querySelectorAll('.clipbox')

	  this.el.sceneEl.renderer.sortObjects = true;

	//   var cloudjson = require('../../assets/clouds/1992.las_converted/cloud');
	//   var fileUrl = require('file-url')

	//   console.log(cloud.object3D)

	window.addEventListener('keydown', (e) => {
		if(e.code === 'KeyM') {
			let visibility = !yearSelector.getAttribute('visible')
			yearSelector.setAttribute('visible', visibility)
			yearSelector.components['overlay-ui'].background.visible = visibility

			if (visibility) {
				yearSelector.querySelectorAll('.raycastable').forEach(el => el.setAttribute('raycastable', ''))
			}
			else {
				yearSelector.querySelectorAll('.raycastable').forEach(el => el.removeAttribute('raycastable'))
			}
		}

		else if(e.code === 'KeyJ') {
			map.zoom(true)
			
		}

		else if(e.code === 'KeyH') {
			map.zoom(false)
		}

		else if (e.code === 'KeyB') {
			map.borderContainer.components['border-container'].toggleExtrusion()
		}

		else if (e.code === 'KeyL') {
			let visibility = !map.labelContainer.getAttribute('visible')
			map.labelContainer.setAttribute('visible', visibility)
		}

		else if (e.code === 'KeyC') {
			if (potreeSystem.clipBoxes.length > 0) {
				this.clipBoxes = potreeSystem.clipBoxes
				clipBoxEls.forEach(box =>  box.setAttribute('visible', false))

				potreeSystem.clipBoxes = []
			}

			else {
				potreeSystem.clipBoxes = this.clipBoxes
				clipBoxEls.forEach(box => {
					let clipComponent = box.components['clip-box']

					clipComponent.resetSize()
					clipComponent.findNewPosition()

					clipComponent.updateClipBox()

					box.setAttribute('visible', true)
				})

				this.clipBoxes = []
			}

			potreeSystem.pointClouds.forEach(pco => pco.material.setClipBoxes(potreeSystem.clipBoxes))
		}
	})

	  if (!AFRAME.utils.device.checkHeadsetConnected()) {
		mouse.setAttribute('visible', true)
	  }

	  else {
		left.setAttribute('visible', true)
		right.setAttribute('visible', true)
	  }
	  
	  left.addEventListener('model-loaded', () => {
		var obj = left.getObject3D('mesh')

		mouse.setAttribute('raycaster', 'enabled', false)
		left.setAttribute('raycaster', 'enabled', true)
		right.setAttribute('raycaster', 'enabled', true)
		left.setAttribute('raycaster', 'showLine', true)
		right.setAttribute('raycaster', 'showLine', true)
		
		obj.traverse(node => {
			if (node.material) {
				node.material = new THREE.MeshStandardMaterial({
					map: node.material.map, 
					emissiveMap: node.material.map,
					emissiveIntensity: 2
				});
				node.material.emissive = node.material.color
			}
		} );

		left.addEventListener('xbuttondown', () => {
			let visibility = !handStats.getAttribute('visible')
			handStats.setAttribute('visible', visibility)
			handStats.components['shade-ui'].background.visible = visibility
		})


		left.addEventListener('ybuttondown', () => {
			let visibility = !yearSelector.getAttribute('visible')
			yearSelector.setAttribute('visible', visibility)
			yearSelector.components['overlay-ui'].background.visible = visibility

			if (visibility) {
				yearSelector.querySelectorAll('.raycastable').forEach(el => el.setAttribute('raycastable', ''))
			}
			else {
				yearSelector.querySelectorAll('.raycastable').forEach(el => el.removeAttribute('raycastable'))
			}
		})

		left.addEventListener('thumbstickdown', () => {
			potreeSystem.pointClouds.forEach(pco => pco.el.components['potree-loader'].toggleExtrusion())
		})

		left.addEventListener('gripdown', evt => {
			//Start pointing position to teleport  
			left.emit('teleportstart');
			left.setAttribute('raycaster', 'enabled', false)
			left.setAttribute('raycaster', 'showLine', false)

			spheres.forEach(sphere => {
				sphere.setAttribute('visible', true)
			});
		});
	
		//X-buttorn Released 
		left.addEventListener('gripup', evt => {
			//Jump to pointed position
			left.emit('teleportend');
			left.setAttribute('raycaster', 'enabled', true)
			left.setAttribute('raycaster', 'showLine', true)

			spheres.forEach(sphere => {
				sphere.setAttribute('visible', false)
			});
		});
	  });
	  
	  right.addEventListener('model-loaded', () => {
		var obj = right.getObject3D('mesh')
		
		obj.traverse(node => {
			if (node.material) {
				node.material = new THREE.MeshStandardMaterial({
					map: node.material.map, 
					emissiveMap: node.material.map,
					emissiveIntensity: 2
				});
				node.material.emissive = node.material.color
			}
		} );

		right.addEventListener('abuttondown', () => {
			let visibility = !map.labelContainer.getAttribute('visible')
			map.labelContainer.setAttribute('visible', visibility)
		})


		right.addEventListener('bbuttondown', () => {
			map.borderContainer.components['border-container'].toggleExtrusion()
		})

		right.addEventListener('thumbstickmoved', (evt) => {
			let boxComponent = clipBoxEls[0].components['clip-box']

			if (boxComponent.selected) {
				boxComponent.incrementDecrementSize(evt.detail.y < 0)
			}

			boxComponent.updateClipBox()
		})



		right.addEventListener('gripdown', evt => {
			if (potreeSystem.clipBoxes.length > 0) {
				this.clipBoxes = potreeSystem.clipBoxes
				clipBoxEls.forEach(box =>  box.setAttribute('visible', false))

				potreeSystem.clipBoxes = []
			}

			else {
				potreeSystem.clipBoxes = this.clipBoxes
				clipBoxEls.forEach(box => {
					let clipComponent = box.components['clip-box']

					clipComponent.resetSize()
					clipComponent.findNewPosition()

					clipComponent.updateClipBox()

					box.setAttribute('visible', true)
				})

				console.log(this.clipBoxes)

				this.clipBoxes = []
			}

			potreeSystem.pointClouds.forEach(pco => pco.material.setClipBoxes(potreeSystem.clipBoxes))
		});
	  });
	}
  });