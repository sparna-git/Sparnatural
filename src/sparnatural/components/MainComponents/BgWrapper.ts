import HTMLComponent from "../HtmlComponent";

class BgWrapper extends HTMLComponent {
    constructor(ParentComponent:HTMLComponent){
        super("bg-wrapper",ParentComponent,null)
    }
    render(): this {
        super.render()
        return this
    }
} export default BgWrapper