AFRAME.registerComponent('shade-ui', {
	init: function () {
		this.el.parentEl.addEventListener('loaded', () => {
			let children = this.el.parentEl.object3D.children

			this.background = children[1].children[0]
			this.container = children[0]

			this.container.traverse(node => {
				if (node.material) {
					let isTransparent = node.el.getAttribute('background-transparent')
					node.material = new THREE.MeshBasicMaterial({
						color: node.material.color,
						opacity: isTransparent ? 0.0 : 1.0,
						transparent: isTransparent,
						depthWrite: false,
					});
				}
			} );

			this.background.material = new THREE.MeshBasicMaterial({
				color: this.background.material.color,
				opacity: this.background.material.opacity,
			})

			this.background.visible = false
		})
	}
});