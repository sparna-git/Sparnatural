/*! For license information please see sparnatural-text-query.js.LICENSE.txt */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.SparnaturalTextQuery=e():t.SparnaturalTextQuery=e()}(this,()=>(()=>{"use strict";var t={d:(e,s)=>{for(var i in s)t.o(s,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:s[i]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};t.r(e),t.d(e,{I18n:()=>mt,QueryContainer:()=>bt,QueryMicrophone:()=>At,QuerySend:()=>St,SparnaturalServices:()=>Ct});const s=globalThis,i=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;class o{constructor(t,e,s){if(this._$cssResult$=!0,s!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&n.set(e,t))}return t}toString(){return this.cssText}}const a=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new o(s,t,r)},l=(t,e)=>{if(i)t.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of e){const e=document.createElement("style"),r=s.litNonce;void 0!==r&&e.setAttribute("nonce",r),e.textContent=i.cssText,t.appendChild(e)}},h=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:c,defineProperty:d,getOwnPropertyDescriptor:p,getOwnPropertyNames:u,getOwnPropertySymbols:g,getPrototypeOf:f}=Object,y=globalThis,v=y.trustedTypes,m=v?v.emptyScript:"",$=y.reactiveElementPolyfillSupport,b=(t,e)=>t,_={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},A=(t,e)=>!c(t,e),w={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:A};Symbol.metadata??=Symbol("metadata"),y.litPropertyMetadata??=new WeakMap;class S extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);r?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=f(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...u(t),...g(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(h(t))}else void 0!==t&&e.push(h(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return l(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:_).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:_;this._$Em=i;const n=r.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s){if(void 0!==t){const i=this.constructor,r=this[t];if(s??=i.getPropertyOptions(t),!((s.hasChanged??A)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}}S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[b("elementProperties")]=new Map,S[b("finalized")]=new Map,$?.({ReactiveElement:S}),(y.reactiveElementVersions??=[]).push("2.1.1");const x=globalThis,E=x.trustedTypes,C=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,O="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+P,T=`<${R}>`,M=document,U=()=>M.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,j=Array.isArray,q="[ \t\n\f\r]",k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,N=/>/g,z=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,I=/"/g,W=/^(?:script|style|textarea|title)$/i,B=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),V=B(1),F=(B(2),B(3),Symbol.for("lit-noChange")),Q=Symbol.for("lit-nothing"),J=new WeakMap,K=M.createTreeWalker(M,129);function Z(t,e){if(!j(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const Y=(t,e)=>{const s=t.length-1,i=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=k;for(let e=0;e<s;e++){const s=t[e];let a,l,h=-1,c=0;for(;c<s.length&&(o.lastIndex=c,l=o.exec(s),null!==l);)c=o.lastIndex,o===k?"!--"===l[1]?o=L:void 0!==l[1]?o=N:void 0!==l[2]?(W.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=z):void 0!==l[3]&&(o=z):o===z?">"===l[0]?(o=r??k,h=-1):void 0===l[1]?h=-2:(h=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?z:'"'===l[3]?I:D):o===I||o===D?o=z:o===L||o===N?o=k:(o=z,r=void 0);const d=o===z&&t[e+1].startsWith("/>")?" ":"";n+=o===k?s+T:h>=0?(i.push(a),s.slice(0,h)+O+s.slice(h)+P+d):s+P+(-2===h?e:d)}return[Z(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[l,h]=Y(t,e);if(this.el=G.createElement(l,s),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=K.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(O)){const e=h[n++],s=i.getAttribute(t).split(P),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?it:"?"===o[1]?rt:"@"===o[1]?nt:st}),i.removeAttribute(t)}else t.startsWith(P)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(W.test(i.tagName)){const t=i.textContent.split(P),e=t.length-1;if(e>0){i.textContent=E?E.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],U()),K.nextNode(),a.push({type:2,index:++r});i.append(t[e],U())}}}else if(8===i.nodeType)if(i.data===R)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(P,t+1));)a.push({type:7,index:r}),t+=P.length-1}r++}}static createElement(t,e){const s=M.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,i){if(e===F)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const n=H(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=X(t,r._$AS(t,e.values),r,i)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??M).importNode(e,!0);K.currentNode=i;let r=K.nextNode(),n=0,o=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new et(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new ot(r,this,t)),this._$AV.push(e),a=s[++o]}n!==a?.index&&(r=K.nextNode(),n++)}return K.currentNode=M,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=Q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),H(t)?t===Q||null==t||""===t?(this._$AH!==Q&&this._$AR(),this._$AH=Q):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>j(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Q&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(Z(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new tt(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=J.get(t.strings);return void 0===e&&J.set(t.strings,e=new G(t)),e}k(t){j(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new et(this.O(U()),this.O(U()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=Q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=Q}_$AI(t,e=this,s,i){const r=this.strings;let n=!1;if(void 0===r)t=X(this,t,e,0),n=!H(t)||t!==this._$AH&&t!==F,n&&(this._$AH=t);else{const i=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=X(this,i[s+o],e,o),a===F&&(a=this._$AH[o]),n||=!H(a)||a!==this._$AH[o],a===Q?t=Q:t!==Q&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!i&&this.j(t)}j(t){t===Q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Q?void 0:t}}class rt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Q)}}class nt extends st{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??Q)===F)return;const s=this._$AH,i=t===Q&&s!==Q||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==Q&&(s===Q||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const at=x.litHtmlPolyfillSupport;at?.(G,et),(x.litHtmlVersions??=[]).push("3.3.1");const lt=globalThis;class ht extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new et(e.insertBefore(U(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}ht._$litElement$=!0,ht.finalized=!0,lt.litElementHydrateSupport?.({LitElement:ht});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:ht}),(lt.litElementVersions??=[]).push("4.2.1");const dt=t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:A},ut=(t=pt,e,s)=>{const{kind:i,metadata:r}=s;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),n.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const r=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,r,t)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];e.call(this,s),this.requestUpdate(i,r,t)}}throw Error("Unsupported decorator location: "+i)};function gt(t){return(e,s)=>"object"==typeof s?ut(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function ft(t){return gt({...t,state:!0,attribute:!1})}const yt=JSON.parse('{"warning-1":"⚠️ Warning, the following values were not found: {valuesList}","warning-2":". You should review your query and manually search or select the correct values.","error-empty-prompt":"The input field is empty. Please enter a query.","error-not-understood":"The query was not understood","ia-response":"⚠️ Agent AI Response: {explanation}","error-service-url":"The service URL is not set."}'),vt=JSON.parse('{"error-empty-prompt":"Le champ de saisie est vide. Veuillez entrer une requête.","error-not-understood":"La requête n\'a pas été comprise","warning-1":"⚠️ Attention, les valeurs suivantes n\'ont pas été trouvées : {valuesList}","warning-2":". Vous devriez revoir votre requête et rechercher ou sélectionner manuellement les valeurs correctes.","ia-response":"⚠️ Réponse de l\'agent IA: {explanation}","error-service-url":"L\'URL du service n\'est pas définie."}');class mt{constructor(){}static init(t){mt.labels=mt.i18nLabelsResources[t]}}mt.i18nLabelsResources={en:yt,fr:vt};var $t=function(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o};let bt=class extends ht{constructor(){super(...arguments),this.lang="en",this.value="",this.serviceHref="",this.i18n=mt.i18nLabelsResources.en,this._serviceAttrObserver=null,this.onMicToggle=t=>{this.value=t.detail;const e=this.getTextarea();e&&(e.value=this.value,this.autoSize(e)),this.hideMessage()}}firstUpdated(){mt.init(this.lang),this.addEventListener("query-warning",t=>{const e=String(t.detail).trim();e&&this.showWarningMessage(e)}),this.addEventListener("query-error",t=>{const e=String(t.detail).trim();e&&this.showErrorMessage(e)});const t=this.shadowRoot.querySelector('slot[name="input"]');t&&(t.addEventListener("slotchange",()=>this._wireTextarea()),this._wireTextarea());const e=this.shadowRoot.querySelector('slot[name="dropdown"]');e&&(e.addEventListener("slotchange",()=>this._wireSelect()),this._wireSelect())}updated(t){t.has("lang")&&(mt.init(this.lang),this.i18n=mt.i18nLabelsResources[this.lang]||mt.i18nLabelsResources.en)}disconnectedCallback(){super.disconnectedCallback(),this._serviceAttrObserver&&(this._serviceAttrObserver.disconnect(),this._serviceAttrObserver=null)}getTextarea(){const t=this.shadowRoot.querySelector('slot[name="input"]');if(!t)return null;const e=t.assignedElements({flatten:!0}).find(t=>"textarea"===t.tagName.toLowerCase());return e||null}_wireTextarea(){const t=this.getTextarea();t&&(t._qcWired||(t.addEventListener("input",t=>this.onInputChange(t)),t._qcWired=!0),t.style.setProperty("resize","none","important"),t.style.setProperty("border","none","important"),t.style.overflow="hidden",this.autoSize(t))}autoSize(t){t.style.height="auto";const e=Math.min(Math.max(t.scrollHeight,24),120);t.style.height=e+"px"}syncServiceHref(){const t=this.querySelector("sparnatural-services"),e=t?.getAttribute("href")||"";e!==this.serviceHref&&(this.serviceHref=e),this._serviceAttrObserver&&(this._serviceAttrObserver.disconnect(),this._serviceAttrObserver=null),t&&(this._serviceAttrObserver=new MutationObserver(t=>{for(const e of t)if("attributes"===e.type&&"href"===e.attributeName){const t=e.target.getAttribute("href")||"";t!==this.serviceHref&&(this.serviceHref=t)}}),this._serviceAttrObserver.observe(t,{attributes:!0,attributeFilter:["href"]}))}getSelect(){const t=this.shadowRoot.querySelector('slot[name="dropdown"]');if(!t)return null;const e=t.assignedElements({flatten:!0}).find(t=>"select"===t.tagName.toLowerCase());return e||null}_wireSelect(){const t=this.getSelect();t&&(t._qcWired||(t.addEventListener("change",t=>this.onSelectChange(t)),t._qcWired=!0))}onInputChange(t){const e=t.target;this.autoSize(e),this.value=e.value,this.hideMessage()}onSelectChange(t){const e=t.target,s=e.value;if(s){this.value=s;const t=this.getTextarea();t&&(t.value=this.value,this.autoSize(t)),this.hideMessage(),e.value=""}}onOptionSelected(t){this.value=t.detail;const e=this.getTextarea();e&&(e.value=this.value,this.autoSize(e)),this.hideMessage()}onLoadQueryFromSend(t){this.dispatchEvent(new CustomEvent("loadQuery",{detail:t.detail,bubbles:!0,composed:!0}))}showWarningMessage(t){const e=this.renderRoot.querySelector(".message-container");e&&(e.innerHTML=`<div class="warning-message">${t}</div>`)}showErrorMessage(t){const e=this.renderRoot.querySelector(".message-container");e&&(e.innerHTML=`<div class="error-message">${t}</div>`)}hideMessage(){const t=this.renderRoot.querySelector(".message-container");t&&(t.innerHTML="")}render(){return V`
      <div class="container">
        <!-- textarea natif slotté -->
        <slot name="input" id="input-slot"></slot>

        <div class="controls">
          <slot
            name="services"
            @slotchange=${()=>this.syncServiceHref()}
          ></slot>

          <slot name="dropdown"></slot>

          <query-microphone
            .lang=${this.lang}
            @mic-result=${this.onMicToggle}
          ></query-microphone>

          <query-send
            .value=${this.value}
            .href=${this.serviceHref}
            .i18n=${this.i18n}
            @load-query=${this.onLoadQueryFromSend}
            @query-warning=${t=>this.showWarningMessage(String(t.detail))}
            @query-error=${t=>this.showErrorMessage(String(t.detail))}
          ></query-send>
        </div>
      </div>

      <div class="message-container"></div>
    `}};bt.styles=a`
    :host {
      display: block;
      max-width: 700px;
      margin: 0 auto auto;
      font-family: sans-serif;
      background: rgba(29, 224, 153, 0.1);
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
    }
    .container {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 4px;
      gap: 6px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Styles appliqués au <textarea> slotté */
    :host ::slotted(textarea) {
      flex: 1;
      border: none;
      outline: none;
      font-size: 16px;
      font-family: inherit;
      overflow: hidden;
      background: transparent;
      line-height: 1.5;
      padding: 8px 0;
      margin: 0;
      min-width: 500px;
      resize: none !important;
      min-height: 50px;
      max-height: 120px;
      height: auto;
    }

    /* Styles appliqués au <select> slotté */
    :host ::slotted(select) {
      width: 36px !important;
      height: 36px !important;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0 !important;
      font-size: 12px;
      background-color: #f8f9fa;
      color: #495057;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 36px;
      max-width: 36px;
    }

    :host ::slotted(select:hover) {
      background-color: #e9ecef;
      border-color: #adb5bd;
    }

    :host ::slotted(select:focus) {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .message-container {
      display: block;
      margin-top: 10px;
    }
    .warning-message {
      background: #fff3cd;
      padding: 10px;
      border-radius: 6px;
      color: #856404;
    }
    .error-message {
      background: #f8d7da;
      padding: 10px;
      border-radius: 6px;
      color: #721c24;
    }
  `,$t([gt({type:String,reflect:!0})],bt.prototype,"lang",void 0),$t([ft()],bt.prototype,"value",void 0),$t([ft()],bt.prototype,"serviceHref",void 0),$t([ft()],bt.prototype,"i18n",void 0),bt=$t([dt("sparnatural-text-query")],bt);var _t=function(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o};let At=class extends ht{constructor(){super(...arguments),this.lang="fr",this.recording=!1,this.recognition=null}connectedCallback(){super.connectedCallback();const t=window.SpeechRecognition||window.webkitSpeechRecognition;t&&(this.recognition=new t,this.setRecognitionLang(),this.recognition.interimResults=!1,this.recognition.onresult=t=>{const e=t.results[0][0].transcript;this.dispatchEvent(new CustomEvent("mic-result",{detail:e})),this.recording=!1},this.recognition.onerror=()=>{this.recording=!1})}updated(t){t.has("lang")&&this.recognition&&this.setRecognitionLang()}setRecognitionLang(){this.recognition.lang="fr"===this.lang?"fr-FR":"en-US",console.log("Micro lang set to:",this.recognition.lang)}toggleRecording(){this.recognition&&(this.recording?(this.recording=!1,this.recognition.stop()):(this.recording=!0,this.recognition.start()))}render(){return V`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <button @click=${this.toggleRecording}>
        <i
          class=${this.recording?"fa-solid fa-microphone recording":"fa-solid fa-microphone"}
        ></i>
      </button>
    `}};At.styles=a`
    button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 16px;
      background-color: #f8f9fa;
      color: #495057;
    }

    button:hover {
      background-color: #e9ecef;
    }

    .recording {
      color: rgb(72, 206, 152);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.6;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,_t([gt({type:String})],At.prototype,"lang",void 0),_t([ft()],At.prototype,"recording",void 0),At=_t([dt("query-microphone")],At);var wt=function(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o};let St=class extends ht{constructor(){super(...arguments),this.sending=!1,this.value="",this.href=""}fmt(t,e={}){return t.replace(/\{(\w+)\}/g,(t,s)=>String(e[s]??`{${s}}`))}detectNotFoundValues(t){const e=[],s=t=>{if("object"==typeof t&&null!==t){Array.isArray(t.values)&&t.values.forEach(t=>{t.rdfTerm&&"uri"===t.rdfTerm.type&&"https://services.sparnatural.eu/api/v1/URI_NOT_FOUND"===t.rdfTerm.value&&t.label&&(e.includes(t.label)||e.push(t.label))});for(const e in t)if(t.hasOwnProperty(e)){const i=t[e];"object"==typeof i&&s(i)}}};return s(t),e}buildUrl(){return`${this.href?this.href.endsWith("/")?this.href:this.href+"/":""}text2query?text=${encodeURIComponent(this.value||"")}`}async send(){if(!this.value||!this.value.trim())return void this.dispatchEvent(new CustomEvent("query-error",{detail:this.i18n["error-empty-prompt"],bubbles:!0,composed:!0}));if(!this.href)return void this.dispatchEvent(new CustomEvent("query-error",{detail:this.i18n["error-service-url"],bubbles:!0,composed:!0}));this.sending=!0,this.value;const t=this.buildUrl();try{const e=await fetch(t);if(204===e.status){let t=this.i18n["error-not-understood"];try{const s=await e.json();s?.metadata?.explanation&&(t=s.metadata.explanation)}catch{}throw new Error(t)}if(!e.ok)throw new Error(`Erreur HTTP ${e.status}`);const s=await e.json(),i=this.detectNotFoundValues(s);if(i.length>0){const t=i.map(t=>`"${t}"`).join(", ");this.dispatchEvent(new CustomEvent("query-warning",{detail:this.fmt(this.i18n["warning-1"],{valuesList:t})+this.i18n["warning-2"],bubbles:!0,composed:!0})),console.log("Not found values:",t)}const r=s?.metadata?.explanation;"string"==typeof r&&r.trim().length>0&&this.dispatchEvent(new CustomEvent("query-warning",{detail:this.fmt(this.i18n["ia-response"],{explanation:r}),bubbles:!0,composed:!0}));const n={...s,metadata:{...s.metadata||{}}};n.metadata&&n.metadata.explanation&&delete n.metadata.explanation,this.dispatchEvent(new CustomEvent("load-query",{detail:{query:n},bubbles:!0,composed:!0}))}catch(t){const e=t?.message||"Erreur inconnue";this.dispatchEvent(new CustomEvent("query-error",{detail:e,bubbles:!0,composed:!0}))}finally{this.sending=!1}}render(){return V`
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <button @click=${this.send} ?disabled=${this.sending} title="Send">
        <i
          class=${this.sending?"fas fa-spinner fa-spin":"fa-solid fa-arrow-up"}
        ></i>
      </button>
    `}};St.styles=a`
    button {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 16px;
      background-color: rgb(2, 184, 117);
      color: white;
    }
    button[disabled] {
      opacity: 0.6;
      cursor: default;
    }
    button:hover {
      background-color: rgba(2, 184, 117, 0.8);
    }
  `,wt([ft()],St.prototype,"sending",void 0),wt([gt({type:String})],St.prototype,"value",void 0),wt([gt({type:String})],St.prototype,"href",void 0),wt([gt({type:Object})],St.prototype,"i18n",void 0),St=wt([dt("query-send")],St);var xt=function(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o};const Et={href:""};let Ct=class extends ht{constructor(){super(),this.href="",this.settings={...Et},console.log("SparnaturalServices (Lit) constructed")}connectedCallback(){super.connectedCallback(),console.log("SparnaturalServices (Lit) connected to DOM"),this.updateSettings()}updated(t){t.has("href")&&this.updateSettings()}updateSettings(){this.settings={...Et,href:this.href},console.log("Updated settings:",this.settings)}render(){return V`
      <div>
        <slot></slot>
      </div>
    `}};return Ct.styles=a`
    :host {
      display: block;
    }
  `,xt([gt({type:String})],Ct.prototype,"href",void 0),xt([ft()],Ct.prototype,"settings",void 0),Ct=xt([dt("sparnatural-services")],Ct),e})());
//# sourceMappingURL=sparnatural-text-query.js.map