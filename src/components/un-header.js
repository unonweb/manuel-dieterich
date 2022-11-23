import { LitElement, css, html } from 'lit'

export default class UnHeader extends LitElement {

	static properties = {
		transfx: { type: String, attribute: true, reflect: true }, // 'flash', 'grey', 'blend'
		transtime: { type: Number, attribute: true, reflect: true }, // 5000
		theme: { type: String, attribute: true, reflect: true },

		_slottedElements: { type: Array, attribute: false },
	}

	constructor() {
		super()
		
		// init public
		
		// internal properties
		this._slideReverse = false
		this._shownImgIndex = 0

	}

  	render() {
		console.log('render()')

    	return html`
			<link rel="stylesheet" href='/components/un-header--core.css'>
			<link rel="stylesheet" href='/components/un-header--add.css'>
			<slot></slot>
    	`
  	}

	firstUpdated() {
		console.log('firstUpdated()')
		let slots = this.shadowRoot.querySelector('slot')
		this._slottedElements = slots.assignedElements({flatten: true})
		if (this._slottedElements.length === 0) console.error('this.slottedElements.length === 0')
		else if (this._slottedElements.length === 1) {
			//console.log('single img found: ', this.slottedElements)
			this._slottedElements[this._shownImgIndex].classList.add('show') // showcase first img
		}
		else if (this._slottedElements.length > 1) {
			// if there are multiple images
			
			this.transfx = this.transfx ?? 'grey'
			this.transtime = this.transtime ?? 5000

			this._slottedElements.forEach(el => el.style.setProperty('transition', 'unset')) // this hack is necessary to get rid of any transitions during the initial load 
			this._slottedElements[this._shownImgIndex].classList.add('show') // showcase first img
			
			setTimeout(() => {
				console.log('starting setInterval... ')
				this._slottedElements.forEach(el => el.style.removeProperty('transition'))
				setInterval(this.slideImgIndex.bind(this), this.transtime)
			}, 5000)
		}
	}

	slideImgIndex() {
		//console.log('slideImgIndex()')
		let currIndex = this._shownImgIndex
		let newIndex

		// set slide direction
		if (currIndex === this._slottedElements.length - 1) {
			this._slideReverse = true
		}
		if (currIndex === 0) {
			this._slideReverse = false
		}
		
		if (this._slideReverse) {
			newIndex = currIndex - 1
		} else {
			newIndex = currIndex + 1
		}

		this._slottedElements[currIndex].classList.remove('show') // 
		this._slottedElements[newIndex].classList.add('show') // 

		// finally change the index
		this._shownImgIndex = newIndex // update index
	}
}

customElements.define('un-header', UnHeader)