import { LitElement, html, render, css } from "lit"

export class UnConsole extends LitElement {
    static properties = {
		logs: { type: Array },
	}
    
    constructor() {
        super()
    }

	render() {
		return html`
			${this.logs.map(log => {
				return html`
					<p>${log}</p>
				`
			})}
		`
	}

    
}

customElements.define('un-console', UnConsole)