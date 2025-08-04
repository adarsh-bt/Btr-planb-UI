import{R as P,r as s,ac as qr}from"./index-Ddles9lG.js";var G=function(){return G=Object.assign||function(t){for(var n,r=1,o=arguments.length;r<o;r++){n=arguments[r];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},G.apply(this,arguments)};function gt(e,t,n){if(n||arguments.length===2)for(var r=0,o=t.length,a;r<o;r++)(a||!(r in t))&&(a||(a=Array.prototype.slice.call(t,0,r)),a[r]=t[r]);return e.concat(a||Array.prototype.slice.call(t))}var j="-ms-",Ke="-moz-",_="-webkit-",Bn="comm",yt="rule",Yt="decl",Xr="@import",Gn="@keyframes",Zr="@layer",Yn=Math.abs,Vt=String.fromCharCode,Ft=Object.assign;function Qr(e,t){return z(e,0)^45?(((t<<2^z(e,0))<<2^z(e,1))<<2^z(e,2))<<2^z(e,3):0}function Vn(e){return e.trim()}function pe(e,t){return(e=t.exec(e))?e[0]:e}function E(e,t,n){return e.replace(t,n)}function it(e,t,n){return e.indexOf(t,n)}function z(e,t){return e.charCodeAt(t)|0}function Fe(e,t,n){return e.slice(t,n)}function le(e){return e.length}function Un(e){return e.length}function Ue(e,t){return t.push(e),e}function Jr(e,t){return e.map(t).join("")}function yn(e,t){return e.filter(function(n){return!pe(n,t)})}var xt=1,Ne=1,Kn=0,te=0,T=0,Be="";function Ct(e,t,n,r,o,a,i,c){return{value:e,root:t,parent:n,type:r,props:o,children:a,line:xt,column:Ne,length:i,return:"",siblings:c}}function ye(e,t){return Ft(Ct("",null,null,"",null,null,0,e.siblings),e,{length:-e.length},t)}function He(e){for(;e.root;)e=ye(e.root,{children:[e]});Ue(e,e.siblings)}function eo(){return T}function to(){return T=te>0?z(Be,--te):0,Ne--,T===10&&(Ne=1,xt--),T}function oe(){return T=te<Kn?z(Be,te++):0,Ne++,T===10&&(Ne=1,xt++),T}function Oe(){return z(Be,te)}function lt(){return te}function St(e,t){return Fe(Be,e,t)}function Nt(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function no(e){return xt=Ne=1,Kn=le(Be=e),te=0,[]}function ro(e){return Be="",e}function It(e){return Vn(St(te-1,Mt(e===91?e+2:e===40?e+1:e)))}function oo(e){for(;(T=Oe())&&T<33;)oe();return Nt(e)>2||Nt(T)>3?"":" "}function ao(e,t){for(;--t&&oe()&&!(T<48||T>102||T>57&&T<65||T>70&&T<97););return St(e,lt()+(t<6&&Oe()==32&&oe()==32))}function Mt(e){for(;oe();)switch(T){case e:return te;case 34:case 39:e!==34&&e!==39&&Mt(T);break;case 40:e===41&&Mt(e);break;case 92:oe();break}return te}function so(e,t){for(;oe()&&e+T!==57;)if(e+T===84&&Oe()===47)break;return"/*"+St(t,te-1)+"*"+Vt(e===47?e:oe())}function io(e){for(;!Nt(Oe());)oe();return St(e,te)}function lo(e){return ro(ct("",null,null,null,[""],e=no(e),0,[0],e))}function ct(e,t,n,r,o,a,i,c,d){for(var h=0,u=0,g=i,y=0,f=0,x=0,R=1,O=1,$=1,S=0,m="",C=o,D=a,v=r,p=m;O;)switch(x=S,S=oe()){case 40:if(x!=108&&z(p,g-1)==58){it(p+=E(It(S),"&","&\f"),"&\f",Yn(h?c[h-1]:0))!=-1&&($=-1);break}case 34:case 39:case 91:p+=It(S);break;case 9:case 10:case 13:case 32:p+=oo(x);break;case 92:p+=ao(lt()-1,7);continue;case 47:switch(Oe()){case 42:case 47:Ue(co(so(oe(),lt()),t,n,d),d);break;default:p+="/"}break;case 123*R:c[h++]=le(p)*$;case 125*R:case 59:case 0:switch(S){case 0:case 125:O=0;case 59+u:$==-1&&(p=E(p,/\f/g,"")),f>0&&le(p)-g&&Ue(f>32?Cn(p+";",r,n,g-1,d):Cn(E(p," ","")+";",r,n,g-2,d),d);break;case 59:p+=";";default:if(Ue(v=xn(p,t,n,h,u,o,c,m,C=[],D=[],g,a),a),S===123)if(u===0)ct(p,t,v,v,C,a,g,c,D);else switch(y===99&&z(p,3)===110?100:y){case 100:case 108:case 109:case 115:ct(e,v,v,r&&Ue(xn(e,v,v,0,0,o,c,m,o,C=[],g,D),D),o,D,g,c,r?C:D);break;default:ct(p,v,v,v,[""],D,0,c,D)}}h=u=f=0,R=$=1,m=p="",g=i;break;case 58:g=1+le(p),f=x;default:if(R<1){if(S==123)--R;else if(S==125&&R++==0&&to()==125)continue}switch(p+=Vt(S),S*R){case 38:$=u>0?1:(p+="\f",-1);break;case 44:c[h++]=(le(p)-1)*$,$=1;break;case 64:Oe()===45&&(p+=It(oe())),y=Oe(),u=g=le(m=p+=io(lt())),S++;break;case 45:x===45&&le(p)==2&&(R=0)}}return a}function xn(e,t,n,r,o,a,i,c,d,h,u,g){for(var y=o-1,f=o===0?a:[""],x=Un(f),R=0,O=0,$=0;R<r;++R)for(var S=0,m=Fe(e,y+1,y=Yn(O=i[R])),C=e;S<x;++S)(C=Vn(O>0?f[S]+" "+m:E(m,/&\f/g,f[S])))&&(d[$++]=C);return Ct(e,t,n,o===0?yt:c,d,h,u,g)}function co(e,t,n,r){return Ct(e,t,n,Bn,Vt(eo()),Fe(e,2,-2),0,r)}function Cn(e,t,n,r,o){return Ct(e,t,n,Yt,Fe(e,0,r),Fe(e,r+1,-1),r,o)}function qn(e,t,n){switch(Qr(e,t)){case 5103:return _+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return _+e+e;case 4789:return Ke+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return _+e+Ke+e+j+e+e;case 5936:switch(z(e,t+11)){case 114:return _+e+j+E(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return _+e+j+E(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return _+e+j+E(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return _+e+j+e+e;case 6165:return _+e+j+"flex-"+e+e;case 5187:return _+e+E(e,/(\w+).+(:[^]+)/,_+"box-$1$2"+j+"flex-$1$2")+e;case 5443:return _+e+j+"flex-item-"+E(e,/flex-|-self/g,"")+(pe(e,/flex-|baseline/)?"":j+"grid-row-"+E(e,/flex-|-self/g,""))+e;case 4675:return _+e+j+"flex-line-pack"+E(e,/align-content|flex-|-self/g,"")+e;case 5548:return _+e+j+E(e,"shrink","negative")+e;case 5292:return _+e+j+E(e,"basis","preferred-size")+e;case 6060:return _+"box-"+E(e,"-grow","")+_+e+j+E(e,"grow","positive")+e;case 4554:return _+E(e,/([^-])(transform)/g,"$1"+_+"$2")+e;case 6187:return E(E(E(e,/(zoom-|grab)/,_+"$1"),/(image-set)/,_+"$1"),e,"")+e;case 5495:case 3959:return E(e,/(image-set\([^]*)/,_+"$1$`$1");case 4968:return E(E(e,/(.+:)(flex-)?(.*)/,_+"box-pack:$3"+j+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+_+e+e;case 4200:if(!pe(e,/flex-|baseline/))return j+"grid-column-align"+Fe(e,t)+e;break;case 2592:case 3360:return j+E(e,"template-","")+e;case 4384:case 3616:return n&&n.some(function(r,o){return t=o,pe(r.props,/grid-\w+-end/)})?~it(e+(n=n[t].value),"span",0)?e:j+E(e,"-start","")+e+j+"grid-row-span:"+(~it(n,"span",0)?pe(n,/\d+/):+pe(n,/\d+/)-+pe(e,/\d+/))+";":j+E(e,"-start","")+e;case 4896:case 4128:return n&&n.some(function(r){return pe(r.props,/grid-\w+-start/)})?e:j+E(E(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return E(e,/(.+)-inline(.+)/,_+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(le(e)-1-t>6)switch(z(e,t+1)){case 109:if(z(e,t+4)!==45)break;case 102:return E(e,/(.+:)(.+)-([^]+)/,"$1"+_+"$2-$3$1"+Ke+(z(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return~it(e,"stretch",0)?qn(E(e,"stretch","fill-available"),t,n)+e:e}break;case 5152:case 5920:return E(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,o,a,i,c,d,h){return j+o+":"+a+h+(i?j+o+"-span:"+(c?d:+d-+a)+h:"")+e});case 4949:if(z(e,t+6)===121)return E(e,":",":"+_)+e;break;case 6444:switch(z(e,z(e,14)===45?18:11)){case 120:return E(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+_+(z(e,14)===45?"inline-":"")+"box$3$1"+_+"$2$3$1"+j+"$2box$3")+e;case 100:return E(e,":",":"+j)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return E(e,"scroll-","scroll-snap-")+e}return e}function ft(e,t){for(var n="",r=0;r<e.length;r++)n+=t(e[r],r,e,t)||"";return n}function uo(e,t,n,r){switch(e.type){case Zr:if(e.children.length)break;case Xr:case Yt:return e.return=e.return||e.value;case Bn:return"";case Gn:return e.return=e.value+"{"+ft(e.children,r)+"}";case yt:if(!le(e.value=e.props.join(",")))return""}return le(n=ft(e.children,r))?e.return=e.value+"{"+n+"}":""}function po(e){var t=Un(e);return function(n,r,o,a){for(var i="",c=0;c<t;c++)i+=e[c](n,r,o,a)||"";return i}}function go(e){return function(t){t.root||(t=t.return)&&e(t)}}function fo(e,t,n,r){if(e.length>-1&&!e.return)switch(e.type){case Yt:e.return=qn(e.value,e.length,n);return;case Gn:return ft([ye(e,{value:E(e.value,"@","@"+_)})],r);case yt:if(e.length)return Jr(n=e.props,function(o){switch(pe(o,r=/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":He(ye(e,{props:[E(o,/:(read-\w+)/,":"+Ke+"$1")]})),He(ye(e,{props:[o]})),Ft(e,{props:yn(n,r)});break;case"::placeholder":He(ye(e,{props:[E(o,/:(plac\w+)/,":"+_+"input-$1")]})),He(ye(e,{props:[E(o,/:(plac\w+)/,":"+Ke+"$1")]})),He(ye(e,{props:[E(o,/:(plac\w+)/,j+"input-$1")]})),He(ye(e,{props:[o]})),Ft(e,{props:yn(n,r)});break}return""})}}var Q={},Me=typeof process<"u"&&Q!==void 0&&(Q.REACT_APP_SC_ATTR||Q.SC_ATTR)||"data-styled",Xn="active",Zn="data-styled-version",vt="6.1.14",Ut=`/*!sc*/
`,ht=typeof window<"u"&&"HTMLElement"in window,ho=!!(typeof SC_DISABLE_SPEEDY=="boolean"?SC_DISABLE_SPEEDY:typeof process<"u"&&Q!==void 0&&Q.REACT_APP_SC_DISABLE_SPEEDY!==void 0&&Q.REACT_APP_SC_DISABLE_SPEEDY!==""?Q.REACT_APP_SC_DISABLE_SPEEDY!=="false"&&Q.REACT_APP_SC_DISABLE_SPEEDY:typeof process<"u"&&Q!==void 0&&Q.SC_DISABLE_SPEEDY!==void 0&&Q.SC_DISABLE_SPEEDY!==""&&Q.SC_DISABLE_SPEEDY!=="false"&&Q.SC_DISABLE_SPEEDY),Rt=Object.freeze([]),Le=Object.freeze({});function mo(e,t,n){return n===void 0&&(n=Le),e.theme!==n.theme&&e.theme||t||n.theme}var Qn=new Set(["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","tr","track","u","ul","use","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"]),bo=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,wo=/(^-|-$)/g;function Sn(e){return e.replace(bo,"-").replace(wo,"")}var yo=/(a)(d)/gi,rt=52,vn=function(e){return String.fromCharCode(e+(e>25?39:97))};function Lt(e){var t,n="";for(t=Math.abs(e);t>rt;t=t/rt|0)n=vn(t%rt)+n;return(vn(t%rt)+n).replace(yo,"$1-$2")}var At,Jn=5381,Te=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},er=function(e){return Te(Jn,e)};function xo(e){return Lt(er(e)>>>0)}function Co(e){return e.displayName||e.name||"Component"}function _t(e){return typeof e=="string"&&!0}var tr=typeof Symbol=="function"&&Symbol.for,nr=tr?Symbol.for("react.memo"):60115,So=tr?Symbol.for("react.forward_ref"):60112,vo={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},Ro={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},rr={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},$o=((At={})[So]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},At[nr]=rr,At);function Rn(e){return("type"in(t=e)&&t.type.$$typeof)===nr?rr:"$$typeof"in e?$o[e.$$typeof]:vo;var t}var Eo=Object.defineProperty,Oo=Object.getOwnPropertyNames,$n=Object.getOwnPropertySymbols,Po=Object.getOwnPropertyDescriptor,ko=Object.getPrototypeOf,En=Object.prototype;function or(e,t,n){if(typeof t!="string"){if(En){var r=ko(t);r&&r!==En&&or(e,r,n)}var o=Oo(t);$n&&(o=o.concat($n(t)));for(var a=Rn(e),i=Rn(t),c=0;c<o.length;++c){var d=o[c];if(!(d in Ro||n&&n[d]||i&&d in i||a&&d in a)){var h=Po(t,d);try{Eo(e,d,h)}catch{}}}}return e}function ke(e){return typeof e=="function"}function Kt(e){return typeof e=="object"&&"styledComponentId"in e}function Ee(e,t){return e&&t?"".concat(e," ").concat(t):e||t||""}function On(e,t){if(e.length===0)return"";for(var n=e[0],r=1;r<e.length;r++)n+=e[r];return n}function Ze(e){return e!==null&&typeof e=="object"&&e.constructor.name===Object.name&&!("props"in e&&e.$$typeof)}function zt(e,t,n){if(n===void 0&&(n=!1),!n&&!Ze(e)&&!Array.isArray(e))return t;if(Array.isArray(t))for(var r=0;r<t.length;r++)e[r]=zt(e[r],t[r]);else if(Ze(t))for(var r in t)e[r]=zt(e[r],t[r]);return e}function qt(e,t){Object.defineProperty(e,"toString",{value:t})}function De(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return new Error("An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#".concat(e," for more information.").concat(t.length>0?" Args: ".concat(t.join(", ")):""))}var Do=function(){function e(t){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=t}return e.prototype.indexOfGroup=function(t){for(var n=0,r=0;r<t;r++)n+=this.groupSizes[r];return n},e.prototype.insertRules=function(t,n){if(t>=this.groupSizes.length){for(var r=this.groupSizes,o=r.length,a=o;t>=a;)if((a<<=1)<0)throw De(16,"".concat(t));this.groupSizes=new Uint32Array(a),this.groupSizes.set(r),this.length=a;for(var i=o;i<a;i++)this.groupSizes[i]=0}for(var c=this.indexOfGroup(t+1),d=(i=0,n.length);i<d;i++)this.tag.insertRule(c,n[i])&&(this.groupSizes[t]++,c++)},e.prototype.clearGroup=function(t){if(t<this.length){var n=this.groupSizes[t],r=this.indexOfGroup(t),o=r+n;this.groupSizes[t]=0;for(var a=r;a<o;a++)this.tag.deleteRule(r)}},e.prototype.getGroup=function(t){var n="";if(t>=this.length||this.groupSizes[t]===0)return n;for(var r=this.groupSizes[t],o=this.indexOfGroup(t),a=o+r,i=o;i<a;i++)n+="".concat(this.tag.getRule(i)).concat(Ut);return n},e}(),dt=new Map,mt=new Map,ut=1,ot=function(e){if(dt.has(e))return dt.get(e);for(;mt.has(ut);)ut++;var t=ut++;return dt.set(e,t),mt.set(t,e),t},Io=function(e,t){ut=t+1,dt.set(e,t),mt.set(t,e)},Ao="style[".concat(Me,"][").concat(Zn,'="').concat(vt,'"]'),_o=new RegExp("^".concat(Me,'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')),jo=function(e,t,n){for(var r,o=n.split(","),a=0,i=o.length;a<i;a++)(r=o[a])&&e.registerName(t,r)},Ho=function(e,t){for(var n,r=((n=t.textContent)!==null&&n!==void 0?n:"").split(Ut),o=[],a=0,i=r.length;a<i;a++){var c=r[a].trim();if(c){var d=c.match(_o);if(d){var h=0|parseInt(d[1],10),u=d[2];h!==0&&(Io(u,h),jo(e,u,d[3]),e.getTag().insertRules(h,o)),o.length=0}else o.push(c)}}},Pn=function(e){for(var t=document.querySelectorAll(Ao),n=0,r=t.length;n<r;n++){var o=t[n];o&&o.getAttribute(Me)!==Xn&&(Ho(e,o),o.parentNode&&o.parentNode.removeChild(o))}};function To(){return typeof __webpack_nonce__<"u"?__webpack_nonce__:null}var ar=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=function(c){var d=Array.from(c.querySelectorAll("style[".concat(Me,"]")));return d[d.length-1]}(n),a=o!==void 0?o.nextSibling:null;r.setAttribute(Me,Xn),r.setAttribute(Zn,vt);var i=To();return i&&r.setAttribute("nonce",i),n.insertBefore(r,a),r},Fo=function(){function e(t){this.element=ar(t),this.element.appendChild(document.createTextNode("")),this.sheet=function(n){if(n.sheet)return n.sheet;for(var r=document.styleSheets,o=0,a=r.length;o<a;o++){var i=r[o];if(i.ownerNode===n)return i}throw De(17)}(this.element),this.length=0}return e.prototype.insertRule=function(t,n){try{return this.sheet.insertRule(n,t),this.length++,!0}catch{return!1}},e.prototype.deleteRule=function(t){this.sheet.deleteRule(t),this.length--},e.prototype.getRule=function(t){var n=this.sheet.cssRules[t];return n&&n.cssText?n.cssText:""},e}(),No=function(){function e(t){this.element=ar(t),this.nodes=this.element.childNodes,this.length=0}return e.prototype.insertRule=function(t,n){if(t<=this.length&&t>=0){var r=document.createTextNode(n);return this.element.insertBefore(r,this.nodes[t]||null),this.length++,!0}return!1},e.prototype.deleteRule=function(t){this.element.removeChild(this.nodes[t]),this.length--},e.prototype.getRule=function(t){return t<this.length?this.nodes[t].textContent:""},e}(),Mo=function(){function e(t){this.rules=[],this.length=0}return e.prototype.insertRule=function(t,n){return t<=this.length&&(this.rules.splice(t,0,n),this.length++,!0)},e.prototype.deleteRule=function(t){this.rules.splice(t,1),this.length--},e.prototype.getRule=function(t){return t<this.length?this.rules[t]:""},e}(),kn=ht,Lo={isServer:!ht,useCSSOMInjection:!ho},sr=function(){function e(t,n,r){t===void 0&&(t=Le),n===void 0&&(n={});var o=this;this.options=G(G({},Lo),t),this.gs=n,this.names=new Map(r),this.server=!!t.isServer,!this.server&&ht&&kn&&(kn=!1,Pn(this)),qt(this,function(){return function(a){for(var i=a.getTag(),c=i.length,d="",h=function(g){var y=function($){return mt.get($)}(g);if(y===void 0)return"continue";var f=a.names.get(y),x=i.getGroup(g);if(f===void 0||!f.size||x.length===0)return"continue";var R="".concat(Me,".g").concat(g,'[id="').concat(y,'"]'),O="";f!==void 0&&f.forEach(function($){$.length>0&&(O+="".concat($,","))}),d+="".concat(x).concat(R,'{content:"').concat(O,'"}').concat(Ut)},u=0;u<c;u++)h(u);return d}(o)})}return e.registerId=function(t){return ot(t)},e.prototype.rehydrate=function(){!this.server&&ht&&Pn(this)},e.prototype.reconstructWithOptions=function(t,n){return n===void 0&&(n=!0),new e(G(G({},this.options),t),this.gs,n&&this.names||void 0)},e.prototype.allocateGSInstance=function(t){return this.gs[t]=(this.gs[t]||0)+1},e.prototype.getTag=function(){return this.tag||(this.tag=(t=function(n){var r=n.useCSSOMInjection,o=n.target;return n.isServer?new Mo(o):r?new Fo(o):new No(o)}(this.options),new Do(t)));var t},e.prototype.hasNameForId=function(t,n){return this.names.has(t)&&this.names.get(t).has(n)},e.prototype.registerName=function(t,n){if(ot(t),this.names.has(t))this.names.get(t).add(n);else{var r=new Set;r.add(n),this.names.set(t,r)}},e.prototype.insertRules=function(t,n,r){this.registerName(t,n),this.getTag().insertRules(ot(t),r)},e.prototype.clearNames=function(t){this.names.has(t)&&this.names.get(t).clear()},e.prototype.clearRules=function(t){this.getTag().clearGroup(ot(t)),this.clearNames(t)},e.prototype.clearTag=function(){this.tag=void 0},e}(),zo=/&/g,Wo=/^\s*\/\/.*$/gm;function ir(e,t){return e.map(function(n){return n.type==="rule"&&(n.value="".concat(t," ").concat(n.value),n.value=n.value.replaceAll(",",",".concat(t," ")),n.props=n.props.map(function(r){return"".concat(t," ").concat(r)})),Array.isArray(n.children)&&n.type!=="@keyframes"&&(n.children=ir(n.children,t)),n})}function Bo(e){var t,n,r,o=Le,a=o.options,i=a===void 0?Le:a,c=o.plugins,d=c===void 0?Rt:c,h=function(y,f,x){return x.startsWith(n)&&x.endsWith(n)&&x.replaceAll(n,"").length>0?".".concat(t):y},u=d.slice();u.push(function(y){y.type===yt&&y.value.includes("&")&&(y.props[0]=y.props[0].replace(zo,n).replace(r,h))}),i.prefix&&u.push(fo),u.push(uo);var g=function(y,f,x,R){f===void 0&&(f=""),x===void 0&&(x=""),R===void 0&&(R="&"),t=R,n=f,r=new RegExp("\\".concat(n,"\\b"),"g");var O=y.replace(Wo,""),$=lo(x||f?"".concat(x," ").concat(f," { ").concat(O," }"):O);i.namespace&&($=ir($,i.namespace));var S=[];return ft($,po(u.concat(go(function(m){return S.push(m)})))),S};return g.hash=d.length?d.reduce(function(y,f){return f.name||De(15),Te(y,f.name)},Jn).toString():"",g}var Go=new sr,Wt=Bo(),lr=P.createContext({shouldForwardProp:void 0,styleSheet:Go,stylis:Wt});lr.Consumer;P.createContext(void 0);function Dn(){return s.useContext(lr)}var Yo=function(){function e(t,n){var r=this;this.inject=function(o,a){a===void 0&&(a=Wt);var i=r.name+a.hash;o.hasNameForId(r.id,i)||o.insertRules(r.id,i,a(r.rules,i,"@keyframes"))},this.name=t,this.id="sc-keyframes-".concat(t),this.rules=n,qt(this,function(){throw De(12,String(r.name))})}return e.prototype.getName=function(t){return t===void 0&&(t=Wt),this.name+t.hash},e}(),Vo=function(e){return e>="A"&&e<="Z"};function In(e){for(var t="",n=0;n<e.length;n++){var r=e[n];if(n===1&&r==="-"&&e[0]==="-")return e;Vo(r)?t+="-"+r.toLowerCase():t+=r}return t.startsWith("ms-")?"-"+t:t}var cr=function(e){return e==null||e===!1||e===""},dr=function(e){var t,n,r=[];for(var o in e){var a=e[o];e.hasOwnProperty(o)&&!cr(a)&&(Array.isArray(a)&&a.isCss||ke(a)?r.push("".concat(In(o),":"),a,";"):Ze(a)?r.push.apply(r,gt(gt(["".concat(o," {")],dr(a),!1),["}"],!1)):r.push("".concat(In(o),": ").concat((t=o,(n=a)==null||typeof n=="boolean"||n===""?"":typeof n!="number"||n===0||t in qr||t.startsWith("--")?String(n).trim():"".concat(n,"px")),";")))}return r};function Pe(e,t,n,r){if(cr(e))return[];if(Kt(e))return[".".concat(e.styledComponentId)];if(ke(e)){if(!ke(a=e)||a.prototype&&a.prototype.isReactComponent||!t)return[e];var o=e(t);return Pe(o,t,n,r)}var a;return e instanceof Yo?n?(e.inject(n,r),[e.getName(r)]):[e]:Ze(e)?dr(e):Array.isArray(e)?Array.prototype.concat.apply(Rt,e.map(function(i){return Pe(i,t,n,r)})):[e.toString()]}function Uo(e){for(var t=0;t<e.length;t+=1){var n=e[t];if(ke(n)&&!Kt(n))return!1}return!0}var Ko=er(vt),qo=function(){function e(t,n,r){this.rules=t,this.staticRulesId="",this.isStatic=(r===void 0||r.isStatic)&&Uo(t),this.componentId=n,this.baseHash=Te(Ko,n),this.baseStyle=r,sr.registerId(n)}return e.prototype.generateAndInjectStyles=function(t,n,r){var o=this.baseStyle?this.baseStyle.generateAndInjectStyles(t,n,r):"";if(this.isStatic&&!r.hash)if(this.staticRulesId&&n.hasNameForId(this.componentId,this.staticRulesId))o=Ee(o,this.staticRulesId);else{var a=On(Pe(this.rules,t,n,r)),i=Lt(Te(this.baseHash,a)>>>0);if(!n.hasNameForId(this.componentId,i)){var c=r(a,".".concat(i),void 0,this.componentId);n.insertRules(this.componentId,i,c)}o=Ee(o,i),this.staticRulesId=i}else{for(var d=Te(this.baseHash,r.hash),h="",u=0;u<this.rules.length;u++){var g=this.rules[u];if(typeof g=="string")h+=g;else if(g){var y=On(Pe(g,t,n,r));d=Te(d,y+u),h+=y}}if(h){var f=Lt(d>>>0);n.hasNameForId(this.componentId,f)||n.insertRules(this.componentId,f,r(h,".".concat(f),void 0,this.componentId)),o=Ee(o,f)}}return o},e}(),bt=P.createContext(void 0);bt.Consumer;function Xo(e){var t=P.useContext(bt),n=s.useMemo(function(){return function(r,o){if(!r)throw De(14);if(ke(r)){var a=r(o);return a}if(Array.isArray(r)||typeof r!="object")throw De(8);return o?G(G({},o),r):r}(e.theme,t)},[e.theme,t]);return e.children?P.createElement(bt.Provider,{value:n},e.children):null}var jt={};function Zo(e,t,n){var r=Kt(e),o=e,a=!_t(e),i=t.attrs,c=i===void 0?Rt:i,d=t.componentId,h=d===void 0?function(C,D){var v=typeof C!="string"?"sc":Sn(C);jt[v]=(jt[v]||0)+1;var p="".concat(v,"-").concat(xo(vt+v+jt[v]));return D?"".concat(D,"-").concat(p):p}(t.displayName,t.parentComponentId):d,u=t.displayName,g=u===void 0?function(C){return _t(C)?"styled.".concat(C):"Styled(".concat(Co(C),")")}(e):u,y=t.displayName&&t.componentId?"".concat(Sn(t.displayName),"-").concat(t.componentId):t.componentId||h,f=r&&o.attrs?o.attrs.concat(c).filter(Boolean):c,x=t.shouldForwardProp;if(r&&o.shouldForwardProp){var R=o.shouldForwardProp;if(t.shouldForwardProp){var O=t.shouldForwardProp;x=function(C,D){return R(C,D)&&O(C,D)}}else x=R}var $=new qo(n,y,r?o.componentStyle:void 0);function S(C,D){return function(v,p,A){var U=v.attrs,Y=v.componentStyle,J=v.defaultProps,ae=v.foldedComponentIds,H=v.styledComponentId,ge=v.target,Ce=P.useContext(bt),fe=Dn(),se=v.shouldForwardProp||fe.shouldForwardProp,Ie=mo(p,Ce,J)||Le,K=function(de,X,me){for(var ue,ee=G(G({},X),{className:void 0,theme:me}),ve=0;ve<de.length;ve+=1){var Z=ke(ue=de[ve])?ue(ee):ue;for(var W in Z)ee[W]=W==="className"?Ee(ee[W],Z[W]):W==="style"?G(G({},ee[W]),Z[W]):Z[W]}return X.className&&(ee.className=Ee(ee.className,X.className)),ee}(U,p,Ie),he=K.as||ge,ce={};for(var L in K)K[L]===void 0||L[0]==="$"||L==="as"||L==="theme"&&K.theme===Ie||(L==="forwardedAs"?ce.as=K.forwardedAs:se&&!se(L,he)||(ce[L]=K[L]));var Se=function(de,X){var me=Dn(),ue=de.generateAndInjectStyles(X,me.styleSheet,me.stylis);return ue}(Y,K),q=Ee(ae,H);return Se&&(q+=" "+Se),K.className&&(q+=" "+K.className),ce[_t(he)&&!Qn.has(he)?"class":"className"]=q,A&&(ce.ref=A),s.createElement(he,ce)}(m,C,D)}S.displayName=g;var m=P.forwardRef(S);return m.attrs=f,m.componentStyle=$,m.displayName=g,m.shouldForwardProp=x,m.foldedComponentIds=r?Ee(o.foldedComponentIds,o.styledComponentId):"",m.styledComponentId=y,m.target=r?o.target:e,Object.defineProperty(m,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(C){this._foldedDefaultProps=r?function(D){for(var v=[],p=1;p<arguments.length;p++)v[p-1]=arguments[p];for(var A=0,U=v;A<U.length;A++)zt(D,U[A],!0);return D}({},o.defaultProps,C):C}}),qt(m,function(){return".".concat(m.styledComponentId)}),a&&or(m,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0}),m}function An(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n}var _n=function(e){return Object.assign(e,{isCss:!0})};function M(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];if(ke(e)||Ze(e))return _n(Pe(An(Rt,gt([e],t,!0))));var r=e;return t.length===0&&r.length===1&&typeof r[0]=="string"?Pe(r):_n(Pe(An(r,t)))}function Bt(e,t,n){if(n===void 0&&(n=Le),!t)throw De(1,t);var r=function(o){for(var a=[],i=1;i<arguments.length;i++)a[i-1]=arguments[i];return e(t,n,M.apply(void 0,gt([o],a,!1)))};return r.attrs=function(o){return Bt(e,t,G(G({},n),{attrs:Array.prototype.concat(n.attrs,o).filter(Boolean)}))},r.withConfig=function(o){return Bt(e,t,G(G({},n),o))},r}var ur=function(e){return Bt(Zo,e)},k=ur;Qn.forEach(function(e){k[e]=ur(e)});var xe;function ze(e,t){return e[t]}function Qo(e=[],t,n=0){return[...e.slice(0,n),t,...e.slice(n)]}function Jo(e=[],t,n="id"){const r=e.slice(),o=ze(t,n);return o?r.splice(r.findIndex(a=>ze(a,n)===o),1):r.splice(r.findIndex(a=>a===t),1),r}function jn(e){return e.map((t,n)=>{const r=Object.assign(Object.assign({},t),{sortable:t.sortable||!!t.sortFunction||void 0});return t.id||(r.id=n+1),r})}function qe(e,t){return Math.ceil(e/t)}function Ht(e,t){return Math.min(e,t)}(function(e){e.ASC="asc",e.DESC="desc"})(xe||(xe={}));const N=()=>null;function pr(e,t=[],n=[]){let r={},o=[...n];return t.length&&t.forEach(a=>{if(!a.when||typeof a.when!="function")throw new Error('"when" must be defined in the conditional style object and must be function');a.when(e)&&(r=a.style||{},a.classNames&&(o=[...o,...a.classNames]),typeof a.style=="function"&&(r=a.style(e)||{}))}),{conditionalStyle:r,classNames:o.join(" ")}}function pt(e,t=[],n="id"){const r=ze(e,n);return r?t.some(o=>ze(o,n)===r):t.some(o=>o===e)}function at(e,t){return t?e.findIndex(n=>Xe(n.id,t)):-1}function Xe(e,t){return e==t}function ea(e,t){const n=!e.toggleOnSelectedRowsChange;switch(t.type){case"SELECT_ALL_ROWS":{const{keyField:r,rows:o,rowCount:a,mergeSelections:i}=t,c=!e.allSelected,d=!e.toggleOnSelectedRowsChange;if(i){const h=c?[...e.selectedRows,...o.filter(u=>!pt(u,e.selectedRows,r))]:e.selectedRows.filter(u=>!pt(u,o,r));return Object.assign(Object.assign({},e),{allSelected:c,selectedCount:h.length,selectedRows:h,toggleOnSelectedRowsChange:d})}return Object.assign(Object.assign({},e),{allSelected:c,selectedCount:c?a:0,selectedRows:c?o:[],toggleOnSelectedRowsChange:d})}case"SELECT_SINGLE_ROW":{const{keyField:r,row:o,isSelected:a,rowCount:i,singleSelect:c}=t;return c?a?Object.assign(Object.assign({},e),{selectedCount:0,allSelected:!1,selectedRows:[],toggleOnSelectedRowsChange:n}):Object.assign(Object.assign({},e),{selectedCount:1,allSelected:!1,selectedRows:[o],toggleOnSelectedRowsChange:n}):a?Object.assign(Object.assign({},e),{selectedCount:e.selectedRows.length>0?e.selectedRows.length-1:0,allSelected:!1,selectedRows:Jo(e.selectedRows,o,r),toggleOnSelectedRowsChange:n}):Object.assign(Object.assign({},e),{selectedCount:e.selectedRows.length+1,allSelected:e.selectedRows.length+1===i,selectedRows:Qo(e.selectedRows,o),toggleOnSelectedRowsChange:n})}case"SELECT_MULTIPLE_ROWS":{const{keyField:r,selectedRows:o,totalRows:a,mergeSelections:i}=t;if(i){const c=[...e.selectedRows,...o.filter(d=>!pt(d,e.selectedRows,r))];return Object.assign(Object.assign({},e),{selectedCount:c.length,allSelected:!1,selectedRows:c,toggleOnSelectedRowsChange:n})}return Object.assign(Object.assign({},e),{selectedCount:o.length,allSelected:o.length===a,selectedRows:o,toggleOnSelectedRowsChange:n})}case"CLEAR_SELECTED_ROWS":{const{selectedRowsFlag:r}=t;return Object.assign(Object.assign({},e),{allSelected:!1,selectedCount:0,selectedRows:[],selectedRowsFlag:r})}case"SORT_CHANGE":{const{sortDirection:r,selectedColumn:o,clearSelectedOnSort:a}=t;return Object.assign(Object.assign(Object.assign({},e),{selectedColumn:o,sortDirection:r,currentPage:1}),a&&{allSelected:!1,selectedCount:0,selectedRows:[],toggleOnSelectedRowsChange:n})}case"CHANGE_PAGE":{const{page:r,paginationServer:o,visibleOnly:a,persistSelectedOnPageChange:i}=t,c=o&&i,d=o&&!i||a;return Object.assign(Object.assign(Object.assign(Object.assign({},e),{currentPage:r}),c&&{allSelected:!1}),d&&{allSelected:!1,selectedCount:0,selectedRows:[],toggleOnSelectedRowsChange:n})}case"CHANGE_ROWS_PER_PAGE":{const{rowsPerPage:r,page:o}=t;return Object.assign(Object.assign({},e),{currentPage:o,rowsPerPage:r})}}}const ta=M`
	pointer-events: none;
	opacity: 0.4;
`,na=k.div`
	position: relative;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	max-width: 100%;
	${({disabled:e})=>e&&ta};
	${({theme:e})=>e.table.style};
`,ra=M`
	position: sticky;
	position: -webkit-sticky; /* Safari */
	top: 0;
	z-index: 1;
`,oa=k.div`
	display: flex;
	width: 100%;
	${({$fixedHeader:e})=>e&&ra};
	${({theme:e})=>e.head.style};
`,aa=k.div`
	display: flex;
	align-items: stretch;
	width: 100%;
	${({theme:e})=>e.headRow.style};
	${({$dense:e,theme:t})=>e&&t.headRow.denseStyle};
`,gr=(e,...t)=>M`
		@media screen and (max-width: ${599}px) {
			${M(e,...t)}
		}
	`,sa=(e,...t)=>M`
		@media screen and (max-width: ${959}px) {
			${M(e,...t)}
		}
	`,ia=(e,...t)=>M`
		@media screen and (max-width: ${1280}px) {
			${M(e,...t)}
		}
	`,la=e=>(t,...n)=>M`
			@media screen and (max-width: ${e}px) {
				${M(t,...n)}
			}
		`,Ge=k.div`
	position: relative;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	line-height: normal;
	${({theme:e,$headCell:t})=>e[t?"headCells":"cells"].style};
	${({$noPadding:e})=>e&&"padding: 0"};
`,fr=k(Ge)`
	flex-grow: ${({button:e,grow:t})=>t===0||e?0:t||1};
	flex-shrink: 0;
	flex-basis: 0;
	max-width: ${({maxWidth:e})=>e||"100%"};
	min-width: ${({minWidth:e})=>e||"100px"};
	${({width:e})=>e&&M`
			min-width: ${e};
			max-width: ${e};
		`};
	${({right:e})=>e&&"justify-content: flex-end"};
	${({button:e,center:t})=>(t||e)&&"justify-content: center"};
	${({compact:e,button:t})=>(e||t)&&"padding: 0"};

	/* handle hiding cells */
	${({hide:e})=>e&&e==="sm"&&gr`
    display: none;
  `};
	${({hide:e})=>e&&e==="md"&&sa`
    display: none;
  `};
	${({hide:e})=>e&&e==="lg"&&ia`
    display: none;
  `};
	${({hide:e})=>e&&Number.isInteger(e)&&la(e)`
    display: none;
  `};
`,ca=M`
	div:first-child {
		white-space: ${({$wrapCell:e})=>e?"normal":"nowrap"};
		overflow: ${({$allowOverflow:e})=>e?"visible":"hidden"};
		text-overflow: ellipsis;
	}
`,da=k(fr).attrs(e=>({style:e.style}))`
	${({$renderAsCell:e})=>!e&&ca};
	${({theme:e,$isDragging:t})=>t&&e.cells.draggingStyle};
	${({$cellStyle:e})=>e};
`;var ua=s.memo(function({id:e,column:t,row:n,rowIndex:r,dataTag:o,isDragging:a,onDragStart:i,onDragOver:c,onDragEnd:d,onDragEnter:h,onDragLeave:u}){const{conditionalStyle:g,classNames:y}=pr(n,t.conditionalCellStyles,["rdt_TableCell"]);return s.createElement(da,{id:e,"data-column-id":t.id,role:"cell",className:y,"data-tag":o,$cellStyle:t.style,$renderAsCell:!!t.cell,$allowOverflow:t.allowOverflow,button:t.button,center:t.center,compact:t.compact,grow:t.grow,hide:t.hide,maxWidth:t.maxWidth,minWidth:t.minWidth,right:t.right,width:t.width,$wrapCell:t.wrap,style:g,$isDragging:a,onDragStart:i,onDragOver:c,onDragEnd:d,onDragEnter:h,onDragLeave:u},!t.cell&&s.createElement("div",{"data-tag":o},function(f,x,R,O){return x?R&&typeof R=="function"?R(f,O):x(f,O):null}(n,t.selector,t.format,r)),t.cell&&t.cell(n,r,t,e))});const Hn="input";var hr=s.memo(function({name:e,component:t=Hn,componentOptions:n={style:{}},indeterminate:r=!1,checked:o=!1,disabled:a=!1,onClick:i=N}){const c=t,d=c!==Hn?n.style:(u=>Object.assign(Object.assign({fontSize:"18px"},!u&&{cursor:"pointer"}),{padding:0,marginTop:"1px",verticalAlign:"middle",position:"relative"}))(a),h=s.useMemo(()=>function(u,...g){let y;return Object.keys(u).map(f=>u[f]).forEach((f,x)=>{typeof f=="function"&&(y=Object.assign(Object.assign({},u),{[Object.keys(u)[x]]:f(...g)}))}),y||u}(n,r),[n,r]);return s.createElement(c,Object.assign({type:"checkbox",ref:u=>{u&&(u.indeterminate=r)},style:d,onClick:a?N:i,name:e,"aria-label":e,checked:o,disabled:a},h,{onChange:N}))});const pa=k(Ge)`
	flex: 0 0 48px;
	min-width: 48px;
	justify-content: center;
	align-items: center;
	user-select: none;
	white-space: nowrap;
`;function ga({name:e,keyField:t,row:n,rowCount:r,selected:o,selectableRowsComponent:a,selectableRowsComponentProps:i,selectableRowsSingle:c,selectableRowDisabled:d,onSelectedRow:h}){const u=!(!d||!d(n));return s.createElement(pa,{onClick:g=>g.stopPropagation(),className:"rdt_TableCell",$noPadding:!0},s.createElement(hr,{name:e,component:a,componentOptions:i,checked:o,"aria-checked":o,onClick:()=>{h({type:"SELECT_SINGLE_ROW",row:n,isSelected:o,keyField:t,rowCount:r,singleSelect:c})},disabled:u}))}const fa=k.button`
	display: inline-flex;
	align-items: center;
	user-select: none;
	white-space: nowrap;
	border: none;
	background-color: transparent;
	${({theme:e})=>e.expanderButton.style};
`;function ha({disabled:e=!1,expanded:t=!1,expandableIcon:n,id:r,row:o,onToggled:a}){const i=t?n.expanded:n.collapsed;return s.createElement(fa,{"aria-disabled":e,onClick:()=>a&&a(o),"data-testid":`expander-button-${r}`,disabled:e,"aria-label":t?"Collapse Row":"Expand Row",role:"button",type:"button"},i)}const ma=k(Ge)`
	white-space: nowrap;
	font-weight: 400;
	min-width: 48px;
	${({theme:e})=>e.expanderCell.style};
`;function ba({row:e,expanded:t=!1,expandableIcon:n,id:r,onToggled:o,disabled:a=!1}){return s.createElement(ma,{onClick:i=>i.stopPropagation(),$noPadding:!0},s.createElement(ha,{id:r,row:e,expanded:t,expandableIcon:n,disabled:a,onToggled:o}))}const wa=k.div`
	width: 100%;
	box-sizing: border-box;
	${({theme:e})=>e.expanderRow.style};
	${({$extendedRowStyle:e})=>e};
`;var ya=s.memo(function({data:e,ExpanderComponent:t,expanderComponentProps:n,extendedRowStyle:r,extendedClassNames:o}){const a=["rdt_ExpanderRow",...o.split(" ").filter(i=>i!=="rdt_TableRow")].join(" ");return s.createElement(wa,{className:a,$extendedRowStyle:r},s.createElement(t,Object.assign({data:e},n)))});const Tt="allowRowEvents";var wt,Gt,Tn;(function(e){e.LTR="ltr",e.RTL="rtl",e.AUTO="auto"})(wt||(wt={})),function(e){e.LEFT="left",e.RIGHT="right",e.CENTER="center"}(Gt||(Gt={})),function(e){e.SM="sm",e.MD="md",e.LG="lg"}(Tn||(Tn={}));const xa=M`
	&:hover {
		${({$highlightOnHover:e,theme:t})=>e&&t.rows.highlightOnHoverStyle};
	}
`,Ca=M`
	&:hover {
		cursor: pointer;
	}
`,Sa=k.div.attrs(e=>({style:e.style}))`
	display: flex;
	align-items: stretch;
	align-content: stretch;
	width: 100%;
	box-sizing: border-box;
	${({theme:e})=>e.rows.style};
	${({$dense:e,theme:t})=>e&&t.rows.denseStyle};
	${({$striped:e,theme:t})=>e&&t.rows.stripedStyle};
	${({$highlightOnHover:e})=>e&&xa};
	${({$pointerOnHover:e})=>e&&Ca};
	${({$selected:e,theme:t})=>e&&t.rows.selectedHighlightStyle};
	${({$conditionalStyle:e})=>e};
`;function va({columns:e=[],conditionalRowStyles:t=[],defaultExpanded:n=!1,defaultExpanderDisabled:r=!1,dense:o=!1,expandableIcon:a,expandableRows:i=!1,expandableRowsComponent:c,expandableRowsComponentProps:d,expandableRowsHideExpander:h,expandOnRowClicked:u=!1,expandOnRowDoubleClicked:g=!1,highlightOnHover:y=!1,id:f,expandableInheritConditionalStyles:x,keyField:R,onRowClicked:O=N,onRowDoubleClicked:$=N,onRowMouseEnter:S=N,onRowMouseLeave:m=N,onRowExpandToggled:C=N,onSelectedRow:D=N,pointerOnHover:v=!1,row:p,rowCount:A,rowIndex:U,selectableRowDisabled:Y=null,selectableRows:J=!1,selectableRowsComponent:ae,selectableRowsComponentProps:H,selectableRowsHighlight:ge=!1,selectableRowsSingle:Ce=!1,selected:fe,striped:se=!1,draggingColumnId:Ie,onDragStart:K,onDragOver:he,onDragEnd:ce,onDragEnter:L,onDragLeave:Se}){const[q,de]=s.useState(n);s.useEffect(()=>{de(n)},[n]);const X=s.useCallback(()=>{de(!q),C(!q,p)},[q,C,p]),me=v||i&&(u||g),ue=s.useCallback(F=>{F.target.getAttribute("data-tag")===Tt&&(O(p,F),!r&&i&&u&&X())},[r,u,i,X,O,p]),ee=s.useCallback(F=>{F.target.getAttribute("data-tag")===Tt&&($(p,F),!r&&i&&g&&X())},[r,g,i,X,$,p]),ve=s.useCallback(F=>{S(p,F)},[S,p]),Z=s.useCallback(F=>{m(p,F)},[m,p]),W=ze(p,R),{conditionalStyle:Je,classNames:et}=pr(p,t,["rdt_TableRow"]),$t=ge&&fe,Et=x?Je:{},Ot=se&&U%2==0;return s.createElement(s.Fragment,null,s.createElement(Sa,{id:`row-${f}`,role:"row",$striped:Ot,$highlightOnHover:y,$pointerOnHover:!r&&me,$dense:o,onClick:ue,onDoubleClick:ee,onMouseEnter:ve,onMouseLeave:Z,className:et,$selected:$t,$conditionalStyle:Je},J&&s.createElement(ga,{name:`select-row-${W}`,keyField:R,row:p,rowCount:A,selected:fe,selectableRowsComponent:ae,selectableRowsComponentProps:H,selectableRowDisabled:Y,selectableRowsSingle:Ce,onSelectedRow:D}),i&&!h&&s.createElement(ba,{id:W,expandableIcon:a,expanded:q,row:p,onToggled:X,disabled:r}),e.map(F=>F.omit?null:s.createElement(ua,{id:`cell-${F.id}-${W}`,key:`cell-${F.id}-${W}`,dataTag:F.ignoreRowClick||F.button?null:Tt,column:F,row:p,rowIndex:U,isDragging:Xe(Ie,F.id),onDragStart:K,onDragOver:he,onDragEnd:ce,onDragEnter:L,onDragLeave:Se}))),i&&q&&s.createElement(ya,{key:`expander-${W}`,data:p,extendedRowStyle:Et,extendedClassNames:et,ExpanderComponent:c,expanderComponentProps:d}))}const Ra=k.span`
	padding: 2px;
	color: inherit;
	flex-grow: 0;
	flex-shrink: 0;
	${({$sortActive:e})=>e?"opacity: 1":"opacity: 0"};
	${({$sortDirection:e})=>e==="desc"&&"transform: rotate(180deg)"};
`,$a=({sortActive:e,sortDirection:t})=>P.createElement(Ra,{$sortActive:e,$sortDirection:t},"▲"),Ea=k(fr)`
	${({button:e})=>e&&"text-align: center"};
	${({theme:e,$isDragging:t})=>t&&e.headCells.draggingStyle};
`,Oa=M`
	cursor: pointer;
	span.__rdt_custom_sort_icon__ {
		i,
		svg {
			transform: 'translate3d(0, 0, 0)';
			${({$sortActive:e})=>e?"opacity: 1":"opacity: 0"};
			color: inherit;
			font-size: 18px;
			height: 18px;
			width: 18px;
			backface-visibility: hidden;
			transform-style: preserve-3d;
			transition-duration: 95ms;
			transition-property: transform;
		}

		&.asc i,
		&.asc svg {
			transform: rotate(180deg);
		}
	}

	${({$sortActive:e})=>!e&&M`
			&:hover,
			&:focus {
				opacity: 0.7;

				span,
				span.__rdt_custom_sort_icon__ * {
					opacity: 0.7;
				}
			}
		`};
`,Pa=k.div`
	display: inline-flex;
	align-items: center;
	justify-content: inherit;
	height: 100%;
	width: 100%;
	outline: none;
	user-select: none;
	overflow: hidden;
	${({disabled:e})=>!e&&Oa};
`,ka=k.div`
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;var Da=s.memo(function({column:e,disabled:t,draggingColumnId:n,selectedColumn:r={},sortDirection:o,sortIcon:a,sortServer:i,pagination:c,paginationServer:d,persistSelectedOnSort:h,selectableRowsVisibleOnly:u,onSort:g,onDragStart:y,onDragOver:f,onDragEnd:x,onDragEnter:R,onDragLeave:O}){s.useEffect(()=>{typeof e.selector=="string"&&console.error(`Warning: ${e.selector} is a string based column selector which has been deprecated as of v7 and will be removed in v8. Instead, use a selector function e.g. row => row[field]...`)},[]);const[$,S]=s.useState(!1),m=s.useRef(null);if(s.useEffect(()=>{m.current&&S(m.current.scrollWidth>m.current.clientWidth)},[$]),e.omit)return null;const C=()=>{if(!e.sortable&&!e.selector)return;let H=o;Xe(r.id,e.id)&&(H=o===xe.ASC?xe.DESC:xe.ASC),g({type:"SORT_CHANGE",sortDirection:H,selectedColumn:e,clearSelectedOnSort:c&&d&&!h||i||u})},D=H=>s.createElement($a,{sortActive:H,sortDirection:o}),v=()=>s.createElement("span",{className:[o,"__rdt_custom_sort_icon__"].join(" ")},a),p=!(!e.sortable||!Xe(r.id,e.id)),A=!e.sortable||t,U=e.sortable&&!a&&!e.right,Y=e.sortable&&!a&&e.right,J=e.sortable&&a&&!e.right,ae=e.sortable&&a&&e.right;return s.createElement(Ea,{"data-column-id":e.id,className:"rdt_TableCol",$headCell:!0,allowOverflow:e.allowOverflow,button:e.button,compact:e.compact,grow:e.grow,hide:e.hide,maxWidth:e.maxWidth,minWidth:e.minWidth,right:e.right,center:e.center,width:e.width,draggable:e.reorder,$isDragging:Xe(e.id,n),onDragStart:y,onDragOver:f,onDragEnd:x,onDragEnter:R,onDragLeave:O},e.name&&s.createElement(Pa,{"data-column-id":e.id,"data-sort-id":e.id,role:"columnheader",tabIndex:0,className:"rdt_TableCol_Sortable",onClick:A?void 0:C,onKeyPress:A?void 0:H=>{H.key==="Enter"&&C()},$sortActive:!A&&p,disabled:A},!A&&ae&&v(),!A&&Y&&D(p),typeof e.name=="string"?s.createElement(ka,{title:$?e.name:void 0,ref:m,"data-column-id":e.id},e.name):e.name,!A&&J&&v(),!A&&U&&D(p)))});const Ia=k(Ge)`
	flex: 0 0 48px;
	justify-content: center;
	align-items: center;
	user-select: none;
	white-space: nowrap;
	font-size: unset;
`;function Aa({headCell:e=!0,rowData:t,keyField:n,allSelected:r,mergeSelections:o,selectedRows:a,selectableRowsComponent:i,selectableRowsComponentProps:c,selectableRowDisabled:d,onSelectAllRows:h}){const u=a.length>0&&!r,g=d?t.filter(x=>!d(x)):t,y=g.length===0,f=Math.min(t.length,g.length);return s.createElement(Ia,{className:"rdt_TableCol",$headCell:e,$noPadding:!0},s.createElement(hr,{name:"select-all-rows",component:i,componentOptions:c,onClick:()=>{h({type:"SELECT_ALL_ROWS",rows:g,rowCount:f,mergeSelections:o,keyField:n})},checked:r,indeterminate:u,disabled:y}))}function mr(e=wt.AUTO){const t=typeof window=="object",[n,r]=s.useState(!1);return s.useEffect(()=>{if(t)if(e!=="auto")r(e==="rtl");else{const o=!(!window.document||!window.document.createElement),a=document.getElementsByTagName("BODY")[0],i=document.getElementsByTagName("HTML")[0],c=a.dir==="rtl"||i.dir==="rtl";r(o&&c)}},[e,t]),n}const _a=k.div`
	display: flex;
	align-items: center;
	flex: 1 0 auto;
	height: 100%;
	color: ${({theme:e})=>e.contextMenu.fontColor};
	font-size: ${({theme:e})=>e.contextMenu.fontSize};
	font-weight: 400;
`,ja=k.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	flex-wrap: wrap;
`,Fn=k.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	box-sizing: inherit;
	z-index: 1;
	align-items: center;
	justify-content: space-between;
	display: flex;
	${({$rtl:e})=>e&&"direction: rtl"};
	${({theme:e})=>e.contextMenu.style};
	${({theme:e,$visible:t})=>t&&e.contextMenu.activeStyle};
`;function Ha({contextMessage:e,contextActions:t,contextComponent:n,selectedCount:r,direction:o}){const a=mr(o),i=r>0;return n?s.createElement(Fn,{$visible:i},s.cloneElement(n,{selectedCount:r})):s.createElement(Fn,{$visible:i,$rtl:a},s.createElement(_a,null,((c,d,h)=>{if(d===0)return null;const u=d===1?c.singular:c.plural;return h?`${d} ${c.message||""} ${u}`:`${d} ${u} ${c.message||""}`})(e,r,a)),s.createElement(ja,null,t))}const Ta=k.div`
	position: relative;
	box-sizing: border-box;
	overflow: hidden;
	display: flex;
	flex: 1 1 auto;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	flex-wrap: wrap;
	${({theme:e})=>e.header.style}
`,Fa=k.div`
	flex: 1 0 auto;
	color: ${({theme:e})=>e.header.fontColor};
	font-size: ${({theme:e})=>e.header.fontSize};
	font-weight: 400;
`,Na=k.div`
	flex: 1 0 auto;
	display: flex;
	align-items: center;
	justify-content: flex-end;

	> * {
		margin-left: 5px;
	}
`,Ma=({title:e,actions:t=null,contextMessage:n,contextActions:r,contextComponent:o,selectedCount:a,direction:i,showMenu:c=!0})=>s.createElement(Ta,{className:"rdt_TableHeader",role:"heading","aria-level":1},s.createElement(Fa,null,e),t&&s.createElement(Na,null,t),c&&s.createElement(Ha,{contextMessage:n,contextActions:r,contextComponent:o,direction:i,selectedCount:a}));function br(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function"){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n}const La={left:"flex-start",right:"flex-end",center:"center"},za=k.header`
	position: relative;
	display: flex;
	flex: 1 1 auto;
	box-sizing: border-box;
	align-items: center;
	padding: 4px 16px 4px 24px;
	width: 100%;
	justify-content: ${({align:e})=>La[e]};
	flex-wrap: ${({$wrapContent:e})=>e?"wrap":"nowrap"};
	${({theme:e})=>e.subHeader.style}
`,Wa=e=>{var{align:t="right",wrapContent:n=!0}=e,r=br(e,["align","wrapContent"]);return s.createElement(za,Object.assign({align:t,$wrapContent:n},r))},Ba=k.div`
	display: flex;
	flex-direction: column;
`,Ga=k.div`
	position: relative;
	width: 100%;
	border-radius: inherit;
	${({$responsive:e,$fixedHeader:t})=>e&&M`
			overflow-x: auto;

			// hidden prevents vertical scrolling in firefox when fixedHeader is disabled
			overflow-y: ${t?"auto":"hidden"};
			min-height: 0;
		`};

	${({$fixedHeader:e=!1,$fixedHeaderScrollHeight:t="100vh"})=>e&&M`
			max-height: ${t};
			-webkit-overflow-scrolling: touch;
		`};

	${({theme:e})=>e.responsiveWrapper.style};
`,Nn=k.div`
	position: relative;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	${e=>e.theme.progress.style};
`,Ya=k.div`
	position: relative;
	width: 100%;
	${({theme:e})=>e.tableWrapper.style};
`,Va=k(Ge)`
	white-space: nowrap;
	${({theme:e})=>e.expanderCell.style};
`,Ua=k.div`
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	${({theme:e})=>e.noData.style};
`,Ka=()=>P.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24"},P.createElement("path",{d:"M7 10l5 5 5-5z"}),P.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),qa=k.select`
	cursor: pointer;
	height: 24px;
	max-width: 100%;
	user-select: none;
	padding-left: 8px;
	padding-right: 24px;
	box-sizing: content-box;
	font-size: inherit;
	color: inherit;
	border: none;
	background-color: transparent;
	appearance: none;
	direction: ltr;
	flex-shrink: 0;

	&::-ms-expand {
		display: none;
	}

	&:disabled::-ms-expand {
		background: #f60;
	}

	option {
		color: initial;
	}
`,Xa=k.div`
	position: relative;
	flex-shrink: 0;
	font-size: inherit;
	color: inherit;
	margin-top: 1px;

	svg {
		top: 0;
		right: 0;
		color: inherit;
		position: absolute;
		fill: currentColor;
		width: 24px;
		height: 24px;
		display: inline-block;
		user-select: none;
		pointer-events: none;
	}
`,Za=e=>{var{defaultValue:t,onChange:n}=e,r=br(e,["defaultValue","onChange"]);return s.createElement(Xa,null,s.createElement(qa,Object.assign({onChange:n,defaultValue:t},r)),s.createElement(Ka,null))},l={columns:[],data:[],title:"",keyField:"id",selectableRows:!1,selectableRowsHighlight:!1,selectableRowsNoSelectAll:!1,selectableRowSelected:null,selectableRowDisabled:null,selectableRowsComponent:"input",selectableRowsComponentProps:{},selectableRowsVisibleOnly:!1,selectableRowsSingle:!1,clearSelectedRows:!1,expandableRows:!1,expandableRowDisabled:null,expandableRowExpanded:null,expandOnRowClicked:!1,expandableRowsHideExpander:!1,expandOnRowDoubleClicked:!1,expandableInheritConditionalStyles:!1,expandableRowsComponent:function(){return P.createElement("div",null,"To add an expander pass in a component instance via ",P.createElement("strong",null,"expandableRowsComponent"),". You can then access props.data from this component.")},expandableIcon:{collapsed:P.createElement(()=>P.createElement("svg",{fill:"currentColor",height:"24",viewBox:"0 0 24 24",width:"24",xmlns:"http://www.w3.org/2000/svg"},P.createElement("path",{d:"M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"}),P.createElement("path",{d:"M0-.25h24v24H0z",fill:"none"})),null),expanded:P.createElement(()=>P.createElement("svg",{fill:"currentColor",height:"24",viewBox:"0 0 24 24",width:"24",xmlns:"http://www.w3.org/2000/svg"},P.createElement("path",{d:"M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"}),P.createElement("path",{d:"M0-.75h24v24H0z",fill:"none"})),null)},expandableRowsComponentProps:{},progressPending:!1,progressComponent:P.createElement("div",{style:{fontSize:"24px",fontWeight:700,padding:"24px"}},"Loading..."),persistTableHead:!1,sortIcon:null,sortFunction:null,sortServer:!1,striped:!1,highlightOnHover:!1,pointerOnHover:!1,noContextMenu:!1,contextMessage:{singular:"item",plural:"items",message:"selected"},actions:null,contextActions:null,contextComponent:null,defaultSortFieldId:null,defaultSortAsc:!0,responsive:!0,noDataComponent:P.createElement("div",{style:{padding:"24px"}},"There are no records to display"),disabled:!1,noTableHead:!1,noHeader:!1,subHeader:!1,subHeaderAlign:Gt.RIGHT,subHeaderWrap:!0,subHeaderComponent:null,fixedHeader:!1,fixedHeaderScrollHeight:"100vh",pagination:!1,paginationServer:!1,paginationServerOptions:{persistSelectedOnSort:!1,persistSelectedOnPageChange:!1},paginationDefaultPage:1,paginationResetDefaultPage:!1,paginationTotalRows:0,paginationPerPage:10,paginationRowsPerPageOptions:[10,15,20,25,30],paginationComponent:null,paginationComponentOptions:{},paginationIconFirstPage:P.createElement(()=>P.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},P.createElement("path",{d:"M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"}),P.createElement("path",{fill:"none",d:"M24 24H0V0h24v24z"})),null),paginationIconLastPage:P.createElement(()=>P.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},P.createElement("path",{d:"M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"}),P.createElement("path",{fill:"none",d:"M0 0h24v24H0V0z"})),null),paginationIconNext:P.createElement(()=>P.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},P.createElement("path",{d:"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"}),P.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),null),paginationIconPrevious:P.createElement(()=>P.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation"},P.createElement("path",{d:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"}),P.createElement("path",{d:"M0 0h24v24H0z",fill:"none"})),null),dense:!1,conditionalRowStyles:[],theme:"default",customStyles:{},direction:wt.AUTO,onChangePage:N,onChangeRowsPerPage:N,onRowClicked:N,onRowDoubleClicked:N,onRowMouseEnter:N,onRowMouseLeave:N,onRowExpandToggled:N,onSelectedRowsChange:N,onSort:N,onColumnOrderChange:N},Qa={rowsPerPageText:"Rows per page:",rangeSeparatorText:"of",noRowsPerPage:!1,selectAllRowsItem:!1,selectAllRowsItemText:"All"},Ja=k.nav`
	display: flex;
	flex: 1 1 auto;
	justify-content: flex-end;
	align-items: center;
	box-sizing: border-box;
	padding-right: 8px;
	padding-left: 8px;
	width: 100%;
	${({theme:e})=>e.pagination.style};
`,st=k.button`
	position: relative;
	display: block;
	user-select: none;
	border: none;
	${({theme:e})=>e.pagination.pageButtonsStyle};
	${({$isRTL:e})=>e&&"transform: scale(-1, -1)"};
`,es=k.div`
	display: flex;
	align-items: center;
	border-radius: 4px;
	white-space: nowrap;
	${gr`
    width: 100%;
    justify-content: space-around;
  `};
`,wr=k.span`
	flex-shrink: 1;
	user-select: none;
`,ts=k(wr)`
	margin: 0 24px;
`,ns=k(wr)`
	margin: 0 4px;
`;var rs=s.memo(function({rowsPerPage:e,rowCount:t,currentPage:n,direction:r=l.direction,paginationRowsPerPageOptions:o=l.paginationRowsPerPageOptions,paginationIconLastPage:a=l.paginationIconLastPage,paginationIconFirstPage:i=l.paginationIconFirstPage,paginationIconNext:c=l.paginationIconNext,paginationIconPrevious:d=l.paginationIconPrevious,paginationComponentOptions:h=l.paginationComponentOptions,onChangeRowsPerPage:u=l.onChangeRowsPerPage,onChangePage:g=l.onChangePage}){const y=(()=>{const H=typeof window=="object";function ge(){return{width:H?window.innerWidth:void 0,height:H?window.innerHeight:void 0}}const[Ce,fe]=s.useState(ge);return s.useEffect(()=>{if(!H)return()=>null;function se(){fe(ge())}return window.addEventListener("resize",se),()=>window.removeEventListener("resize",se)},[]),Ce})(),f=mr(r),x=y.width&&y.width>599,R=qe(t,e),O=n*e,$=O-e+1,S=n===1,m=n===R,C=Object.assign(Object.assign({},Qa),h),D=n===R?`${$}-${t} ${C.rangeSeparatorText} ${t}`:`${$}-${O} ${C.rangeSeparatorText} ${t}`,v=s.useCallback(()=>g(n-1),[n,g]),p=s.useCallback(()=>g(n+1),[n,g]),A=s.useCallback(()=>g(1),[g]),U=s.useCallback(()=>g(qe(t,e)),[g,t,e]),Y=s.useCallback(H=>u(Number(H.target.value),n),[n,u]),J=o.map(H=>s.createElement("option",{key:H,value:H},H));C.selectAllRowsItem&&J.push(s.createElement("option",{key:-1,value:t},C.selectAllRowsItemText));const ae=s.createElement(Za,{onChange:Y,defaultValue:e,"aria-label":C.rowsPerPageText},J);return s.createElement(Ja,{className:"rdt_Pagination"},!C.noRowsPerPage&&x&&s.createElement(s.Fragment,null,s.createElement(ns,null,C.rowsPerPageText),ae),x&&s.createElement(ts,null,D),s.createElement(es,null,s.createElement(st,{id:"pagination-first-page",type:"button","aria-label":"First Page","aria-disabled":S,onClick:A,disabled:S,$isRTL:f},i),s.createElement(st,{id:"pagination-previous-page",type:"button","aria-label":"Previous Page","aria-disabled":S,onClick:v,disabled:S,$isRTL:f},d),!C.noRowsPerPage&&!x&&ae,s.createElement(st,{id:"pagination-next-page",type:"button","aria-label":"Next Page","aria-disabled":m,onClick:p,disabled:m,$isRTL:f},c),s.createElement(st,{id:"pagination-last-page",type:"button","aria-label":"Last Page","aria-disabled":m,onClick:U,disabled:m,$isRTL:f},a)))});const $e=(e,t)=>{const n=s.useRef(!0);s.useEffect(()=>{n.current?n.current=!1:e()},t)};function os(e){return e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var as=function(e){return function(t){return!!t&&typeof t=="object"}(e)&&!function(t){var n=Object.prototype.toString.call(t);return n==="[object RegExp]"||n==="[object Date]"||function(r){return r.$$typeof===ss}(t)}(e)},ss=typeof Symbol=="function"&&Symbol.for?Symbol.for("react.element"):60103;function Qe(e,t){return t.clone!==!1&&t.isMergeableObject(e)?We((n=e,Array.isArray(n)?[]:{}),e,t):e;var n}function is(e,t,n){return e.concat(t).map(function(r){return Qe(r,n)})}function Mn(e){return Object.keys(e).concat(function(t){return Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t).filter(function(n){return Object.propertyIsEnumerable.call(t,n)}):[]}(e))}function Ln(e,t){try{return t in e}catch{return!1}}function ls(e,t,n){var r={};return n.isMergeableObject(e)&&Mn(e).forEach(function(o){r[o]=Qe(e[o],n)}),Mn(t).forEach(function(o){(function(a,i){return Ln(a,i)&&!(Object.hasOwnProperty.call(a,i)&&Object.propertyIsEnumerable.call(a,i))})(e,o)||(Ln(e,o)&&n.isMergeableObject(t[o])?r[o]=function(a,i){if(!i.customMerge)return We;var c=i.customMerge(a);return typeof c=="function"?c:We}(o,n)(e[o],t[o],n):r[o]=Qe(t[o],n))}),r}function We(e,t,n){(n=n||{}).arrayMerge=n.arrayMerge||is,n.isMergeableObject=n.isMergeableObject||as,n.cloneUnlessOtherwiseSpecified=Qe;var r=Array.isArray(t);return r===Array.isArray(e)?r?n.arrayMerge(e,t,n):ls(e,t,n):Qe(t,n)}We.all=function(e,t){if(!Array.isArray(e))throw new Error("first argument should be an array");return e.reduce(function(n,r){return We(n,r,t)},{})};var cs=os(We);const zn={text:{primary:"rgba(0, 0, 0, 0.87)",secondary:"rgba(0, 0, 0, 0.54)",disabled:"rgba(0, 0, 0, 0.38)"},background:{default:"#FFFFFF"},context:{background:"#e3f2fd",text:"rgba(0, 0, 0, 0.87)"},divider:{default:"rgba(0,0,0,.12)"},button:{default:"rgba(0,0,0,.54)",focus:"rgba(0,0,0,.12)",hover:"rgba(0,0,0,.12)",disabled:"rgba(0, 0, 0, .18)"},selected:{default:"#e3f2fd",text:"rgba(0, 0, 0, 0.87)"},highlightOnHover:{default:"#EEEEEE",text:"rgba(0, 0, 0, 0.87)"},striped:{default:"#FAFAFA",text:"rgba(0, 0, 0, 0.87)"}},Wn={default:zn,light:zn,dark:{text:{primary:"#FFFFFF",secondary:"rgba(255, 255, 255, 0.7)",disabled:"rgba(0,0,0,.12)"},background:{default:"#424242"},context:{background:"#E91E63",text:"#FFFFFF"},divider:{default:"rgba(81, 81, 81, 1)"},button:{default:"#FFFFFF",focus:"rgba(255, 255, 255, .54)",hover:"rgba(255, 255, 255, .12)",disabled:"rgba(255, 255, 255, .18)"},selected:{default:"rgba(0, 0, 0, .7)",text:"#FFFFFF"},highlightOnHover:{default:"rgba(0, 0, 0, .7)",text:"#FFFFFF"},striped:{default:"rgba(0, 0, 0, .87)",text:"#FFFFFF"}}};function ds(e,t,n,r){const[o,a]=s.useState(()=>jn(e)),[i,c]=s.useState(""),d=s.useRef("");$e(()=>{a(jn(e))},[e]);const h=s.useCallback(O=>{var $,S,m;const{attributes:C}=O.target,D=($=C.getNamedItem("data-column-id"))===null||$===void 0?void 0:$.value;D&&(d.current=((m=(S=o[at(o,D)])===null||S===void 0?void 0:S.id)===null||m===void 0?void 0:m.toString())||"",c(d.current))},[o]),u=s.useCallback(O=>{var $;const{attributes:S}=O.target,m=($=S.getNamedItem("data-column-id"))===null||$===void 0?void 0:$.value;if(m&&d.current&&m!==d.current){const C=at(o,d.current),D=at(o,m),v=[...o];v[C]=o[D],v[D]=o[C],a(v),t(v)}},[t,o]),g=s.useCallback(O=>{O.preventDefault()},[]),y=s.useCallback(O=>{O.preventDefault()},[]),f=s.useCallback(O=>{O.preventDefault(),d.current="",c("")},[]),x=function(O=!1){return O?xe.ASC:xe.DESC}(r),R=s.useMemo(()=>o[at(o,n==null?void 0:n.toString())]||{},[n,o]);return{tableColumns:o,draggingColumnId:i,handleDragStart:h,handleDragEnter:u,handleDragOver:g,handleDragLeave:y,handleDragEnd:f,defaultSortDirection:x,defaultSortColumn:R}}var ps=s.memo(function(e){const{data:t=l.data,columns:n=l.columns,title:r=l.title,actions:o=l.actions,keyField:a=l.keyField,striped:i=l.striped,highlightOnHover:c=l.highlightOnHover,pointerOnHover:d=l.pointerOnHover,dense:h=l.dense,selectableRows:u=l.selectableRows,selectableRowsSingle:g=l.selectableRowsSingle,selectableRowsHighlight:y=l.selectableRowsHighlight,selectableRowsNoSelectAll:f=l.selectableRowsNoSelectAll,selectableRowsVisibleOnly:x=l.selectableRowsVisibleOnly,selectableRowSelected:R=l.selectableRowSelected,selectableRowDisabled:O=l.selectableRowDisabled,selectableRowsComponent:$=l.selectableRowsComponent,selectableRowsComponentProps:S=l.selectableRowsComponentProps,onRowExpandToggled:m=l.onRowExpandToggled,onSelectedRowsChange:C=l.onSelectedRowsChange,expandableIcon:D=l.expandableIcon,onChangeRowsPerPage:v=l.onChangeRowsPerPage,onChangePage:p=l.onChangePage,paginationServer:A=l.paginationServer,paginationServerOptions:U=l.paginationServerOptions,paginationTotalRows:Y=l.paginationTotalRows,paginationDefaultPage:J=l.paginationDefaultPage,paginationResetDefaultPage:ae=l.paginationResetDefaultPage,paginationPerPage:H=l.paginationPerPage,paginationRowsPerPageOptions:ge=l.paginationRowsPerPageOptions,paginationIconLastPage:Ce=l.paginationIconLastPage,paginationIconFirstPage:fe=l.paginationIconFirstPage,paginationIconNext:se=l.paginationIconNext,paginationIconPrevious:Ie=l.paginationIconPrevious,paginationComponent:K=l.paginationComponent,paginationComponentOptions:he=l.paginationComponentOptions,responsive:ce=l.responsive,progressPending:L=l.progressPending,progressComponent:Se=l.progressComponent,persistTableHead:q=l.persistTableHead,noDataComponent:de=l.noDataComponent,disabled:X=l.disabled,noTableHead:me=l.noTableHead,noHeader:ue=l.noHeader,fixedHeader:ee=l.fixedHeader,fixedHeaderScrollHeight:ve=l.fixedHeaderScrollHeight,pagination:Z=l.pagination,subHeader:W=l.subHeader,subHeaderAlign:Je=l.subHeaderAlign,subHeaderWrap:et=l.subHeaderWrap,subHeaderComponent:$t=l.subHeaderComponent,noContextMenu:Et=l.noContextMenu,contextMessage:Ot=l.contextMessage,contextActions:F=l.contextActions,contextComponent:yr=l.contextComponent,expandableRows:tt=l.expandableRows,onRowClicked:Xt=l.onRowClicked,onRowDoubleClicked:Zt=l.onRowDoubleClicked,onRowMouseEnter:Qt=l.onRowMouseEnter,onRowMouseLeave:Jt=l.onRowMouseLeave,sortIcon:xr=l.sortIcon,onSort:Cr=l.onSort,sortFunction:en=l.sortFunction,sortServer:Pt=l.sortServer,expandableRowsComponent:Sr=l.expandableRowsComponent,expandableRowsComponentProps:vr=l.expandableRowsComponentProps,expandableRowDisabled:tn=l.expandableRowDisabled,expandableRowsHideExpander:nn=l.expandableRowsHideExpander,expandOnRowClicked:Rr=l.expandOnRowClicked,expandOnRowDoubleClicked:$r=l.expandOnRowDoubleClicked,expandableRowExpanded:rn=l.expandableRowExpanded,expandableInheritConditionalStyles:Er=l.expandableInheritConditionalStyles,defaultSortFieldId:Or=l.defaultSortFieldId,defaultSortAsc:Pr=l.defaultSortAsc,clearSelectedRows:on=l.clearSelectedRows,conditionalRowStyles:kr=l.conditionalRowStyles,theme:an=l.theme,customStyles:sn=l.customStyles,direction:Ye=l.direction,onColumnOrderChange:Dr=l.onColumnOrderChange,className:Ir}=e,{tableColumns:ln,draggingColumnId:cn,handleDragStart:dn,handleDragEnter:un,handleDragOver:pn,handleDragLeave:gn,handleDragEnd:fn,defaultSortDirection:Ar,defaultSortColumn:_r}=ds(n,Dr,Or,Pr),[{rowsPerPage:be,currentPage:ne,selectedRows:kt,allSelected:hn,selectedCount:mn,selectedColumn:ie,sortDirection:Ae,toggleOnSelectedRowsChange:jr},Re]=s.useReducer(ea,{allSelected:!1,selectedCount:0,selectedRows:[],selectedColumn:_r,toggleOnSelectedRowsChange:!1,sortDirection:Ar,currentPage:J,rowsPerPage:H,selectedRowsFlag:!1,contextMessage:l.contextMessage}),{persistSelectedOnSort:bn=!1,persistSelectedOnPageChange:nt=!1}=U,wn=!(!A||!nt&&!bn),Hr=Z&&!L&&t.length>0,Tr=K||rs,Fr=s.useMemo(()=>((b={},I="default",V="default")=>{const re=Wn[I]?I:V;return cs({table:{style:{color:(w=Wn[re]).text.primary,backgroundColor:w.background.default}},tableWrapper:{style:{display:"table"}},responsiveWrapper:{style:{}},header:{style:{fontSize:"22px",color:w.text.primary,backgroundColor:w.background.default,minHeight:"56px",paddingLeft:"16px",paddingRight:"8px"}},subHeader:{style:{backgroundColor:w.background.default,minHeight:"52px"}},head:{style:{color:w.text.primary,fontSize:"12px",fontWeight:500}},headRow:{style:{backgroundColor:w.background.default,minHeight:"52px",borderBottomWidth:"1px",borderBottomColor:w.divider.default,borderBottomStyle:"solid"},denseStyle:{minHeight:"32px"}},headCells:{style:{paddingLeft:"16px",paddingRight:"16px"},draggingStyle:{cursor:"move"}},contextMenu:{style:{backgroundColor:w.context.background,fontSize:"18px",fontWeight:400,color:w.context.text,paddingLeft:"16px",paddingRight:"8px",transform:"translate3d(0, -100%, 0)",transitionDuration:"125ms",transitionTimingFunction:"cubic-bezier(0, 0, 0.2, 1)",willChange:"transform"},activeStyle:{transform:"translate3d(0, 0, 0)"}},cells:{style:{paddingLeft:"16px",paddingRight:"16px",wordBreak:"break-word"},draggingStyle:{}},rows:{style:{fontSize:"13px",fontWeight:400,color:w.text.primary,backgroundColor:w.background.default,minHeight:"48px","&:not(:last-of-type)":{borderBottomStyle:"solid",borderBottomWidth:"1px",borderBottomColor:w.divider.default}},denseStyle:{minHeight:"32px"},selectedHighlightStyle:{"&:nth-of-type(n)":{color:w.selected.text,backgroundColor:w.selected.default,borderBottomColor:w.background.default}},highlightOnHoverStyle:{color:w.highlightOnHover.text,backgroundColor:w.highlightOnHover.default,transitionDuration:"0.15s",transitionProperty:"background-color",borderBottomColor:w.background.default,outlineStyle:"solid",outlineWidth:"1px",outlineColor:w.background.default},stripedStyle:{color:w.striped.text,backgroundColor:w.striped.default}},expanderRow:{style:{color:w.text.primary,backgroundColor:w.background.default}},expanderCell:{style:{flex:"0 0 48px"}},expanderButton:{style:{color:w.button.default,fill:w.button.default,backgroundColor:"transparent",borderRadius:"2px",transition:"0.25s",height:"100%",width:"100%","&:hover:enabled":{cursor:"pointer"},"&:disabled":{color:w.button.disabled},"&:hover:not(:disabled)":{cursor:"pointer",backgroundColor:w.button.hover},"&:focus":{outline:"none",backgroundColor:w.button.focus},svg:{margin:"auto"}}},pagination:{style:{color:w.text.secondary,fontSize:"13px",minHeight:"56px",backgroundColor:w.background.default,borderTopStyle:"solid",borderTopWidth:"1px",borderTopColor:w.divider.default},pageButtonsStyle:{borderRadius:"50%",height:"40px",width:"40px",padding:"8px",margin:"px",cursor:"pointer",transition:"0.4s",color:w.button.default,fill:w.button.default,backgroundColor:"transparent","&:disabled":{cursor:"unset",color:w.button.disabled,fill:w.button.disabled},"&:hover:not(:disabled)":{backgroundColor:w.button.hover},"&:focus":{outline:"none",backgroundColor:w.button.focus}}},noData:{style:{display:"flex",alignItems:"center",justifyContent:"center",color:w.text.primary,backgroundColor:w.background.default}},progress:{style:{display:"flex",alignItems:"center",justifyContent:"center",color:w.text.primary,backgroundColor:w.background.default}}},b);var w})(sn,an),[sn,an]),Nr=s.useMemo(()=>Object.assign({},Ye!=="auto"&&{dir:Ye}),[Ye]),B=s.useMemo(()=>{if(Pt)return t;if(ie!=null&&ie.sortFunction&&typeof ie.sortFunction=="function"){const b=ie.sortFunction,I=Ae===xe.ASC?b:(V,re)=>-1*b(V,re);return[...t].sort(I)}return function(b,I,V,re){return I?re&&typeof re=="function"?re(b.slice(0),I,V):b.slice(0).sort((w,Dt)=>{const je=I(w),we=I(Dt);if(V==="asc"){if(je<we)return-1;if(je>we)return 1}if(V==="desc"){if(je>we)return-1;if(je<we)return 1}return 0}):b}(t,ie==null?void 0:ie.selector,Ae,en)},[Pt,ie,Ae,t,en]),Ve=s.useMemo(()=>{if(Z&&!A){const b=ne*be,I=b-be;return B.slice(I,b)}return B},[ne,Z,A,be,B]),Mr=s.useCallback(b=>{Re(b)},[]),Lr=s.useCallback(b=>{Re(b)},[]),zr=s.useCallback(b=>{Re(b)},[]),Wr=s.useCallback((b,I)=>Xt(b,I),[Xt]),Br=s.useCallback((b,I)=>Zt(b,I),[Zt]),Gr=s.useCallback((b,I)=>Qt(b,I),[Qt]),Yr=s.useCallback((b,I)=>Jt(b,I),[Jt]),_e=s.useCallback(b=>Re({type:"CHANGE_PAGE",page:b,paginationServer:A,visibleOnly:x,persistSelectedOnPageChange:nt}),[A,nt,x]),Vr=s.useCallback(b=>{const I=qe(Y||Ve.length,b),V=Ht(ne,I);A||_e(V),Re({type:"CHANGE_ROWS_PER_PAGE",page:V,rowsPerPage:b})},[ne,_e,A,Y,Ve.length]);if(Z&&!A&&B.length>0&&Ve.length===0){const b=qe(B.length,be),I=Ht(ne,b);_e(I)}$e(()=>{C({allSelected:hn,selectedCount:mn,selectedRows:kt.slice(0)})},[jr]),$e(()=>{Cr(ie,Ae,B.slice(0))},[ie,Ae]),$e(()=>{p(ne,Y||B.length)},[ne]),$e(()=>{v(be,ne)},[be]),$e(()=>{_e(J)},[J,ae]),$e(()=>{if(Z&&A&&Y>0){const b=qe(Y,be),I=Ht(ne,b);ne!==I&&_e(I)}},[Y]),s.useEffect(()=>{Re({type:"CLEAR_SELECTED_ROWS",selectedRowsFlag:on})},[g,on]),s.useEffect(()=>{if(!R)return;const b=B.filter(V=>R(V)),I=g?b.slice(0,1):b;Re({type:"SELECT_MULTIPLE_ROWS",keyField:a,selectedRows:I,totalRows:B.length,mergeSelections:wn})},[t,R]);const Ur=x?Ve:B,Kr=nt||g||f;return s.createElement(Xo,{theme:Fr},!ue&&(!!r||!!o)&&s.createElement(Ma,{title:r,actions:o,showMenu:!Et,selectedCount:mn,direction:Ye,contextActions:F,contextComponent:yr,contextMessage:Ot}),W&&s.createElement(Wa,{align:Je,wrapContent:et},$t),s.createElement(Ga,Object.assign({$responsive:ce,$fixedHeader:ee,$fixedHeaderScrollHeight:ve,className:Ir},Nr),s.createElement(Ya,null,L&&!q&&s.createElement(Nn,null,Se),s.createElement(na,{disabled:X,className:"rdt_Table",role:"table"},!me&&(!!q||B.length>0&&!L)&&s.createElement(oa,{className:"rdt_TableHead",role:"rowgroup",$fixedHeader:ee},s.createElement(aa,{className:"rdt_TableHeadRow",role:"row",$dense:h},u&&(Kr?s.createElement(Ge,{style:{flex:"0 0 48px"}}):s.createElement(Aa,{allSelected:hn,selectedRows:kt,selectableRowsComponent:$,selectableRowsComponentProps:S,selectableRowDisabled:O,rowData:Ur,keyField:a,mergeSelections:wn,onSelectAllRows:Lr})),tt&&!nn&&s.createElement(Va,null),ln.map(b=>s.createElement(Da,{key:b.id,column:b,selectedColumn:ie,disabled:L||B.length===0,pagination:Z,paginationServer:A,persistSelectedOnSort:bn,selectableRowsVisibleOnly:x,sortDirection:Ae,sortIcon:xr,sortServer:Pt,onSort:Mr,onDragStart:dn,onDragOver:pn,onDragEnd:fn,onDragEnter:un,onDragLeave:gn,draggingColumnId:cn})))),!B.length&&!L&&s.createElement(Ua,null,de),L&&q&&s.createElement(Nn,null,Se),!L&&B.length>0&&s.createElement(Ba,{className:"rdt_TableBody",role:"rowgroup"},Ve.map((b,I)=>{const V=ze(b,a),re=function(we=""){return typeof we!="number"&&(!we||we.length===0)}(V)?I:V,w=pt(b,kt,a),Dt=!!(tt&&rn&&rn(b)),je=!!(tt&&tn&&tn(b));return s.createElement(va,{id:re,key:re,keyField:a,"data-row-id":re,columns:ln,row:b,rowCount:B.length,rowIndex:I,selectableRows:u,expandableRows:tt,expandableIcon:D,highlightOnHover:c,pointerOnHover:d,dense:h,expandOnRowClicked:Rr,expandOnRowDoubleClicked:$r,expandableRowsComponent:Sr,expandableRowsComponentProps:vr,expandableRowsHideExpander:nn,defaultExpanderDisabled:je,defaultExpanded:Dt,expandableInheritConditionalStyles:Er,conditionalRowStyles:kr,selected:w,selectableRowsHighlight:y,selectableRowsComponent:$,selectableRowsComponentProps:S,selectableRowDisabled:O,selectableRowsSingle:g,striped:i,onRowExpandToggled:m,onRowClicked:Wr,onRowDoubleClicked:Br,onRowMouseEnter:Gr,onRowMouseLeave:Yr,onSelectedRow:zr,draggingColumnId:cn,onDragStart:dn,onDragOver:pn,onDragEnd:fn,onDragEnter:un,onDragLeave:gn})}))))),Hr&&s.createElement("div",null,s.createElement(Tr,{onChangePage:_e,onChangeRowsPerPage:Vr,rowCount:Y||B.length,currentPage:ne,rowsPerPage:be,direction:Ye,paginationRowsPerPageOptions:ge,paginationIconLastPage:Ce,paginationIconFirstPage:fe,paginationIconNext:se,paginationIconPrevious:Ie,paginationComponentOptions:he})))});export{ps as X};
