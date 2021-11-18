AFRAME.registerComponent('flat-ui', {
	init: function() {
		this.el.addEventListener('loaded', () => {
			this.children = this.el.getChildEntities();

			this.children.forEach(child => {
				let pos = child.getAttribute('position')

				child.setAttribute('position', `${pos.x} ${pos.y} ${0}`)
			})
		})
		
	}
});