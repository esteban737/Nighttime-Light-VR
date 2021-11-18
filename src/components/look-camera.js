AFRAME.registerComponent('look-camera', {
	init: function() {
		this.camera = document.querySelector('#head').components['camera'].camera

		this.cameraDir = new THREE.Vector3()
		this.obj =  this.el.object3D;
		this.pos = new THREE.Vector3()
	},
	tick: function() {
		this.camera.getWorldDirection(this.cameraDir)
		this.pos.setFromMatrixPosition(this.camera.matrixWorld)

		this.obj.lookAt(this.pos.add(this.cameraDir.negate()))
	}
});