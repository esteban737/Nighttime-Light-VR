import * as potreeLoader from '../../three-loader/src/index'

const PointColorType = potreeLoader.PointColorType;
const PointShape = potreeLoader.PointShape;
const PointSizeType = potreeLoader.PointSizeType;
const ClipMode = potreeLoader.ClipMode;

AFRAME.registerComponent('potree-loader', {
    schema: {
    year: {
		type: 'number',
		default: 1992
    },
    pointSize: {
        type: 'number',
        default: 1
    },
    minimumNodePixelSize: {
        default: 150,
        min: 0,
        max: 1000,
        type: 'number'
    },
    pointSizeType: {
        default: 'adaptive',
        oneOf: Object.values(PointSizeType).filter(v => !Number.isInteger(v)).map(v => v.toLowerCase())
    },
    pointShape: {
        default: 'square',
        oneOf: Object.values(PointShape).filter(v => !Number.isInteger(v)).map(v => v.toLowerCase())
    },
    pointColorType: {
        default: 'rgb',
        oneOf: Object.values(PointColorType).filter(v => !Number.isInteger(v)).map(v => v.toLowerCase())
    },
    weighted: {
        default: false,
        type: 'boolean'
    },
	clipMode: {
        default: 'clip_disabled',
        oneOf: Object.values(ClipMode).filter(v => !Number.isInteger(v)).map(v => v.toLowerCase())
    },
	gradient: {
        default: 'spectral',
        type: 'string'
    }
    },
    multiple: false,
    init: function () {

    const data = this.data;
    const el = this.el;

	// this.scaleHeight = this.el.components.scale.data.z

	this.scaleHeight = this.el.parentEl.getAttribute('scaleheight')

	this.el.setAttribute('scale', `1 1 ${this.scaleHeight}`)
	this.el.setAttribute('position', `0 0 ${-this.scaleHeight * 8}`)
	
    const potree = this.system.getPotree();

    potree
        .loadPointCloud(
        'cloud.js',
        url => `assets/clouds/${data.year}/${url}`,
        )
        .then(pco => {
        this.pco = pco;
        this.system.addPointCloud(pco);
		this.heightMax = pco.material.heightMax;
		this.heightMin = pco.material.heightMin;
		this.isExtruded = true

		pco.material.setClipBoxes(this.system.clipBoxes)

        this._updatePointCloud(pco);
        this.system._render()

        const box = pco.boundingBox;
        const boundingSphere = new THREE.Sphere();
        box.getBoundingSphere(boundingSphere);
        const center = boundingSphere.center;
        const radius = boundingSphere.radius;

        const span = 1;
        const s = (radius === 0 ? 1 : 1.0 / radius) * span;
        //pco.scale.set(s, s, s);

        const obj = new THREE.Object3D();
        obj.add(pco)
        el.setObject3D('mesh', obj)

        el.emit('model-loaded', pco);
        })
        .catch(err => {
        console.warn(err)
        el.emit('model-error', {src: `${data.src}`});
        } );

    },

    
    update: function (oldData) {
		const data = this.data;

		if (AFRAME.utils.deepEqual(data, oldData)) return;

		if (this.pco) {
			this._updatePointCloud(this.pco);
		}
    },

    _updatePointCloud: function (pco) {
    const data = this.data;

    pco.material.size = data.pointSize;

    pco.material.pointColorType = PointColorType[data.pointColorType.toUpperCase()];
    pco.material.pointShapeType = PointShape[data.pointShape.toUpperCase()];
    pco.material.pointSizeType = PointSizeType[data.pointSizeType.toUpperCase()];
	pco.material.clipMode = ClipMode[data.clipMode.toUpperCase()];
	pco.material.weighted = data.weighted

	pco.material.gradient = potreeLoader[data.gradient.toUpperCase()];

	pco.material.heightMax = this.heightMax * this.scaleHeight
	pco.material.heightMin = this.heightMin * this.scaleHeight

    pco.minimumNodePixelSize = data.minimumNodePixelSize;
    },
    
    remove: function () {
    this.system.removePointCloud(this.pco);
    //this.el.object3D.remove(pco);
    },
    
    tick: function (time, delta) { 
		let tempHeight = this.el.parentEl.getAttribute('scaleheight')

		if (this.scaleHeight === tempHeight || !this.isExtruded) return

		this.scaleHeight = tempHeight

		this.el.setAttribute('scale', `1 1 ${this.scaleHeight}`)
		this.el.setAttribute('position', `0 0 ${-this.scaleHeight * 8}`)

		if (this.pco) {
			this._updatePointCloud(this.pco);
		}
    },

	toggleExtrusion() {
		if (this.isExtruded) {
			this.pco.material.heightMax = this.heightMax * 0.001
			this.pco.material.heightMin = this.heightMin * 0.001
			
			this.el.setAttribute('scale', `1 1 ${0.001}`)
			this.el.setAttribute('position', `0 0 ${-0.001 * 8}`)
		}
		else {
			this.el.setAttribute('scale', `1 1 ${this.scaleHeight}`)
			this.el.setAttribute('position', `0 0 ${-this.scaleHeight * 8}`)

			this.pco.material.heightMax = this.heightMax * this.scaleHeight
			this.pco.material.heightMin = this.heightMin * this.scaleHeight
		}

		this.isExtruded = !this.isExtruded
	}
});