
import * as potreeLoader from '../../three-loader/src/index'

const Potree = potreeLoader.Potree;

AFRAME.registerSystem('potree-loader', {
    schema: {
    pointBudget: {default: 1}
    },
    init: function() {
		const el = this.el;
		const data = this.data;
		this.potree = new Potree();
		this.potree.pointBudget = data.pointBudget * 1000000;
		this.pointClouds = [];
		this.clipBoxes = []
		this.yearRange = [1992, 2013]
		this.cloudEls = []
		this.initiated = false
		this.container = document.querySelector('.cloudContainer')

		this.selectedClouds = []

		// we need a sepearte renderer otherwise we get strange artifacts

		this.renderer = new THREE.WebGLRenderer({canvas: el.canvas, logarithmicDepthBuffer: true});
		const size = new THREE.Vector2();
		el.renderer.getSize(size);
		this.renderer.setSize(size.x, size.y)


		for (let i = this.yearRange[0]; i <= this.yearRange[1]; i++) {
			let cloud = document.createElement('a-entity')
			let visibility = false
			let clipMode = 'clip_outside'
			let color = 'red'
			let weighted = false

			if (i == this.yearRange[0]) {
				visibility = true
				clipMode = 'highlight_inside'
				color = 'yellow'
				weighted = true
			}

			cloud.setAttribute('visible', `${visibility}`)
			cloud.setAttribute('class', 'cloud')
			cloud.setAttribute('potree-loader', `
				year: ${i};
				pointColorType: elevation;
				pointSizeType: adaptive;
				gradient: ${color};
				clipMode: ${clipMode};
				pointSize: 1;
				weighted: ${false}
			`)

			this.container.appendChild(cloud)
			this.cloudEls.push(cloud)
		}
    },
    getPotree: function() {
    return this.potree;
    },
    addPointCloud: function(pco) {
    this.pointClouds.push(pco);
    },
    removePointCloud: function(pco) {
    this.pointClouds.forEach(pco => {
        pco.dispose();
    });
    },
    tick: function(time, delta) {
    this._render()
    },
	updateSelectedClouds(index, year) {
		if (this.selectedClouds.length === 0) {
			this.selectedClouds.push(this.pointClouds[year - this.yearRange[0]])
		}	
		else if (year) {
			if (index === 0) {
				let pastCloud = this.selectedClouds[0]
				let newCloud = this.pointClouds[year - this.yearRange[0]]

				pastCloud.el.setAttribute('potree-loader', 'clipMode', 'clip_outside')
				pastCloud.el.setAttribute('potree-loader', 'gradient', 'red')
				pastCloud.el.setAttribute('visible', 'false')
				// pastCloud.dispose()

				newCloud.el.setAttribute('potree-loader', 'clipMode', 'highlight_inside')
				newCloud.el.setAttribute('potree-loader', 'gradient', 'yellow')
				newCloud.el.setAttribute('visible', 'true')

				this.selectedClouds[0] = newCloud

			} 
			else if (this.selectedClouds.length === 2) {
				let pastCloud = this.selectedClouds[1]
				let newCloud = this.pointClouds[year - this.yearRange[0]]

				// pastCloud.dispose()
				pastCloud.el.setAttribute('visible', 'false')
				newCloud.el.setAttribute('visible', 'true')


				this.selectedClouds[1] = this.pointClouds[year - this.yearRange[0]]
				
			}
			else {
				let newCloud = this.pointClouds[year - this.yearRange[0]]

				newCloud.el.setAttribute('visible', 'true')
				this.selectedClouds.push(this.pointClouds[year - this.yearRange[0]])
			}
		}
		else {
			let pastCloud = this.selectedClouds[1]

			pastCloud.el.setAttribute('visible', 'false')
			this.selectedClouds.splice(1)
		}

	},
    _render: function() {
		const camera = this.el.camera;

		const result = this.potree.updatePointClouds(this.selectedClouds, camera, this.renderer);

		if (result.visibleNodes.length > 0 && !this.initiated) {
			this.el.sceneEl.emit('clouds-loaded')

			this.initiated = true
		}
    }
});