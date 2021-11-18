
AFRAME.registerComponent('label-container', {
	init: function () {
		this.scaleHeight = this.el.parentEl.getAttribute('scaleheight')
		this.el.setAttribute('position', `0 0 ${ 60 * this.scaleHeight + 1.5}`)
	},
	tick: function() {
		let tempHeight = this.el.parentEl.getAttribute('scaleheight')

		if (this.scaleHeight !== tempHeight) { 
			this.scaleHeight = tempHeight
			this.el.setAttribute('position', `0 0 ${ 60 * this.scaleHeight + 1.5}`)
		}
	}
});