import Yasgui from "@triply/yasgui";
import "@triply/yasgui/build/yasgui.min.css";


export class YasguiComponent extends HTMLElement {
    Yasgui:Yasgui
    endpoint: string = null
    
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
            // Add a new Tab. Returns the new Tab object.
      this.Yasgui.addTab(
        true, // set as active tab
        { ...Yasgui.Tab.getDefaults(), name: "my new tab" }
      );
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