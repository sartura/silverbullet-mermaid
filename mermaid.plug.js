var A=Object.defineProperty;var M=(t,e)=>{for(var n in e)A(t,n,{get:e[n],enumerable:!0})};function k(t){let e=atob(t),n=e.length,r=new Uint8Array(n);for(let i=0;i<n;i++)r[i]=e.charCodeAt(i);return r}function v(t){typeof t=="string"&&(t=new TextEncoder().encode(t));let e="",n=t.byteLength;for(let r=0;r<n;r++)e+=String.fromCharCode(t[r]);return btoa(e)}var le=new Uint8Array(16),F=class{constructor(t="",e=1e3){this.prefix=t,this.maxCaptureSize=e,this.prefix=t,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let t=e=>(...n)=>{let r=this.prefix?[this.prefix,...n]:n;this.originalConsole[e](...r),this.captureLog(e,n)};console.log=t("log"),console.info=t("info"),console.warn=t("warn"),console.error=t("error"),console.debug=t("debug")}captureLog(t,e){let n={level:t,timestamp:Date.now(),message:e.map(r=>{if(typeof r=="string")return r;try{return JSON.stringify(r)}catch{return String(r)}}).join(" ")};this.logBuffer.push(n),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(t,e){if(this.logBuffer.length>0){let r=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r.map(s=>({...s,source:e})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...r)}}}},b;function E(t=""){return b=new F(t),b}var g=t=>{throw new Error("Not initialized yet")},h=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",P=new Map,x=0;h&&(globalThis.syscall=async(t,...e)=>await new Promise((n,r)=>{x++,P.set(x,{resolve:n,reject:r}),g({type:"sys",id:x,name:t,args:e})}));function w(t,e,n){h&&(g=n,self.addEventListener("message",r=>{(async()=>{let i=r.data;switch(i.type){case"inv":{let s=t[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));g({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),g({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=P.get(s);if(!a)throw Error("Invalid request id");P.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),g({type:"manifest",manifest:e}),E(`[${e.name} plug]`))}async function U(t,e){if(typeof t!="string"){let n=new Uint8Array(await t.arrayBuffer()),r=n.length>0?v(n):void 0;e={method:t.method,headers:Object.fromEntries(t.headers.entries()),base64Body:r},t=t.url}return syscall("sandboxFetch.fetch",t,e)}globalThis.nativeFetch=globalThis.fetch;function B(){globalThis.fetch=async(t,e)=>{let n=e?.body?v(new Uint8Array(await new Response(e.body).arrayBuffer())):void 0,r=await U(t,e&&{method:e.method,headers:e.headers,base64Body:n});return new Response(r.base64Body?k(r.base64Body):null,{status:r.status,headers:r.headers})}}h&&B();typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function o(t,...e){return globalThis.syscall(t,...e)}var f={};M(f,{cleanDatabases:()=>G,getBaseURI:()=>$,getConfig:()=>H,getMode:()=>q,getURLPrefix:()=>W,getVersion:()=>Q,invokeCommand:()=>O,invokeFunction:()=>R,listCommands:()=>j,listSyscalls:()=>_,reloadPlugs:()=>V,wipeClient:()=>N});function R(t,...e){return o("system.invokeFunction",t,...e)}function O(t,e){return o("system.invokeCommand",t,e)}function j(){return o("system.listCommands")}function _(){return o("system.listSyscalls")}function V(){return o("system.reloadPlugs")}function q(){return o("system.getMode")}function W(){return o("system.getURLPrefix")}function $(){return o("system.getBaseURI")}function Q(){return o("system.getVersion")}function H(t,e=void 0){return o("system.getConfig",t,e)}function N(t=!1){return o("system.wipeClient",t)}function G(){return o("system.cleanDatabases")}var we=new Uint8Array(16);var ae=["theme","fillBackground"];function ce(t){let e={};if(!t.startsWith("---"))return{config:e,body:t};let n=t.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);if(!n)return{config:e,body:t};let[r,i,s,a]=n,y=t.slice(r.length),m=[],p=!1,l=null;for(let c of s.split(`
`)){if(c.trimEnd()==="config:"){p=!0,l=null,m.push(c);continue}if(p){let u=c.match(/^(\s+)\S/);if(u){if(l??=u[1],u[1]===l){let d=c.match(/^\s+(\w+):\s*(.*)/);if(d&&ae.includes(d[1])){e[d[1]]=d[2].trim().replace(/^["']|["']$/g,"");continue}}}else/^\S/.test(c)&&(p=!1,l=null)}m.push(c)}return{config:e,body:i+m.join(`
`)+a+y}}async function C(t){let e=await f.getConfig("mermaid",{})??{},n=e.version??"11.15.0",r=e.integrity?`"${e.integrity}"`:'"sha256-cBN+d7snO7LvlyuG6LBADMqL5TyyW/xFkRoYbcmGZd4="';e.integrity_disabled&&(r=void 0);let i="";if(e.icon_packs)for(let c of e.icon_packs)i+=`{
        name: "${c.name}",
        loader: () => fetch("${c.url}").then(r => r.json()),
      },`;let{config:s,body:a}=ce(t),y=s.theme??e.theme??e.initialize?.theme??"default",m=e.custom_themes??{};function p(c){let u=m[c];return u?{theme:u.based_on??"base",themeVars:Object.fromEntries(Object.entries(u).filter(([d])=>d!=="based_on"))}:{theme:c,themeVars:null}}let l=JSON.stringify({initialize:e.initialize??{},theme:p(y),look:e.look??e.initialize?.look??"classic",fillBackground:s.fillBackground?s.fillBackground.toLowerCase()==="true":e.fill_background??!1,center:e.center??!1});return{html:`<pre class="mermaid">${a.replaceAll("<","&lt;")}</pre>`,script:`
    const _mermaidConfig = ${l};
    const _themeConfig = _mermaidConfig.theme;
    loadJsByUrl("https://cdn.jsdelivr.net/npm/mermaid@${n}/dist/mermaid.min.js", ${r}).then(() => {
      const _initConfig = {
        ..._mermaidConfig.initialize,
        startOnLoad: false,
        theme: _themeConfig.theme,
        look: _mermaidConfig.look,
      };
      if (_themeConfig.themeVars) {
        _initConfig.themeVariables = {
          ...(_initConfig.themeVariables ?? {}),
          ..._themeConfig.themeVars,
        };
      }
      mermaid.initialize(_initConfig);
      mermaid.registerIconPacks([${i}]);
      mermaid.run().then(() => {
        if (_mermaidConfig.fillBackground) {
          const bg = mermaid.mermaidAPI.getConfig()?.themeVariables?.background;
          if (bg) {
            document.querySelectorAll("svg").forEach((svg) => {
              svg.style.background = bg;
            });
          }
        }
        if (_mermaidConfig.center) {
          document.querySelectorAll("svg").forEach((svg) => {
            svg.style.display = "block";
            svg.style.marginLeft = "auto";
            svg.style.marginRight = "auto";
          });
        }
        updateHeight();
      });
    });
    document.addEventListener("click", () => {
      api({type: "blur"});
    });
    `}}var T={mermaidWidget:C},S={name:"mermaid",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{mermaidWidget:{path:"./mermaid.ts:widget",codeWidget:"mermaid"}},assets:{}},qe={manifest:S,functionMapping:T};w(T,S,self.postMessage);export{qe as plug};
//# sourceMappingURL=mermaid.plug.js.map
