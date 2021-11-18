
AFRAME.registerComponent('text-background', {
	init: function () {
		this.rendered = false
	},
	tick: function() {
		this.mesh = this.el.object3D.children[0]

		if (!this.rendered && this.mesh) {
			this.bbox = new THREE.Box3().setFromObject(this.mesh)
			let size = new THREE.Vector3()

			this.bbox.getSize(size)

			const geometry = new THREE.PlaneGeometry(size.x/1.5, size.z/2 - 0.5, 1);
			const material = new THREE.MeshBasicMaterial( {
				color: 'rgb(211, 211, 212)', 
				side: THREE.DoubleSide
			})
			
			const plane = new THREE.Mesh( geometry, material );
			this.mesh.parent.add( plane );

			this.rendered = true
		}

	}
});