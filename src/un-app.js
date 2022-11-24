/* IMPORT EXTERNAL DEPS */
import { LitElement, html } from "lit"
import { until } from 'lit/directives/until.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'

/* IMPORT COMPONENTS */
import UnDropDown from './components/un-drop-down.js'
import UnGallery from './components/un-gallery.js'
import UnMenuBar from './components/un-menu-bar.js'
import UnHeader from './components/un-header.js'
import UnShopCart from './components/un-shop-cart.js'
import UnShop from './components/un-shop.js'
//import { UnConsole } from './components/un-console.js'

/* IMPORT DATA */
import headerData from './assets/data/header.js'
import postsData from './assets/data/posts.js'

export class UnApp extends LitElement {
    static properties = {
		// public
		theme: { type: String, attribute: true, reflect: true },
		// private observed
		_routes: { type: Array, attribute: false },
		_location: { type: String, attribute: false },
		_lang: { type: String, attribute: false },
		_dataSrc: { type: String, attribute: false }, // 'disk', 'payload'
		_logs: { type: Array, attribute: false },
	}

    constructor() {
        super()
		/* init public observed properties */
		this.theme = 'manu'
		this.host = 'localhost'

		/* init private observed properties */
		this._lang = this._getBrowserLang() || 'en'
		this._logs = []
		
		/* init private properties */
		this._loading = false
		this._homepage = '/blog'
		this._data = {
			about: {
				urlDisk: '/assets/data/about.json',
				complete: false
			},
			publications: {
				urlDisk: '/assets/data/pub.json',
				complete: false
			},
			presentations: {
				urlDisk: '/assets/data/pres.json',
				complete: false
			},
			organizations: {
				urlDisk: '/assets/data/events.json',
				complete: false
			},
			events: {
				urlDisk: '/assets/data/events.json',
				complete: false
			},
			research: {
				urlDisk: '/assets/data/res.json',
				complete: false
			},
		}
		this._routes = {
			404: {
				template: this.renderPageNotFound.bind(this),
				title: "404",
				description: "Page not found",
				menu: false,
			},
			'/blog': {
				template: this.renderPageBlog.bind(this),
				title: { en: 'Blog', de: 'Aktuelles' },
				description: "",
				menu: true
			},
			'/about': {
				template: this.renderPageAbout.bind(this),
				title: { en: 'About me', de: 'Über mich' },
				description: "",
				menu: true,
			},
			'/publications': {
				template: this.renderPagePublications.bind(this),
				title: { en: 'Publications', de: 'Veröffentlichungen' },
				description: "",
				menu: true,
			},
			'/events': {
				template: this.renderPageEvents.bind(this),
				title: { en: 'Events', de: 'Veranstaltungen' },
				description: "",
				menu: true,
				presentations: { en: 'Presentations', de: 'Präsentationen' },
				organizations: { en: 'Organizations', de: 'Organisation' },
			},
			'/research': {
				template: this.renderPageResearch.bind(this),
				title: { en: 'Research', de: 'Forschung' },
				description: "",
				menu: true,
			},
		}

		// paths
		this._paths = {}
		this._paths.assets = '/assets/'
		this._paths.img = '/assets/img/'

		// ADD EVENT LISTENERS

		// create document click that watches the nav links only
		window.addEventListener('click', this, { passive: false })
		// add an event listener to the window that watches for url changes
		window.addEventListener('popstate', this)		
		
		/* FUNCTION CALLS */
		this._updateLocation()
    }

	createRenderRoot() {
		return this
	}

	willUpdate(changedProperties) {
		console.log('willUpdate(): ', changedProperties)
	}

	render() {

		let route = this._routes[this._location] || this._routes['404']

		console.log('render()')
		
		document.title = route.title[this._lang] // throws error if route.title not set!
		document.querySelector('meta[name="description"]').setAttribute("content", route?.description)
		
		return html`
			<header>
				${this.renderHeader(headerData)}
			</header>
			<nav>
				${this.renderMenuBar(this._routes)}
			</nav>
			<main page=${ifDefined(this._location)}>
				${until(route.template(route), this._renderLoading())}
			</main>
			<footer>
				${this.renderFooter()}
			</footer>
		`
	}

	renderHeader(headerData) {
		
		let imgs = headerData[this._lang].images

		return html`
			<un-header theme=${ifDefined(this.theme)} transfx="slide" transtime="10000">
				${imgs.map(img => this._renderImgSrcSetFromPayload(img.image, this._paths.img))}
			</un-header>
		`
	}

	renderMenuBar(routes) {
		return html`
			<un-menu-bar theme=${ifDefined(this.theme)}>
				<a slot="left" href=${ifDefined(this._homepage)}>Manuel Dieterich</a>
				${Object.entries(routes).map(([key, value]) => {
					// create entries for menu-bar
					if (!value.menu) return '' // no entry if not desired
					return html`
						<a slot="right" href=${key}>${value.title[this._lang]}</a>
					`
				})}
				<un-drop-down slot="right" overlay openon="click" theme=${this.theme} lang=${this._lang}>
					<svg slot="icon" width="25px" height="25px" xmlns="http://www.w3.org/2000/svg" data-name="1" viewBox="0 0 128 128"><path d="M64 22a43 43 0 1 0 43 43 43 43 0 0 0-43-43Zm31.46 66a48.19 48.19 0 0 0-9-4.1A70.48 70.48 0 0 0 88.9 67h14a38.75 38.75 0 0 1-7.44 21ZM25.05 67H39.1a70.48 70.48 0 0 0 2.43 16.91 48.19 48.19 0 0 0-9 4.1A38.75 38.75 0 0 1 25.05 67Zm7.49-25a48.19 48.19 0 0 0 9 4.1A70.48 70.48 0 0 0 39.1 63h-14a38.75 38.75 0 0 1 7.44-21ZM66 49.62a71.52 71.52 0 0 0 16.55-2.34A65.13 65.13 0 0 1 84.9 63H66Zm0-4V26.19c6.3 1.18 11.89 7.81 15.33 17.28A67.1 67.1 0 0 1 66 45.62Zm-4-19.43v19.43a67.1 67.1 0 0 1-15.33-2.15C50.11 34 55.7 27.37 62 26.19Zm0 23.43V63H43.1a65.13 65.13 0 0 1 2.35-15.72A71.52 71.52 0 0 0 62 49.62ZM43.1 67H62v13.38a71.52 71.52 0 0 0-16.55 2.34A65.13 65.13 0 0 1 43.1 67ZM62 84.38v19.43c-6.3-1.18-11.89-7.81-15.33-17.28A67.1 67.1 0 0 1 62 84.38Zm4 19.43V84.38a67.1 67.1 0 0 1 15.33 2.15C77.89 96 72.3 102.63 66 103.81Zm0-23.43V67h18.9a65.13 65.13 0 0 1-2.35 15.72A71.52 71.52 0 0 0 66 80.38ZM88.9 63a70.48 70.48 0 0 0-2.43-16.91 48.19 48.19 0 0 0 9-4.1A38.75 38.75 0 0 1 103 63Zm4-24.15a44.18 44.18 0 0 1-7.64 3.43 39.39 39.39 0 0 0-8.12-14 39.06 39.06 0 0 1 15.77 10.57ZM50.85 28.29a39.39 39.39 0 0 0-8.12 14 44.18 44.18 0 0 1-7.64-3.43 39.06 39.06 0 0 1 15.76-10.57ZM35.09 91.15a44.18 44.18 0 0 1 7.64-3.43 39.39 39.39 0 0 0 8.12 14 39.06 39.06 0 0 1-15.76-10.57Zm42.06 10.56a39.39 39.39 0 0 0 8.12-14 44.18 44.18 0 0 1 7.64 3.43 39.06 39.06 0 0 1-15.76 10.57Z"/><path d="M64 0A64 64 0 0 0 8.26 95.43l-8.19 30A2 2 0 0 0 2 128a1.79 1.79 0 0 0 .51-.07l30.39-8A64 64 0 1 0 64 0Zm0 124a60 60 0 0 1-29.83-8 2 2 0 0 0-1-.26 2.22 2.22 0 0 0-.51.06l-27.82 7.38 7.49-27.5a2 2 0 0 0-.2-1.53A60 60 0 1 1 64 124Z"/></svg>
					<button class="lang-switch">English</button>
					<button class="lang-switch">Deutsch</button>
				</un-drop-down>
			</un-menu-bar>
		`
	}

	renderFooter() {
		return html`
			<ul class="un-logger">
				${this._logs.map(log => {
					return html`
						<li class="un-log">${log}</li>
					`
				})}
			</ul>
		`
	}

	renderPageBlog(route) {
		// requires 
		// - postsData

		let posts = postsData[this._lang].docs // get the content

		return html`
			<h1>${route.title[this._lang]}</h1>
			${posts.map(post => {
				let createdArray = post.createdAt.slice(0,10).split('-')
				let createdStr = `${createdArray[2]}.${createdArray[1]}.${createdArray[1]}`
				return html`
					<article>
						<h3 class="title">
							<span>${post.title}</span>
							<span class="created">${createdStr}</span>
						</h3>
						<div class="rt-content">
							${unsafeHTML(post.contentHtml)}
						</div>
					</article>
				`
			})}
		`
	}

	async renderPageAbout(route) {
		// requires
		// - this._data.about

		this._data.about.json = this._data.about.json ?? await this._fetchJson(this._data.about.urlDisk)
		let about = this._data.about.json[this._lang]

		return html`
			<h1>${about.title}</h1>
			<article>
				<div class="rt-content">
					${unsafeHTML(about.contentHtml)}
				</div>
				${this._renderImgSrcSetFromPayload(about.image, this._paths.img)}
			</article>
		`
	}

	async renderPagePublications(route) {

		this._data.publications.json = this._data.publications.json ?? await this._fetchJson(this._data.publications.urlDisk)
		let publications = this._data.publications.json[this._lang].docs
		let currItemYear
		let prevItemYear

		publications.sort((a, b) => b.year - a.year)

		return html`
			<!-- PUBLICATIONS -->
			<h1>${route.title[this._lang]}</h1>
			${publications.map(pub => {
				currItemYear = pub.year
				// only insert a year heading if the previous item had a different year
				let yearHeading = (currItemYear !== prevItemYear) ? html`<h4>${pub.year}</h4>` : ""
				prevItemYear = pub.year //
				return html`
					${yearHeading}
					<div class="rt-content">
						${unsafeHTML(pub.contentHtml)}
					</div>
					`
			})}
		`
	}

	async renderPageEvents(route) {
		
		this._data.presentations.json = this._data.presentations.json ?? await this._fetchJson(this._data.presentations.urlDisk)
		this._data.organizations.json = this._data.organizations.json ?? await this._fetchJson(this._data.organizations.urlDisk)

		let presentations = this._data.presentations.json[this._lang].docs
        let organizations = this._data.organizations.json[this._lang].docs
        let prevItemYear
        let currItemYear
		// sort in descending order:
		presentations.sort((a, b) => b.year - a.year)
		organizations.sort((a, b) => b.year - a.year)

		return html`
			<!-- EVENTS -->
			<h1>${route.title[this._lang]}</h1>
			<!-- PRESENTATIONS -->
			<h2>${route.presentations[this._lang]}</h2>
			${presentations.map(pres => {
				currItemYear = pres.year
				// if year of current item is different from previous one then insert heading, else not
				let yearHeading = (currItemYear !== prevItemYear) ? html`<h4>${pres.year}</h4>` : ""
				prevItemYear = pres.year //
				return html`
					${yearHeading}
					<div class="rt-content">
						${unsafeHTML(pres.contentHtml)}
					</div>
				`
			})}
			<!-- ORGANIZATION -->
			<h2>${route.organizations[this._lang]}</h2>
			${organizations.map(orga => {
				currItemYear = orga.year
				let yearHeading = (currItemYear !== prevItemYear) ? html`<h4>${orga.year}</h4>` : ""
				prevItemYear = orga.year //
				return html`
					${yearHeading}
					<div class="rt-content">
						${unsafeHTML(orga.contentHtml)}
					</div>
				`
			})}
		`
	}

	async renderPageResearch(route) {

		this._data.research.json = this._data.research.json ?? await this._fetchJson(this._data.research.urlDisk)
		let research = this._data.research.json[this._lang].docs

		return html`
			<h1>${route.title[this._lang]}</h1>
			${research.map(res => {
				
				let intro = (res?.intro) ? html`<div class="intro">${res.intro}</div>` : ""
				let subtitle = (res?.subtitle) ? html`<h4 class="subtitle">${res.subtitle}</h4>` : ""

				return html`
					<article>
						<h2>${res.title}</h2>
						<h3>${subtitle}</h3>
						<div class="intro">${intro}</div>
						<div class="rt-content">${unsafeHTML(res.contentHtml)}</div>
						${this._renderImgSrcSetFromPayload(res, this._paths.img)}
					</article>
				`
			})}
		`
	}

	renderPageNotFound() {
		return html`PAGE NOT FOUND: <b style="color: darkblue">${this._location}</b>`
	}

	_renderImgSrcSet(src = { original: '', img1920: '', img1366: '', img1024: '', img768: '', img640: ''}, imgDir) {
					
		let img1920Str = (src.img1920) ? `${imgDir}${src.img1920} 1920w, ` : ""
		let img1600Str = (src.img1600) ? `${imgDir}${src.img1600} 1600w, ` : ""
		let img1366Str = (src.img1366) ? `${imgDir}${src.img1366} 1366w, ` : ""
		let img1024Str = (src.img1024) ? `${imgDir}${src.img1024} 1024w, ` : ""
		let img768Str = (src.img768) ? `${imgDir}${src.img768} 768w, ` : ""
		let img640Str = (src.img640) ? `${imgDir}${src.img640} 640w, ` : ""

		return html`
			<img
				src=${imgDir}${src.original}
				srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}"
				sizes="
					(max-width: 640px) 640px, 
					(max-width: 768px) 768px, 
					(max-width: 1024px) 1024px,
					(max-width: 1366px) 1366px,
					(max-width: 1600px) 1600px,
					1920px"
				loading="lazy"
			>
		`
	}

	_renderImgSrcSetFromPayload(payloadImgObj, imgDir) {
    
		let imgEl
		if (!payloadImgObj.sizes) payloadImgObj = payloadImgObj.image // try reassigning one lvl down 
		if (payloadImgObj.sizes) {
			// if there are different sizes...
			let imgSizes = payloadImgObj.sizes
	
			let img1920Str = (Object.keys(imgSizes.img1920).length !== 0) ? `${imgDir}${imgSizes.img1920.filename} 1920w, ` : ""
			let img1600Str = (Object.keys(imgSizes.img1600).length !== 0) ? `${imgDir}${imgSizes.img1600.filename} 1600w, ` : ""
			let img1366Str = (Object.keys(imgSizes.img1366).length !== 0) ? `${imgDir}${imgSizes.img1366.filename} 1366w, ` : ""
			let img1024Str = (Object.keys(imgSizes.img1024).length !== 0) ? `${imgDir}${imgSizes.img1024.filename} 1024w, ` : ""
			let img768Str = (Object.keys(imgSizes.img768).length !== 0) ? `${imgDir}${imgSizes.img768.filename} 768w, ` : ""
			let img640Str = (Object.keys(imgSizes.img640).length !== 0) ? `${imgDir}${imgSizes.img640.filename} 640w, ` : ""
			let imgOriginal = `${imgDir}${payloadImgObj.filename}`
	
			imgEl = html`
			<img
				srcset="${img1920Str}${img1600Str}${img1366Str}${img1024Str}${img768Str}${img640Str}${imgOriginal}"
				sizes="
					(max-width: 640px) 640px, 
					(max-width: 768px) 768px, 
					(max-width: 1024px) 1024px,
					(max-width: 1366px) 1366px,
					(max-width: 1600px) 1600px,
					1920px"
				>
			`
		} else if (payloadImgObj.filename) {
			// if there is just one size...
			imgEl =  html`<img src="${imgDir}${payloadImgObj.filename}">`
		} else {
			throw ReferenceError(payloadImgObj, 'does not contain image properties')
		}
	
		return imgEl
	}

	_renderLoading() {
		return html`
			<span>Loading...</span>
		`
	}

	firstUpdated() {
		//this.unConsole = this.renderRoot.querySelector('un-console')
		//console.log('un-console found')
	}

	// EVENT LISTENERS

	handleEvent(evt) {
		// click
		if (evt.type === 'click') {
			let evtTargetZero = evt?.composedPath()[0]
			// <a> 
			if (evtTargetZero.matches('a') && evtTargetZero.href.includes(location.hostname)) { // <-- watch out if you try this on a different device!
				evt.preventDefault()
				console.log('[evt] internal anchor clicked: ', evtTargetZero)
				window.history.pushState({}, "", evtTargetZero.href) // push the new location into the browser url bar and the history
				//window.dispatchEvent(new Event('popstate'))
				this._updateLocation()
			}

			// <button>
			else if (evtTargetZero.matches('button') && evtTargetZero.classList.contains('lang-switch')) {
				console.log('lang-switch')
				switch (evt.target.textContent)  {
					case 'Deutsch':
						//window.localStorage.setItem('userLang', 'de')
						this._lang = 'de'
						break
					case 'English':
						//window.localStorage.setItem('userLang', 'en')
						this._lang = 'en'
						break
				}
			}
	  	}
		// popstate
	  	else if (evt.type === 'popstate') {
			console.log('[evt] popstate')
			this._updateLocation()
		}
	}

	_log(newLog) {
		this._logs = [...this._logs, newLog]
	}

	_getBrowserLang() {
		let browserLang
		switch(navigator.language) {
			case 'en-us':
			case 'en-US':
			case 'en':
				browserLang = 'en'
				break
			case 'de':
				browserLang = 'de'
				break
			default:
				browserLang = 'de' // this is the default userLang value
		}
		console.log('_getBrowserLang(): ', browserLang)
		return browserLang
	}


	// HELPER FUNCTIONS
	_updateLocation() {
		// triggers render()
		if (window.location.pathname === '/') {
			window.history.pushState({}, "", this._homepage) // push the new location into the browser url bar and the history
		}
		this._location = window.location.pathname // retrieve and save it (the URL slug after the origin)
		console.dir('updateLocation(): ', this._location)
	}

	async _fetchJson(url) {
		// returns json
		try {
			this._loading = true
			let res = await fetch(url)
			let json = await res.json()
			console.log('_fetchJson(): ', url)
			console.log(json)
			this._loading = false
			return json		
		} catch (err) {
			console.error('_fetchJson(): failed to fetch ', url)
		}
	}
}

customElements.define('un-app', UnApp)