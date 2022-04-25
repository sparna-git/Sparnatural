import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";
import Tab from "@triply/yasgui"
import PersistedJson from "@triply/yasgui"


export class YasguiComponent extends HTMLElement {
    Yasgui:Yasgui
    endpoint: string = null
    maxTabSize: number = 1 //default tabsize. multiple tabs currently not supported with sparnatural
    
    constructor(){
      super()
      console.warn('YAGSUi constructor called')
      $(this).attr('id', 'yasg-container');
      this.Yasgui = new Yasgui(document.getElementById("yasgui"), {
          requestConfig:{
            endpoint: ()=>{
              if(this.endpoint) return this.endpoint
              console.warn("No Endpoint for Yasgui defined")
            }
          },
          copyEndpointOnNewTab: false,
        });
        this.Yasgui.on("tabAdd", (instance: Yasgui, newTabId: string) => {
          console.log("addTabsevent")
          // TODO delete or prevent tab from getting created
        })
        /* IMPORTANT do i have to set Yasr.setResponse here?
      this.Yasgui.on("queryResponse",(instance: Yasgui, tab: Tab) => {
        console.log("do i have to do that?")
      })
      */
    }

    setEndpoint(endpoint:string){
        this.endpoint = endpoint
    }

    getTab(tabName?:string){
      return this.Yasgui.getTab(tabName)
    }
}

customElements.get('yas-gui') || window.customElements.define('yas-gui', YasguiComponent);