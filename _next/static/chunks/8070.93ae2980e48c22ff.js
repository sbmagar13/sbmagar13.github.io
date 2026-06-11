"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8070],{4436:(e,t,r)=>{r.d(t,{k5:()=>c});var v=r(2115),i={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},o=v.createContext&&v.createContext(i),n=["attr","size","title"];function a(){return(a=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var v in r)Object.prototype.hasOwnProperty.call(r,v)&&(e[v]=r[v])}return e}).apply(this,arguments)}function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var v=Object.getOwnPropertySymbols(e);t&&(v=v.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,v)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach(function(t){var v,i,o;v=e,i=t,o=r[t],(i=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var v=r.call(e,t||"default");if("object"!=typeof v)return v;throw TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(i))in v?Object.defineProperty(v,i,{value:o,enumerable:!0,configurable:!0,writable:!0}):v[i]=o}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function c(e){return t=>v.createElement(l,a({attr:s({},e.attr)},t),function e(t){return t&&t.map((t,r)=>v.createElement(t.tag,s({key:r},t.attr),e(t.child)))}(e.child))}function l(e){var t=t=>{var r,{attr:i,size:o,title:u}=e,c=function(e,t){if(null==e)return{};var r,v,i=function(e,t){if(null==e)return{};var r={};for(var v in e)if(Object.prototype.hasOwnProperty.call(e,v)){if(t.indexOf(v)>=0)continue;r[v]=e[v]}return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(v=0;v<o.length;v++)r=o[v],!(t.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}(e,n),l=o||t.size||"1em";return t.className&&(r=t.className),e.className&&(r=(r?r+" ":"")+e.className),v.createElement("svg",a({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},t.attr,i,c,{className:r,style:s(s({color:e.color||t.color},t.style),e.style),height:l,width:l,xmlns:"http://www.w3.org/2000/svg"}),u&&v.createElement("title",null,u),e.children)};return void 0!==o?v.createElement(o.Consumer,null,e=>t(e)):t(i)}},4549:(e,t,r)=>{r.d(t,{I:()=>u});var v=r(9630),i=r(2115),o=r(3264),n=r(8389);class a extends o.uSd{constructor(e={}){super(e),this.setValues(e),this._time={value:0},this._distort={value:.4},this._radius={value:1}}onBeforeCompile(e){e.uniforms.time=this._time,e.uniforms.radius=this._radius,e.uniforms.distort=this._distort,e.vertexShader=`
      uniform float time;
      uniform float radius;
      uniform float distort;
      #define GLSLIFY 1
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
      ${e.vertexShader}
    `,e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`
        float updateTime = time / 50.0;
        float noise = snoise(vec3(position / 2.0 + updateTime * 5.0));
        vec3 transformed = vec3(position * (noise * pow(distort, 2.0) + radius));
        `)}get time(){return this._time.value}set time(e){this._time.value=e}get distort(){return this._distort.value}set distort(e){this._distort.value=e}get radius(){return this._radius.value}set radius(e){this._radius.value=e}}let u=i.forwardRef(({speed:e=1,...t},r)=>{let[o]=i.useState(()=>new a);return(0,n.D)(t=>o&&(o.time=t.clock.elapsedTime*e)),i.createElement("primitive",(0,v.A)({object:o,ref:r,attach:"material"},t))})},8435:(e,t,r)=>{r.d(t,{_:()=>s});var v=r(9630),i=r(2115),o=r(3264),n=r(8389);let a={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
      varying vec2 vUv;

      void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float h;

    varying vec2 vUv;

    void main() {

    	vec4 sum = vec4( 0.0 );

    	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

    	gl_FragColor = sum;

    }
  `},u={uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`
    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,fragmentShader:`

  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

    gl_FragColor = sum;

  }
  `},s=i.forwardRef(({scale:e=10,frames:t=1/0,opacity:r=1,width:s=1,height:c=1,blur:l=1,near:f=0,far:m=10,resolution:x=512,smooth:d=!0,color:y="#000000",depthWrite:p=!1,renderOrder:h,...g},b)=>{let D,w;let U=i.useRef(null),O=(0,n.C)(e=>e.scene),z=(0,n.C)(e=>e.gl),_=i.useRef(null);s*=Array.isArray(e)?e[0]:e||1,c*=Array.isArray(e)?e[1]:e||1;let[j,S,C,P,E,k,M]=i.useMemo(()=>{let e=new o.nWS(x,x),t=new o.nWS(x,x);t.texture.generateMipmaps=e.texture.generateMipmaps=!1;let r=new o.bdM(s,c).rotateX(Math.PI/2),v=new o.eaF(r),i=new o.CSG;i.depthTest=i.depthWrite=!1,i.onBeforeCompile=e=>{e.uniforms={...e.uniforms,ucolor:{value:new o.Q1f(y)}},e.fragmentShader=e.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
           void main() {
          `),e.fragmentShader=e.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")};let n=new o.BKk(a),l=new o.BKk(u);return l.depthTest=n.depthTest=!1,[e,r,i,v,n,l,t]},[x,s,c,e,y]),T=e=>{P.visible=!0,P.material=E,E.uniforms.tDiffuse.value=j.texture,E.uniforms.h.value=+e/256,z.setRenderTarget(M),z.render(P,_.current),P.material=k,k.uniforms.tDiffuse.value=M.texture,k.uniforms.v.value=+e/256,z.setRenderTarget(j),z.render(P,_.current),P.visible=!1},I=0;return(0,n.D)(()=>{_.current&&(t===1/0||I<t)&&(I++,D=O.background,w=O.overrideMaterial,U.current.visible=!1,O.background=null,O.overrideMaterial=C,z.setRenderTarget(j),z.render(O,_.current),T(l),d&&T(.4*l),z.setRenderTarget(null),U.current.visible=!0,O.overrideMaterial=w,O.background=D)}),i.useImperativeHandle(b,()=>U.current,[]),i.createElement("group",(0,v.A)({"rotation-x":Math.PI/2},g,{ref:U}),i.createElement("mesh",{renderOrder:h,geometry:S,scale:[1,-1,1],rotation:[-Math.PI/2,0,0]},i.createElement("meshBasicMaterial",{transparent:!0,map:j.texture,opacity:r,depthWrite:p})),i.createElement("orthographicCamera",{ref:_,args:[-s/2,s/2,c/2,-c/2,f,m]}))})}}]);