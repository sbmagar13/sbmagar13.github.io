"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[332],{1332:(e,t,r)=>{r.d(t,{d:()=>v});var i=r(9630),a=r(2115),n=r(3264),o=r(8389);let l=parseInt(n.sPf.replace(/\D+/g,""));class s extends n.BKk{constructor(e=new n.I9Y){super({uniforms:{inputBuffer:new n.nc$(null),depthBuffer:new n.nc$(null),resolution:new n.nc$(new n.I9Y),texelSize:new n.nc$(new n.I9Y),halfTexelSize:new n.nc$(new n.I9Y),kernel:new n.nc$(0),scale:new n.nc$(1),cameraNear:new n.nc$(0),cameraFar:new n.nc$(1),minDepthThreshold:new n.nc$(0),maxDepthThreshold:new n.nc$(1),depthScale:new n.nc$(0),depthToBlurRatioBias:new n.nc$(.25)},fragmentShader:`#include <common>
        #include <dithering_pars_fragment>      
        uniform sampler2D inputBuffer;
        uniform sampler2D depthBuffer;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          float depthFactor = 0.0;
          
          #ifdef USE_DEPTH
            vec4 depth = texture2D(depthBuffer, vUv);
            depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
            depthFactor *= depthScale;
            depthFactor = max(0.0, min(1.0, depthFactor + 0.25));
          #endif
          
          vec4 sum = texture2D(inputBuffer, mix(vUv0, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv1, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv2, vUv, depthFactor));
          sum += texture2D(inputBuffer, mix(vUv3, vUv, depthFactor));
          gl_FragColor = sum * 0.25 ;

          #include <dithering_fragment>
          #include <tonemapping_fragment>
          #include <${l>=154?"colorspace_fragment":"encodings_fragment"}>
        }`,vertexShader:`uniform vec2 texelSize;
        uniform vec2 halfTexelSize;
        uniform float kernel;
        uniform float scale;
        varying vec2 vUv;
        varying vec2 vUv0;
        varying vec2 vUv1;
        varying vec2 vUv2;
        varying vec2 vUv3;

        void main() {
          vec2 uv = position.xy * 0.5 + 0.5;
          vUv = uv;

          vec2 dUv = (texelSize * vec2(kernel) + halfTexelSize) * scale;
          vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
          vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
          vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
          vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,blending:n.XIg,depthWrite:!1,depthTest:!1}),this.toneMapped=!1,this.setTexelSize(e.x,e.y),this.kernel=new Float32Array([0,1,2,2,3])}setTexelSize(e,t){this.uniforms.texelSize.value.set(e,t),this.uniforms.halfTexelSize.value.set(e,t).multiplyScalar(.5)}setResolution(e){this.uniforms.resolution.value.copy(e)}}class u{constructor({gl:e,resolution:t,width:r=500,height:i=500,minDepthThreshold:a=0,maxDepthThreshold:o=1,depthScale:l=0,depthToBlurRatioBias:u=.25}){this.renderToScreen=!1,this.renderTargetA=new n.nWS(t,t,{minFilter:n.k6q,magFilter:n.k6q,stencilBuffer:!1,depthBuffer:!1,type:n.ix0}),this.renderTargetB=this.renderTargetA.clone(),this.convolutionMaterial=new s,this.convolutionMaterial.setTexelSize(1/r,1/i),this.convolutionMaterial.setResolution(new n.I9Y(r,i)),this.scene=new n.Z58,this.camera=new n.i7d,this.convolutionMaterial.uniforms.minDepthThreshold.value=a,this.convolutionMaterial.uniforms.maxDepthThreshold.value=o,this.convolutionMaterial.uniforms.depthScale.value=l,this.convolutionMaterial.uniforms.depthToBlurRatioBias.value=u,this.convolutionMaterial.defines.USE_DEPTH=l>0;let h=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),v=new Float32Array([0,0,2,0,0,2]),m=new n.LoY;m.setAttribute("position",new n.THS(h,3)),m.setAttribute("uv",new n.THS(v,2)),this.screen=new n.eaF(m,this.convolutionMaterial),this.screen.frustumCulled=!1,this.scene.add(this.screen)}render(e,t,r){let i,a,n;let o=this.scene,l=this.camera,s=this.renderTargetA,u=this.renderTargetB,h=this.convolutionMaterial,v=h.uniforms;v.depthBuffer.value=t.depthTexture;let m=h.kernel,d=t;for(a=0,n=m.length-1;a<n;++a)i=(1&a)==0?s:u,v.kernel.value=m[a],v.inputBuffer.value=d.texture,e.setRenderTarget(i),e.render(o,l),d=i;v.kernel.value=m[a],v.inputBuffer.value=d.texture,e.setRenderTarget(this.renderToScreen?null:r),e.render(o,l)}}class h extends n._4j{constructor(e={}){super(e),this._tDepth={value:null},this._distortionMap={value:null},this._tDiffuse={value:null},this._tDiffuseBlur={value:null},this._textureMatrix={value:null},this._hasBlur={value:!1},this._mirror={value:0},this._mixBlur={value:0},this._blurStrength={value:.5},this._minDepthThreshold={value:.9},this._maxDepthThreshold={value:1},this._depthScale={value:0},this._depthToBlurRatioBias={value:.25},this._distortion={value:1},this._mixContrast={value:1},this.setValues(e)}onBeforeCompile(e){var t;null!=(t=e.defines)&&t.USE_UV||(e.defines.USE_UV=""),e.uniforms.hasBlur=this._hasBlur,e.uniforms.tDiffuse=this._tDiffuse,e.uniforms.tDepth=this._tDepth,e.uniforms.distortionMap=this._distortionMap,e.uniforms.tDiffuseBlur=this._tDiffuseBlur,e.uniforms.textureMatrix=this._textureMatrix,e.uniforms.mirror=this._mirror,e.uniforms.mixBlur=this._mixBlur,e.uniforms.mixStrength=this._blurStrength,e.uniforms.minDepthThreshold=this._minDepthThreshold,e.uniforms.maxDepthThreshold=this._maxDepthThreshold,e.uniforms.depthScale=this._depthScale,e.uniforms.depthToBlurRatioBias=this._depthToBlurRatioBias,e.uniforms.distortion=this._distortion,e.uniforms.mixContrast=this._mixContrast,e.vertexShader=`
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
      ${e.vertexShader}`,e.vertexShader=e.vertexShader.replace("#include <project_vertex>",`#include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );`),e.fragmentShader=`
        uniform sampler2D tDiffuse;
        uniform sampler2D tDiffuseBlur;
        uniform sampler2D tDepth;
        uniform sampler2D distortionMap;
        uniform float distortion;
        uniform float cameraNear;
			  uniform float cameraFar;
        uniform bool hasBlur;
        uniform float mixBlur;
        uniform float mirror;
        uniform float mixStrength;
        uniform float minDepthThreshold;
        uniform float maxDepthThreshold;
        uniform float mixContrast;
        uniform float depthScale;
        uniform float depthToBlurRatioBias;
        varying vec4 my_vUv;
        ${e.fragmentShader}`,e.fragmentShader=e.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>

      float distortionFactor = 0.0;
      #ifdef USE_DISTORTION
        distortionFactor = texture2D(distortionMap, vUv).r * distortion;
      #endif

      vec4 new_vUv = my_vUv;
      new_vUv.x += distortionFactor;
      new_vUv.y += distortionFactor;

      vec4 base = texture2DProj(tDiffuse, new_vUv);
      vec4 blur = texture2DProj(tDiffuseBlur, new_vUv);

      vec4 merge = base;

      #ifdef USE_NORMALMAP
        vec2 normal_uv = vec2(0.0);
        vec4 normalColor = texture2D(normalMap, vUv * normalScale);
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        vec3 coord = new_vUv.xyz / new_vUv.w;
        normal_uv = coord.xy + coord.z * my_normal.xz * 0.05;
        vec4 base_normal = texture2D(tDiffuse, normal_uv);
        vec4 blur_normal = texture2D(tDiffuseBlur, normal_uv);
        merge = base_normal;
        blur = blur_normal;
      #endif

      float depthFactor = 0.0001;
      float blurFactor = 0.0;

      #ifdef USE_DEPTH
        vec4 depth = texture2DProj(tDepth, new_vUv);
        depthFactor = smoothstep(minDepthThreshold, maxDepthThreshold, 1.0-(depth.r * depth.a));
        depthFactor *= depthScale;
        depthFactor = max(0.0001, min(1.0, depthFactor));

        #ifdef USE_BLUR
          blur = blur * min(1.0, depthFactor + depthToBlurRatioBias);
          merge = merge * min(1.0, depthFactor + 0.5);
        #else
          merge = merge * depthFactor;
        #endif

      #endif

      float reflectorRoughnessFactor = roughness;
      #ifdef USE_ROUGHNESSMAP
        vec4 reflectorTexelRoughness = texture2D( roughnessMap, vUv );
        reflectorRoughnessFactor *= reflectorTexelRoughness.g;
      #endif

      #ifdef USE_BLUR
        blurFactor = min(1.0, mixBlur * reflectorRoughnessFactor);
        merge = mix(merge, blur, blurFactor);
      #endif

      vec4 newMerge = vec4(0.0, 0.0, 0.0, 1.0);
      newMerge.r = (merge.r - 0.5) * mixContrast + 0.5;
      newMerge.g = (merge.g - 0.5) * mixContrast + 0.5;
      newMerge.b = (merge.b - 0.5) * mixContrast + 0.5;

      diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);
      `)}get tDiffuse(){return this._tDiffuse.value}set tDiffuse(e){this._tDiffuse.value=e}get tDepth(){return this._tDepth.value}set tDepth(e){this._tDepth.value=e}get distortionMap(){return this._distortionMap.value}set distortionMap(e){this._distortionMap.value=e}get tDiffuseBlur(){return this._tDiffuseBlur.value}set tDiffuseBlur(e){this._tDiffuseBlur.value=e}get textureMatrix(){return this._textureMatrix.value}set textureMatrix(e){this._textureMatrix.value=e}get hasBlur(){return this._hasBlur.value}set hasBlur(e){this._hasBlur.value=e}get mirror(){return this._mirror.value}set mirror(e){this._mirror.value=e}get mixBlur(){return this._mixBlur.value}set mixBlur(e){this._mixBlur.value=e}get mixStrength(){return this._blurStrength.value}set mixStrength(e){this._blurStrength.value=e}get minDepthThreshold(){return this._minDepthThreshold.value}set minDepthThreshold(e){this._minDepthThreshold.value=e}get maxDepthThreshold(){return this._maxDepthThreshold.value}set maxDepthThreshold(e){this._maxDepthThreshold.value=e}get depthScale(){return this._depthScale.value}set depthScale(e){this._depthScale.value=e}get depthToBlurRatioBias(){return this._depthToBlurRatioBias.value}set depthToBlurRatioBias(e){this._depthToBlurRatioBias.value=e}get distortion(){return this._distortion.value}set distortion(e){this._distortion.value=e}get mixContrast(){return this._mixContrast.value}set mixContrast(e){this._mixContrast.value=e}}let v=a.forwardRef(({mixBlur:e=0,mixStrength:t=1,resolution:r=256,blur:l=[0,0],minDepthThreshold:s=.9,maxDepthThreshold:v=1,depthScale:m=0,depthToBlurRatioBias:d=.25,mirror:f=0,distortion:c=1,mixContrast:p=1,distortionMap:x,reflectorOffset:_=0,...g},S)=>{(0,o.e)({MeshReflectorMaterialImpl:h});let D=(0,o.C)(({gl:e})=>e),T=(0,o.C)(({camera:e})=>e),U=(0,o.C)(({scene:e})=>e),B=(l=Array.isArray(l)?l:[l,l])[0]+l[1]>0,w=l[0],M=l[1],y=a.useRef(null);a.useImperativeHandle(S,()=>y.current,[]);let[b]=a.useState(()=>new n.Zcv),[F]=a.useState(()=>new n.Pq0),[R]=a.useState(()=>new n.Pq0),[C]=a.useState(()=>new n.Pq0),[E]=a.useState(()=>new n.kn4),[k]=a.useState(()=>new n.Pq0(0,0,-1)),[P]=a.useState(()=>new n.IUQ),[I]=a.useState(()=>new n.Pq0),[z]=a.useState(()=>new n.Pq0),[A]=a.useState(()=>new n.IUQ),[$]=a.useState(()=>new n.kn4),[j]=a.useState(()=>new n.ubm),W=a.useCallback(()=>{var e;let t=y.current.parent||(null==(e=y.current)||null==(e=e.__r3f.parent)?void 0:e.object);if(!t||(R.setFromMatrixPosition(t.matrixWorld),C.setFromMatrixPosition(T.matrixWorld),E.extractRotation(t.matrixWorld),F.set(0,0,1),F.applyMatrix4(E),R.addScaledVector(F,_),I.subVectors(R,C),I.dot(F)>0))return;I.reflect(F).negate(),I.add(R),E.extractRotation(T.matrixWorld),k.set(0,0,-1),k.applyMatrix4(E),k.add(C),z.subVectors(R,k),z.reflect(F).negate(),z.add(R),j.position.copy(I),j.up.set(0,1,0),j.up.applyMatrix4(E),j.up.reflect(F),j.lookAt(z),j.far=T.far,j.updateMatrixWorld(),j.projectionMatrix.copy(T.projectionMatrix),$.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),$.multiply(j.projectionMatrix),$.multiply(j.matrixWorldInverse),$.multiply(t.matrixWorld),b.setFromNormalAndCoplanarPoint(F,R),b.applyMatrix4(j.matrixWorldInverse),P.set(b.normal.x,b.normal.y,b.normal.z,b.constant);let r=j.projectionMatrix;A.x=(Math.sign(P.x)+r.elements[8])/r.elements[0],A.y=(Math.sign(P.y)+r.elements[9])/r.elements[5],A.z=-1,A.w=(1+r.elements[10])/r.elements[14],P.multiplyScalar(2/P.dot(A)),r.elements[2]=P.x,r.elements[6]=P.y,r.elements[10]=P.z+1,r.elements[14]=P.w},[T,_]),[N,q,H,O]=a.useMemo(()=>{let i={minFilter:n.k6q,magFilter:n.k6q,type:n.ix0},a=new n.nWS(r,r,i);a.depthBuffer=!0,a.depthTexture=new n.VCu(r,r),a.depthTexture.format=n.zdS,a.depthTexture.type=n.cHt;let o=new n.nWS(r,r,i),l=new u({gl:D,resolution:r,width:w,height:M,minDepthThreshold:s,maxDepthThreshold:v,depthScale:m,depthToBlurRatioBias:d}),h={mirror:f,textureMatrix:$,mixBlur:e,tDiffuse:a.texture,tDepth:a.depthTexture,tDiffuseBlur:o.texture,hasBlur:B,mixStrength:t,minDepthThreshold:s,maxDepthThreshold:v,depthScale:m,depthToBlurRatioBias:d,distortion:c,distortionMap:x,mixContrast:p,"defines-USE_BLUR":B?"":void 0,"defines-USE_DEPTH":m>0?"":void 0,"defines-USE_DISTORTION":x?"":void 0};return[a,o,l,h]},[D,w,M,$,r,f,B,e,t,s,v,m,d,c,x,p]);return(0,o.D)(()=>{var e;let t=y.current.parent||(null==(e=y.current)||null==(e=e.__r3f.parent)?void 0:e.object);if(!t)return;t.visible=!1;let r=D.xr.enabled,i=D.shadowMap.autoUpdate;W(),D.xr.enabled=!1,D.shadowMap.autoUpdate=!1,D.setRenderTarget(N),D.state.buffers.depth.setMask(!0),D.autoClear||D.clear(),D.render(U,j),B&&H.render(D,N,q),D.xr.enabled=r,D.shadowMap.autoUpdate=i,t.visible=!0,D.setRenderTarget(null)}),a.createElement("meshReflectorMaterialImpl",(0,i.A)({attach:"material",key:"key"+O["defines-USE_BLUR"]+O["defines-USE_DEPTH"]+O["defines-USE_DISTORTION"],ref:y},O,g))})}}]);