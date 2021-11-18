AFRAME.registerComponent('clip-box', {
	init: function () {
		this.cloudContainer = this.el.parentEl.querySelector('.cloudContainer')
		this.scaleHeight = this.cloudContainer.getAttribute('scaleheight')
		this.boxHeight = 60 * this.scaleHeight
		this.position = this.el.components['position'].data
		this.scale = this.el.components['scale'].data
		this.selected = false

		this.cameraDir = new THREE.Vector3()
		this.cameraPos = new THREE.Vector3()


		this.el.setAttribute('geometry', `primitive: box; height: 1; width: 1; depth: 1`)
		this.el.setAttribute('position', `${this.position.x} ${ this.boxHeight / 2} ${this.position.z}`)
		this.el.setAttribute('scale', `${this.scale.x} ${ this.boxHeight } ${this.scale.z}`)

		this.rendered = false;
		this.mesh = this.el.getObject3D('mesh')
		this.clipBox = {
			box: new THREE.Box3(),
			matrix: null,
			inverse: null,
			position: null
		}

		const edges = new THREE.EdgesGeometry( this.mesh.geometry );
		this.outline = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 'white' } ) );
		this.mesh.parent.add( this.outline );

		this.mesh.onAfterRender = (() => {
			if(!this.rendered) {
				this.camera = document.querySelector('#head').components['camera'].camera
				this.potreeSystem = this.el.sceneEl.systems['potree-loader']
				this.id = this.potreeSystem.clipBoxes.length

				this.updateClipBox()

				this.el.sceneEl.components['start-up'].clipBoxes.push(this.clipBox)

				this.rendered = true
				this.el.setAttribute('visible', false)

				console.log(this.camera)
			}
		})

		this.el.addEventListener('mouseenter', () => {
			this.handleHover(true)
		})

		this.el.addEventListener('mouseleave', () => {
			this.handleHover(false)
		})

		this.el.addEventListener('mousedown', (evt) => {
			this.handleGrab(true)

			let intersection = evt.detail.intersection
			this.point = intersection.point

			this.raycaster = evt.detail.cursorEl
	
			let objectPoint = new THREE.Vector3();
			objectPoint.setFromMatrixPosition(this.el.object3D.matrixWorld)

			this.offsetVector = new THREE.Vector3().subVectors(objectPoint, this.point)

			this.selected = true
		})

		this.el.addEventListener('mouseup', () => {
			this.handleGrab(false)

			this.selected = false
		})
	},
	updateClipBox() {
		this.mesh.updateMatrixWorld()

		this.clipBox.matrix = this.mesh.matrixWorld
		this.clipBox.inverse = this.mesh.matrixWorld.clone().invert()
		this.clipBox.position = this.mesh.position

		this.potreeSystem.pointClouds.forEach(pco => pco.material.setClipBoxes(this.potreeSystem.clipBoxes))
	},
	handleHover(isHovered) {
		if (isHovered) {
			this.outline.material.color.set("#6B8E23")
		}
		else {
			this.outline.material.color.set("white")
		}
	},
	handleGrab(isGrabbed) {
		if (isGrabbed) {
			this.outline.material.color.set("#98FB98")
		}
		else {
			this.outline.material.color.set("#6B8E23")
		}
	},
	tick: function() {
		let tempHeight = this.cloudContainer.getAttribute('scaleheight')

		if (this.scaleHeight !== tempHeight) { 
			this.scaleHeight = tempHeight
			this.boxHeight = 60 * this.scaleHeight
			this.position = new THREE.Vector3().setFromMatrixPosition(this.mesh.matrixWorld)
			
			this.el.setAttribute('position', `${this.position.x} ${this.boxHeight/ 2} ${this.position.z}`)
			this.el.setAttribute('scale', `${this.scale.x} ${ this.boxHeight } ${this.scale.z}`)
		}

		if (this.selected) {
			let dir = this.raycaster.getAttribute("raycaster").direction
			let raypoint = this.raycaster.getAttribute("raycaster").origin

			dir = new THREE.Vector3(dir.x, dir.y, dir.z)
			raypoint = new THREE.Vector3(raypoint.x, raypoint.y, raypoint.z)

			if (this.raycaster.id !== "mouse") dir = this.raycaster.object3D.getWorldDirection(dir).negate()

			this.raycaster.object3D.localToWorld(raypoint);
			let distance = this.calculatePlaneDistance(dir, raypoint)

			dir.multiplyScalar(distance);

			raypoint.add(dir)

			let objectPoint = new THREE.Vector3().addVectors(raypoint, this.offsetVector)

			this.el.object3D.position.setComponent(0, objectPoint.x);
			this.el.object3D.position.setComponent(2, objectPoint.z);

			this.updateClipBox()
		}
	},
	calculatePlaneDistance(dir, raypoint) {
		return new THREE.Vector3().subVectors(this.point, raypoint).dot(this.mesh.up) / dir.dot(this.mesh.up)
	},
	resetSize() {
		this.scale = {x: 1, y: this.boxHeight, z: 1}
		this.el.setAttribute('scale', `${1} ${ this.boxHeight } ${1}`)
	},
	findNewPosition() {
		this.camera.updateMatrixWorld()

		this.camera.getWorldDirection(this.cameraDir)
		this.cameraPos.setFromMatrixPosition(this.camera.matrixWorld)

		this.cameraDir.multiplyScalar(5)

		let newPos = new THREE.Vector3().addVectors(this.cameraDir, this.cameraPos)

		this.el.object3D.position.setComponent(0, newPos.x);
		this.el.object3D.position.setComponent(2, newPos.z);
	},
	incrementDecrementSize(increment) {
		let factor = this.scale.x
		let newFactor

		newFactor = increment ? factor + .2 : factor -.2

		if (newFactor < 0.2 || newFactor > 5) return

		this.scale = {x: newFactor, y: this.boxHeight, z: newFactor}
		this.el.setAttribute('scale', `${newFactor} ${this.boxHeight} ${newFactor}`)
	}
});