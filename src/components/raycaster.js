AFRAME.registerComponent('raycastermap', {
	init: function () {
	// this.currentSpot = null
	// this.currentSpotPos = null
    // Use events to figure out what raycaster is listening so we don't have to
    // hardcode the raycaster.
	this.flatcursorVisible = false;
	this.isDesktop = true;
	this.isGrabbing = false


	// this.surfacecursor = this.el.sceneEl.querySelector("#surfacecursormouse")
	
	// this.flatcursor = this.el.querySelector(".flatcursor")

	// this.ntlmap = this.el.sceneEl.querySelector(".ntlmap").components['ntlmap']

	this.el.addEventListener('raycaster-intersection', evt => {
		this.rayintersected = evt.detail.els[0];
  
  
		// if (this.rayintersected && this.rayintersected.components['clip-box']) {
		// 	this.rayintersected.components['clip-box'].handleHover(true)
		// }
	  });
	this.el.addEventListener('raycaster-intersection-cleared', evt => {
		// if (!this.selected && this.rayintersected && this.rayintersected.components['clip-box']) {
		// 	this.rayintersected.components['clip-box'].handleHover(false)
		// }

		this.rayintersected = null;
	});
  },

  tick: function () {

  }


//   tick: function () {
//     let intersected = true
// 	let intersection = null
// 	let point = null
// 	let h = 0
// 	let u = 0
// 	let v = 0

// 	let createSpot = () => {
// 		// let sphereEl = document.createElement('a-entity')
// 		// sphereEl.setAttribute('geometry', 'primitive: sphere; radius: .01')
// 		// sphereEl.setAttribute('material', 'shader: flat; color: #ff0000')
// 		// sphereEl.setAttribute('radius', '.005')
// 		// sphereEl.setAttribute('position', { x: point.x, y: h * 0.1 + this.ntlmap.position.y, z: point.z })

// 		// this.currentSpot = sphereEl
// 		this.currentSpotPos = {u, v}

// 		let ntlheight = this.ntlmap.el.components['position'].data.y
// 		let ntlscale = this.ntlmap.heatmap.el.components['scale'].data.y

// 		this.surfacecursor.setAttribute('position', { x: point.x, y: h * ntlscale + ntlheight, z: point.z })
// 	}


// 	if (!this.rayintersected) { intersected = false }  // Not intersecting.
// 	else {
// 		intersection = this.el.components.raycaster.getIntersection(this.rayintersected);
// 		if (!intersection) { intersected = false }
// 		// else {
// 		// 	let uv = intersection.uv
// 		// 	u = Math.floor(uv.x * this.ntlmap.width)
// 		// 	v = Math.floor((1-uv.y) * this.ntlmap.height)
// 		// 	h = this.ntlmap.heatmap.heights[this.ntlmap.width * (v - 1) + (u - 1)]
// 		// }
// 	}

// 	if (!intersected) {
// 		// if (this.currentSpot) {
// 		// 	// this.currentSpot.remove()
// 		// 	// this.currentSpot = null
// 		// 	this.currentSpotPos = null
// 		// } 
// 		if (this.flatcursorVisible) {
// 			this.flatcursor.setAttribute('visible', false)
// 			this.flatcursorVisible = false
// 		}
		
// 		return
// 	}

// 	point = intersection.point

// 	if (this.isDesktop)
// 		this.flatcursor.setAttribute('position', point)
// 	else
// 		this.flatcursor.setAttribute('position', {x: 0, y: 0, z: -intersection.distance})

// 	if (!this.flatcursorVisible) {
// 		this.flatcursor.setAttribute('visible', true)
// 		this.flatcursorVisible = true
// 	}

// 	// if (this.currentSpot) {
// 	// 	if (JSON.stringify({u, v}) !== JSON.stringify(this.currentSpotPos)) {
// 	// 		// this.currentSpot.remove()
// 	// 		// this.currentSpot = null
// 	// 		this.currentSpotPos = null

// 	// 		createSpot()
// 	// 	}
// 	// }
// 	// else {
// 	// 	createSpot()
// 	// }
//   }
});