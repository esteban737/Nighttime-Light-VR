AFRAME.registerComponent("overlay-ui", {
	init: function () {
		this.el.parentEl.addEventListener('loaded', () => {
			let children = this.el.parentEl.object3D.children
			this.background = children[1].children[0]
			this.container = children[0]

			this.container.traverse(node => {
				if (node.material && node.material.type !== "MeshBasicMaterial") {
					// node.material.depthTest = false

					node.material = new THREE.MeshBasicMaterial({
						color: node.material.color,
						// opacity: isTransparent ? 0.0 : 1.0,
						// transparent: isTransparent,
						// depthTest: false,
					});
					// node.parent.renderOrder = 101
				}
			} );

			this.background.material = new THREE.MeshBasicMaterial({
				color: this.background.material.color,
				opacity: this.background.material.opacity,
			})

			this.background.visible = false
			// this.background.parent.renderOrder = 100
		})
	}
  });