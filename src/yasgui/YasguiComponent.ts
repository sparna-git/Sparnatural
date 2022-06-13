import Yasgui from "@triply/yasgui";
import Tab from "@triply/yasgui/build/ts/src/Tab";
import "@triply/yasgui/build/yasgui.min.css";

export class YasguiComponent extends HTMLElement {

  maxTabSize: number = 1; //default tabsize. multiple tabs currently not supported with sparnatural
  Yasgui = new Yasgui(document.getElementById("yasgui"), {
    requestConfig: {
      endpoint: () => {
        if (this.endpoint) return this.endpoint;
        console.warn("No Endpoint for Yasgui defined");
      },
    },
    copyEndpointOnNewTab: false,
  });

  constructor() {
    super();
    //this.tab = this.Yasgui.getTab()
    this.Yasgui.on("tabAdd", (instance: Yasgui, newTabId: string) => {
      console.log("addTabsevent");
      // TODO delete or prevent tab from getting created
    });

    //this.tab = this.Yasgui.getTab()
    /* IMPORTANT do i have to set Yasr.setResponse here?
      this.Yasgui.on("queryResponse",(instance: Yasgui, tab: Tab) => {
      })
      */
  }
  connectedCallback() {
    this.dispatchEvent(new CustomEvent('componentLoaded',{bubbles:true,detail:this.Yasgui.getTab()}))
  }

  set endpoint(endpoint: string) {
    this.setAttribute('endpoint',endpoint)
  }

  get endpoint(){
    return this.getAttribute('endpoint')
  }

  get tab():Tab {
    return this.Yasgui.getTab()
  }
  set tab(tab:Tab){
    this.Yasgui.tabElements.addTab(tab.getId())
  }

}

customElements.get("yas-gui") ||
  window.customElements.define("yas-gui", YasguiComponent);
