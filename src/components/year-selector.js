AFRAME.registerComponent('year-selector', {
	init: function() {
		this.initiated = false
		this.currentColor = '#FFC20A'
		this.previewColor = '#0C7BDC'

		this.currentYear = null
		this.previewYear = null

		this.firstYearsContainer = this.el.querySelector('#firstyears')
		this.secondYearsContainer = this.el.querySelector('#secondyears')

		let firstYears = [1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002]
		let secondYears = [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013]

		this.radioDict = {}

		this.toggle = this.el.querySelector('#year-toggle')
		this.selectionType = 0

		this.targets = [null, null]
		this.colors = [this.currentColor, this.previewColor]
		this.potreeSystem = this.el.sceneEl.systems['potree-loader']

		this.setRadios = [
			this.el.querySelector('#currentRadio'),
			this.el.querySelector('#previewRadio')
		]

		this.miniRadios = [
			this.el.parentEl.parentEl.querySelector('#currentLabel'),
			this.el.parentEl.parentEl.querySelector('#previewLabel')
		]

		this.radioText = [
			'Current Year: ',
			'Preview Year: '
		]

		window.changeSeletionType = () => {
			this.selectionType = 1 - this.selectionType

			Object.values(this.radioDict).forEach(obj => {
				if (obj.el.id === this.targets[0].id) return

				obj.el.setAttribute('active-color', this.colors[this.selectionType])
			})
		}

		window.selectYear = (e) => {
			let selectedYear = e.target.id
			let prevYear = this.targets[this.selectionType]
			let otherYear = this.targets[1 - this.selectionType]

			if (!this.radioDict[selectedYear].active) {
				this.setRadios[this.selectionType].setAttribute('value', this.radioText[this.selectionType] + selectedYear)
				this.miniRadios[this.selectionType].setAttribute('value', this.radioText[this.selectionType] + selectedYear)
				this.radioDict[selectedYear].active = true
				this.targets[this.selectionType] = e.target
				this.potreeSystem.updateSelectedClouds(this.selectionType, selectedYear)

				if (prevYear) prevYear.click()
			}
			else {
				if (prevYear && prevYear.id === selectedYear) {
					if (this.selectionType === 0) prevYear.click()

					else {
						this.radioDict[selectedYear].active = false
						this.targets[this.selectionType] = null
						this.setRadios[this.selectionType].setAttribute('value', this.radioText[this.selectionType] + '0000')
						this.miniRadios[this.selectionType].setAttribute('value', this.radioText[this.selectionType] + '0000')
						this.potreeSystem.updateSelectedClouds(this.selectionType)
					}
				}
				else if (otherYear && otherYear.id === selectedYear) {
					if (this.selectionType - 1 === 0) otherYear.click()
					else {
						this.radioDict[selectedYear].active = false
						this.targets[1 - this.selectionType] = null
						this.setRadios[1 - this.selectionType].setAttribute('value', this.radioText[this.selectionType] + '0000')
						this.miniRadios[1 - this.selectionType].setAttribute('value', this.radioText[this.selectionType] + '0000')
						this.potreeSystem.updateSelectedClouds(1 - this.selectionType)
					}
				}
				else {
					this.radioDict[selectedYear].active = false
				}
			}
		}


		this.toggle.setAttribute('onclick', 'changeSeletionType')

		firstYears.forEach(year => {
			let el = document.createElement('a-gui-radio')
			el.setAttribute('id', `${year}`)
			el.setAttribute('raycastable', '')
			el.setAttribute('class', 'raycastable')
			el.setAttribute('width', '.7')
			el.setAttribute('height', '.2')
			el.setAttribute('value', `${year}`)
			el.setAttribute('font-size', '.2')
			el.setAttribute('margin', '0 0 0.05 0')
			el.setAttribute('onclick', 'selectYear')
			el.setAttribute('active', 'false')
			el.setAttribute('active-color', this.colors[0])
			el.setAttribute('radiosizecoef', 2)


			this.radioDict[year] = {
				el,
				active: false
			}

			this.firstYearsContainer.appendChild(el)
		})

		secondYears.forEach(year => {
			let el = document.createElement('a-gui-radio')
			el.setAttribute('id', `${year}`)
			el.setAttribute('raycastable', '')
			el.setAttribute('class', 'raycastable')
			el.setAttribute('width', '.7')
			el.setAttribute('height', '.2')
			el.setAttribute('value', `${year}`)
			el.setAttribute('font-size', '.2')
			el.setAttribute('margin', '0 0 0.05 0')
			el.setAttribute('onclick', 'selectYear')
			el.setAttribute('active', 'false')
			el.setAttribute('active-color', this.colors[0])
			el.setAttribute('radiosizecoef', 2)

			this.radioDict[year] = {
				el,
				active: false
			}

			this.secondYearsContainer.appendChild(el)
		})
	},
	tick: function() {
		if (this.potreeSystem.pointClouds.length > 0 && !this.initiated) {
			this.radioDict['1992'].el.click()

			this.initiated = true
		}
	}
});