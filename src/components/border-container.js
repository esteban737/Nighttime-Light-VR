
AFRAME.registerComponent('border-container', {
	init: function () {
		this.isExtruded = false
		this.scaleHeight = this.el.parentEl.getAttribute('scaleheight')
		this.el.setAttribute('scale', `1 1 ${0.001}`)
	},
	tick: function() {
		let tempHeight = this.el.parentEl.getAttribute('scaleheight')

		if (this.scaleHeight !== tempHeight && this.isExtruded) { 
			this.scaleHeight = tempHeight
			this.el.setAttribute('scale', `1 1 ${this.scaleHeight}`)
		}
	},
	toggleExtrusion() {
		if (this.isExtruded) {
			this.el.setAttribute('scale', `1 1 ${0.001}`)
		}
		else {
			this.el.setAttribute('scale', `1 1 ${this.scaleHeight}`)
		}

		this.isExtruded = !this.isExtruded
	}
});