import { HTMLComponent } from "../HtmlComponent";
import { ArrowComponent } from "./ArrowComponent";
import UiuxConfig from "../IconsConstants";

export class ExpandWidgetValuesBtn extends HTMLComponent {
    onClick: (e: JQuery.ClickEvent) => void;
    count: number = 0;
    backArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_BACK);
    frontArrow = new ArrowComponent(this, UiuxConfig.COMPONENT_ARROW_FRONT);

    constructor(parentComponent: HTMLComponent, onClick: (e: JQuery.ClickEvent) => void) {
        super("ExpandWidgetValuesBtn", parentComponent, null);
        this.onClick = onClick;
    }

    render(count?: number): this {
        if (count !== undefined) {
            this.count = count;
        }
        super.render();
        this.html.empty();
        
        this.backArrow.render();
        let label = `<p><span class="count">+${this.count}</span></p>`;
        this.html.append($(label));
        this.frontArrow.render();
        
        this.html.on("click", (e) => this.onClick(e));
        return this;
    }
}
