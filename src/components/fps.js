AFRAME.registerComponent('fps', {
	init: function() {
	},
	tick: function() {
		if (!this.fpsDiv) {
			this.fpsDiv = document.querySelector('.rs-counter-base:nth-child(2) .rs-counter-value');
			return;
		}

		let fps = parseFloat(this.fpsDiv.innerHTML, 10)

		this.el.setAttribute('gui-label', 'value', `Frames Per Second: ${fps.toFixed(0)}`)
	}
});