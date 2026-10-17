import"./modulepreload-polyfill-P2Xu9kJm.js";import{A as e,At as t,B as n,C as r,Ct as i,D as a,Dt as o,F as s,G as c,Gt as l,H as u,Ht as d,It as f,J as p,K as m,Kt as ee,L as h,Lt as g,N as _,Nt as v,O as te,P as y,Pt as b,S as ne,St as x,Ut as S,V as C,Vt as w,Wt as re,Xt as ie,Yt as ae,Zt as oe,_ as se,_t as ce,a as le,an as ue,b as de,bt as fe,ct as pe,d as me,en as T,et as he,f as ge,ft as _e,g as ve,gt as ye,h as be,ht as xe,j as Se,k as Ce,kt as we,lt as E,m as Te,mt as Ee,n as De,ot as D,p as Oe,pt as ke,q as Ae,qt as je,rn as Me,tn as O,ut as Ne,v as Pe,vt as Fe,x as Ie,z as Le}from"./art-OLVUY_Re.js";import{a as Re,c as ze,d as Be,f as Ve,i as He,l as Ue,n as We,o as Ge,r as Ke,s as qe,t as Je,u as Ye}from"./gen-qsiFRjYk.js";import{t as Xe}from"./RoundedBoxGeometry-B0PlWiQ8.js";import{n as Ze,r as Qe,t as $e}from"./Pass-BSrmq3TZ.js";var et=`game-showcase`,tt=`entries`,nt;function rt(){return nt||(nt=new Promise((e,t)=>{let n=indexedDB.open(et,1);n.onupgradeneeded=()=>n.result.createObjectStore(tt,{keyPath:`id`}),n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)}),nt)}async function it(e,t){let n=await rt();return new Promise((r,i)=>{let a=n.transaction(tt,e),o=a.objectStore(tt),s;Promise.resolve(t(o)).then(e=>s=e),a.oncomplete=()=>r(s),a.onerror=()=>i(a.error),a.onabort=()=>i(a.error)})}var at=e=>new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)}),ot={all:()=>it(`readonly`,e=>at(e.getAll())).then(e=>e.sort((e,t)=>(e.order??0)-(t.order??0))),put:e=>it(`readwrite`,t=>at(t.put(e))),del:e=>it(`readwrite`,t=>at(t.delete(e))),putMany:e=>it(`readwrite`,t=>Promise.all(e.map(e=>at(t.put(e)))))},st=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),ct=e=>new Promise(t=>{let n=new FileReader;n.onload=()=>t(n.result),n.readAsDataURL(e)}),lt=async e=>(await fetch(e)).blob();async function ut(e){let t=[];for(let n of e){let e={};for(let[t,r]of Object.entries(n.slots||{}))e[t]=r&&r.blob?{...r,blob:await ct(r.blob)}:r;t.push({...n,slots:e})}return new Blob([JSON.stringify({app:`game-showcase`,version:1,exportedAt:new Date().toISOString(),entries:t})],{type:`application/json`})}async function dt(e,t){let n=JSON.parse(await e.text());if(!n||n.app!==`game-showcase`||!Array.isArray(n.entries))throw Error(`bad file`);let r=new Set(t.map(e=>e.id)),i=t.length,a=[];for(let e of n.entries){if(e.sample&&r.has(e.id))continue;let t={};for(let[n,r]of Object.entries(e.slots||{}))t[n]=r&&typeof r.blob==`string`?{...r,blob:await lt(r.blob)}:r;a.push({...e,id:r.has(e.id)?st():e.id,order:i++,slots:t})}return await ot.putMany(a),a.length}var ft={PS5:`ps5`,NS:`ns`,NS2:`ns2`},pt={Q63184502:`ps5`,Q19610114:`ns`,Q122761124:`ns2`},mt=e=>(e||``).normalize(`NFKC`).toLowerCase().replace(/[\s:：·・\-–—_'’"!！?？.,，。()（）\[\]【】「」『』~〜™®]/g,``);function ht(e){let t=new Set;for(let n=0;n<e.length-1;n++)t.add(e.slice(n,n+2));return e.length===1&&t.add(e),t}function gt(e,t){if(!e||!t)return 0;let n=ht(e),r=ht(t),i=0;for(let e of n)r.has(e)&&i++;return 2*i/(n.size+r.size)}function _t(e,t){return t?t===e?1:t.startsWith(e)?.92-Math.min(.2,(t.length-e.length)*.006):t.includes(e)?.85-Math.min(.2,(t.length-e.length)*.005):gt(e,t)*.8:0}var vt=null;function yt(){return vt||=fetch(`/game-catalog/data/games.json`).then(e=>e.json()).then(e=>e.map(e=>({x:e,keys:[e.title_cn,e.title_en,e.title_ja].filter(Boolean).map(mt)}))).catch(()=>[])}var bt=e=>/[\u3040-\u30ff\u3400-\u9fff]/.test(e||``);function xt(e,t){return bt(e)?/[\u3040-\u30ff]/.test(e)&&t.ja?t.ja:t.cn||t.ja||t.en:t.en||t.cn||t.ja}async function St(e,t=8){let n=mt(e);if(n.length<1)return[];let r=await yt(),i=[];for(let e of r){let t=Math.max(...e.keys.map(e=>_t(n,e)),0);t>.45&&i.push({s:t,x:e.x})}i.sort((e,t)=>t.s-e.s||(e.x.edition===`standard`?-1:1));let a=new Set,o=[];for(let{s:n,x:r}of i){let i=mt(r.title_en||r.title_cn)+r.platform;if(a.has(i))continue;a.add(i);let s={cn:r.title_cn,en:r.title_en,ja:r.title_ja};if(o.push({src:`catalog`,score:n,title:xt(e,s),titles:s,platform:ft[r.platform]||`ps5`,cover:r.cover_url_large||r.cover_url,coverHost:(r.cover_url||``).split(`/`)[2]||``,publisher:r.publisher,date:r.release_date,edition:r.edition_name,summary:r.summary_cn||r.synopsis_zh||r.summary_en||``}),o.length>=t)break}return o}var Ct=e=>fetch(e).then(e=>e.ok?e.json():null).catch(()=>null);async function wt(e,t=5){let n=bt(e)?/[\u3040-\u30ff]/.test(e)?[`ja`,`zh`,`en`]:[`zh`,`ja`,`en`]:[`en`,`ja`],r=[];if(await Promise.all(n.map(async t=>{let n=t===`en`?`${e} video game`:e,i=await Ct(`https://${t}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=4&gsrsearch=${encodeURIComponent(n)}&prop=pageprops&ppprop=page_image|wikibase_item`);for(let e of Object.values(i?.query?.pages||{}))e.pageprops?.wikibase_item&&r.push({L:t,idx:e.index,title:e.title,img:e.pageprops.page_image,qid:e.pageprops.wikibase_item})})),!r.length)return[];let i=await Ct(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&ids=${[...new Set(r.map(e=>e.qid))].slice(0,30).join(`|`)}&props=labels|claims&languages=en|ja|zh|zh-hans|zh-cn`),a=[],o=new Set;r.sort((e,t)=>e.idx-t.idx);for(let n of r){if(o.has(n.qid))continue;let r=i?.entities?.[n.qid];if(!r||!(r.claims?.P31||[]).map(e=>e.mainsnak?.datavalue?.value?.id).includes(`Q7889`))continue;o.add(n.qid);let s=e=>r.labels?.[e]?.value,c={en:s(`en`),ja:s(`ja`),cn:s(`zh-hans`)||s(`zh-cn`)||s(`zh`)},l=(r.claims?.P400||[]).map(e=>pt[e.mainsnak?.datavalue?.value?.id]).filter(Boolean);if(a.length>=t*2)break;a.push({L:n.L,img:n.img,src:`wiki`,score:.5,title:xt(e,c)||n.title,titles:c,platform:l.includes(`ns2`)&&!l.includes(`ps5`)&&!l.includes(`ns`)?`ns2`:l.includes(`ps5`)?`ps5`:l.includes(`ns`)?`ns`:l[0]||null,plats:l,cover:null,coverHost:`wikipedia`,wiki:`https://${n.L}.wikipedia.org/wiki/${encodeURIComponent(n.title)}`})}await Promise.all([...new Set(a.map(e=>e.L))].map(async e=>{let t=a.filter(t=>t.L===e&&t.img);if(!t.length)return;let n=await Ct(`https://${e}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&iiurlwidth=700&titles=${t.map(e=>encodeURIComponent(`File:`+e.img)).join(`|`)}`),r={};for(let e of Object.values(n?.query?.pages||{}))r[e.title.replace(/^[^:]+:/,``).replace(/ /g,`_`)]=e.imageinfo?.[0]?.thumburl||e.imageinfo?.[0]?.url;for(let e of t)e.cover=r[e.img.replace(/ /g,`_`)]||null}));let s=mt(e);for(let e of a)e.score=.5*Math.max(...Object.values(e.titles).filter(Boolean).map(e=>_t(s,mt(e))),_t(s,mt(e.title)));a.sort((e,t)=>t.score-e.score);for(let e of a)for(let t of[e.titles.en,e.titles.cn].filter(Boolean)){let n=(await St(t,1))[0];if(n&&n.score>=.9){e.cover=n.cover,e.platform=n.platform,e.src=`wiki+catalog`,e.date=n.date,e.publisher=n.publisher,e.titles={...n.titles,...Object.fromEntries(Object.entries(e.titles).filter(([,e])=>e))};break}}return a.slice(0,t)}async function Tt(e){if(!e)return null;let t=e=>e.ok&&/^image\//.test(e.headers.get(`content-type`)||`image/`)?e.blob():null;try{let n=await t(await fetch(e,{mode:`cors`}));if(n)return n}catch{}try{let n=await t(await fetch(`https://wsrv.nl/?url=${encodeURIComponent(e.replace(/^https?:\/\//,``))}&w=1400&output=jpg`,{mode:`cors`}));if(n)return n}catch{}return null}var Et={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Dt=class extends Ze{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof g?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ae.clone(e.uniforms),this.material=new g({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new $e(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Ot=class extends Ze{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},kt=class extends Ze{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},At=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new T);this._width=n.width,this._height=n.height,t=new ue(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ae}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Dt(Et),this.copyPass.material.blending=0,this.timer=new je}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Ot!==void 0&&(r instanceof Ot?n=!0:r instanceof kt&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new T);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},jt=class extends Ze{constructor(t,n,r=null,i=null,a=null){super(),this.scene=t,this.camera=n,this.overrideMaterial=r,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new e}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Mt={name:`GTAOShader`,defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:`x`,SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new T},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new pe},cameraProjectionMatrixInverse:{value:new pe},cameraWorldMatrix:{value:new pe},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new O(-1,-1,-1)},sceneBoxMax:{value:new O(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);

			#ifdef USE_REVERSED_DEPTH_BUFFER
				if (depth <= 0.0) {
					discard;
					return;
				}
			#else
				if (depth >= 1.0) {
					discard;
					return;
				}
			#endif
			
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Nt={name:`GTAODepthShader`,defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Pt={name:`GTAOBlendShader`,uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Ft(e=5){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),n=It(t),r=n.length,i=new Uint8Array(r*4);for(let e=0;e<r;++e){let t=n[e],a=2*Math.PI*t/r,o=new O(Math.cos(a),Math.sin(a),0).normalize();i[e*4]=(o.x*.5+.5)*255,i[e*4+1]=(o.y*.5+.5)*255,i[e*4+2]=127,i[e*4+3]=255}let a=new h(i,t,t);return a.wrapS=v,a.wrapT=v,a.needsUpdate=!0,a}function It(e){let t=Math.floor(e)%2==0?Math.floor(e)+1:Math.floor(e),n=t*t,r=Array(n).fill(0),i=Math.floor(t/2),a=t-1;for(let e=1;e<=n;){if(i===-1&&a===t?(a=t-2,i=0):(a===t&&(a=0),i<0&&(i=t-1)),r[i*t+a]!==0){a-=2,i++;continue}r[i*t+a]=e++,a++,i--}return r}var Lt={name:`PoissonDenoiseShader`,defines:{SAMPLES:16,SAMPLE_VECTORS:Rt(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new T},cameraProjectionMatrixInverse:{value:new pe},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				vec4 clipSpacePosition = vec4( vec2( screenPosition ) * 2.0 - 1.0, depth, 1.0 );
			#else
				vec4 clipSpacePosition = vec4( vec3( screenPosition, depth ) * 2.0 - 1.0, 1.0 );
			#endif
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Rt(e,t,n){let r=zt(e,t,n),i=`vec3[SAMPLES](`;for(let t=0;t<e;t++){let n=r[t];i+=`vec3(${n.x}, ${n.y}, ${n.z})${t<e-1?`,`:`)`}`}return i}function zt(e,t,n){let r=[];for(let i=0;i<e;i++){let a=2*Math.PI*t*i/e,o=(i/(e-1))**n;r.push(new O(Math.cos(a),Math.sin(a),o))}return r}var Bt=class{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,r,i,a=.5*(Math.sqrt(3)-1),o=(e+t)*a,s=Math.floor(e+o),c=Math.floor(t+o),l=(3-Math.sqrt(3))/6,u=(s+c)*l,d=s-u,f=c-u,p=e-d,m=t-f,ee,h;p>m?(ee=1,h=0):(ee=0,h=1);let g=p-ee+l,_=m-h+l,v=p-1+2*l,te=m-1+2*l,y=s&255,b=c&255,ne=this.perm[y+this.perm[b]]%12,x=this.perm[y+ee+this.perm[b+h]]%12,S=this.perm[y+1+this.perm[b+1]]%12,C=.5-p*p-m*m;C<0?n=0:(C*=C,n=C*C*this._dot(this.grad3[ne],p,m));let w=.5-g*g-_*_;w<0?r=0:(w*=w,r=w*w*this._dot(this.grad3[x],g,_));let re=.5-v*v-te*te;return re<0?i=0:(re*=re,i=re*re*this._dot(this.grad3[S],v,te)),70*(n+r+i)}noise3d(e,t,n){let r,i,a,o,s=(e+t+n)*(1/3),c=Math.floor(e+s),l=Math.floor(t+s),u=Math.floor(n+s),d=1/6,f=(c+l+u)*d,p=c-f,m=l-f,ee=u-f,h=e-p,g=t-m,_=n-ee,v,te,y,b,ne,x;h>=g?g>=_?(v=1,te=0,y=0,b=1,ne=1,x=0):h>=_?(v=1,te=0,y=0,b=1,ne=0,x=1):(v=0,te=0,y=1,b=1,ne=0,x=1):g<_?(v=0,te=0,y=1,b=0,ne=1,x=1):h<_?(v=0,te=1,y=0,b=0,ne=1,x=1):(v=0,te=1,y=0,b=1,ne=1,x=0);let S=h-v+d,C=g-te+d,w=_-y+d,re=h-b+2*d,ie=g-ne+2*d,ae=_-x+2*d,oe=h-1+3*d,se=g-1+3*d,ce=_-1+3*d,le=c&255,ue=l&255,de=u&255,fe=this.perm[le+this.perm[ue+this.perm[de]]]%12,pe=this.perm[le+v+this.perm[ue+te+this.perm[de+y]]]%12,me=this.perm[le+b+this.perm[ue+ne+this.perm[de+x]]]%12,T=this.perm[le+1+this.perm[ue+1+this.perm[de+1]]]%12,he=.6-h*h-g*g-_*_;he<0?r=0:(he*=he,r=he*he*this._dot3(this.grad3[fe],h,g,_));let ge=.6-S*S-C*C-w*w;ge<0?i=0:(ge*=ge,i=ge*ge*this._dot3(this.grad3[pe],S,C,w));let _e=.6-re*re-ie*ie-ae*ae;_e<0?a=0:(_e*=_e,a=_e*_e*this._dot3(this.grad3[me],re,ie,ae));let ve=.6-oe*oe-se*se-ce*ce;return ve<0?o=0:(ve*=ve,o=ve*ve*this._dot3(this.grad3[T],oe,se,ce)),32*(r+i+a+o)}noise4d(e,t,n,r){let i=this.grad4,a=this.simplex,o=this.perm,s=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20,l,u,d,f,p,m=(e+t+n+r)*s,ee=Math.floor(e+m),h=Math.floor(t+m),g=Math.floor(n+m),_=Math.floor(r+m),v=(ee+h+g+_)*c,te=ee-v,y=h-v,b=g-v,ne=_-v,x=e-te,S=t-y,C=n-b,w=r-ne,re=x>S?32:0,ie=x>C?16:0,ae=S>C?8:0,oe=x>w?4:0,se=S>w?2:0,ce=+(C>w),le=re+ie+ae+oe+se+ce,ue=+(a[le][0]>=3),de=+(a[le][1]>=3),fe=+(a[le][2]>=3),pe=+(a[le][3]>=3),me=+(a[le][0]>=2),T=+(a[le][1]>=2),he=+(a[le][2]>=2),ge=+(a[le][3]>=2),_e=+(a[le][0]>=1),ve=+(a[le][1]>=1),ye=+(a[le][2]>=1),be=+(a[le][3]>=1),xe=x-ue+c,Se=S-de+c,Ce=C-fe+c,we=w-pe+c,E=x-me+2*c,Te=S-T+2*c,Ee=C-he+2*c,De=w-ge+2*c,D=x-_e+3*c,Oe=S-ve+3*c,ke=C-ye+3*c,Ae=w-be+3*c,je=x-1+4*c,Me=S-1+4*c,O=C-1+4*c,Ne=w-1+4*c,Pe=ee&255,Fe=h&255,Ie=g&255,Le=_&255,Re=o[Pe+o[Fe+o[Ie+o[Le]]]]%32,ze=o[Pe+ue+o[Fe+de+o[Ie+fe+o[Le+pe]]]]%32,Be=o[Pe+me+o[Fe+T+o[Ie+he+o[Le+ge]]]]%32,Ve=o[Pe+_e+o[Fe+ve+o[Ie+ye+o[Le+be]]]]%32,He=o[Pe+1+o[Fe+1+o[Ie+1+o[Le+1]]]]%32,Ue=.6-x*x-S*S-C*C-w*w;Ue<0?l=0:(Ue*=Ue,l=Ue*Ue*this._dot4(i[Re],x,S,C,w));let We=.6-xe*xe-Se*Se-Ce*Ce-we*we;We<0?u=0:(We*=We,u=We*We*this._dot4(i[ze],xe,Se,Ce,we));let Ge=.6-E*E-Te*Te-Ee*Ee-De*De;Ge<0?d=0:(Ge*=Ge,d=Ge*Ge*this._dot4(i[Be],E,Te,Ee,De));let Ke=.6-D*D-Oe*Oe-ke*ke-Ae*Ae;Ke<0?f=0:(Ke*=Ke,f=Ke*Ke*this._dot4(i[Ve],D,Oe,ke,Ae));let qe=.6-je*je-Me*Me-O*O-Ne*Ne;return qe<0?p=0:(qe*=qe,p=qe*qe*this._dot4(i[He],je,Me,O,Ne)),27*(l+u+d+f+p)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,r){return e[0]*t+e[1]*n+e[2]*r}_dot4(e,t,n,r,i){return e[0]*t+e[1]*n+e[2]*r+e[3]*i}},Vt=class t extends Ze{constructor(t,n,r=512,i=512,a,o,s){super(),this.width=r,this.height=i,this.clear=!0,this.camera=n,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Ft(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new ue(this.width,this.height,{type:Ae,depthBuffer:!1}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new g({defines:Object.assign({},Mt.defines),uniforms:ae.clone(Mt.uniforms),vertexShader:Mt.vertexShader,fragmentShader:Mt.fragmentShader,blending:0,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new _e,this.normalMaterial.blending=0,this.pdMaterial=new g({defines:Object.assign({},Lt.defines),uniforms:ae.clone(Lt.uniforms),vertexShader:Lt.vertexShader,fragmentShader:Lt.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new g({defines:Object.assign({},Nt.defines),uniforms:ae.clone(Nt.uniforms),vertexShader:Nt.vertexShader,fragmentShader:Nt.fragmentShader,blending:0}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new g({uniforms:ae.clone(Et.uniforms),vertexShader:Et.vertexShader,fragmentShader:Et.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this.blendMaterial=new g({uniforms:ae.clone(Pt.uniforms),vertexShader:Pt.vertexShader,fragmentShader:Pt.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:5,blendSrc:208,blendDst:200,blendEquation:100,blendSrcAlpha:206,blendDstAlpha:200,blendEquationAlpha:100}),this._fsQuad=new $e(null),this._originalClearColor=new e,this.setGBuffer(a?a.depthTexture:void 0,a?a.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),s!==void 0&&this.updatePdMaterial(s)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e===void 0?(this.depthTexture=new n,this.depthTexture.format=Le,this.depthTexture.type=oe,this.normalRenderTarget=new ue(this.width,this.height,{minFilter:xe,magFilter:xe,type:Ae,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0):(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1);let r=+!!this.normalTexture,i=this.depthTexture===this.normalTexture?`w`:`x`;this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=r,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=r,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&+!!e.screenSpaceRadius!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=+!!e.screenSpaceRadius,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Rt(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,n,r){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case t.OUTPUT.Off:break;case t.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case t.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case t.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case t.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:n);break;case t.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:n);break;case t.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=r.texture,this.copyMaterial.blending=0,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:n),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:n);break;default:console.warn(`THREE.GTAOPass: Unknown output type.`)}}_renderPass(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,r,i){e.getClearColor(this._originalClearColor);let a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,r!=null&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(e){(e.isPoints||e.isLine||e.isLine2)&&e.visible&&(e.visible=!1,t.push(e))})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Bt,n=e*e*4,r=new Uint8Array(n);for(let n=0;n<e;n++)for(let i=0;i<e;i++){let a=n,o=i;r[(n*e+i)*4]=(t.noise(a,o)*.5+.5)*255,r[(n*e+i)*4+1]=(t.noise(a+e,o)*.5+.5)*255,r[(n*e+i)*4+2]=(t.noise(a,o+e)*.5+.5)*255,r[(n*e+i)*4+3]=(t.noise(a+e,o+e)*.5+.5)*255}let a=new h(r,e,e,i,ie);return a.wrapS=v,a.wrapT=v,a.needsUpdate=!0,a}};Vt.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Ht={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new e(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},Ut=class t extends Ze{constructor(t,n=1,r,i){super(),this.strength=n,this.radius=r,this.threshold=i,this.resolution=t===void 0?new T(256,256):new T(t.x,t.y),this.clearColor=new e(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new ue(a,o,{type:Ae,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new ue(a,o,{type:Ae,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new ue(a,o,{type:Ae,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),a=Math.round(a/2),o=Math.round(o/2)}let s=Ht;this.highPassUniforms=ae.clone(s.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new g({uniforms:this.highPassUniforms,vertexShader:s.vertexShader,fragmentShader:s.fragmentShader}),this.separableBlurMaterials=[];let c=[6,10,14,18,22];a=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new T(1/a,1/o),a=Math.round(a/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=n,this.compositeMaterial.uniforms.bloomRadius.value=.1;let l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ae.clone(Et.uniforms),this.blendMaterial=new g({uniforms:this.copyUniforms,vertexShader:Et.vertexShader,fragmentShader:Et.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new e,this._oldClearAlpha=1,this._basic=new Ne,this._fsQuad=new $e(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new T(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,n,r,i,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=t.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(r),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new g({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new T(.5,.5)},direction:{value:new T(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new g({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Ut.BlurDirectionX=new T(1,0),Ut.BlurDirectionY=new T(0,1);var Wt={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},Gt=class extends Ze{constructor(){super(),this.isOutputPass=!0,this.uniforms=ae.clone(Wt.uniforms),this.material=new o({name:Wt.name,uniforms:this.uniforms,vertexShader:Wt.vertexShader,fragmentShader:Wt.fragmentShader}),this._fsQuad=new $e(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Se.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Kt={name:`SMAAEdgesShader`,defines:{SMAA_THRESHOLD:`0.1`},uniforms:{tDiffuse:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},qt={name:`SMAAWeightsShader`,defines:{SMAA_MAX_SEARCH_STEPS:`8`,SMAA_AREATEX_MAX_DISTANCE:`16`,SMAA_AREATEX_PIXEL_SIZE:`( 1.0 / vec2( 160.0, 560.0 ) )`,SMAA_AREATEX_SUBTEX_SIZE:`( 1.0 / 7.0 )`},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Jt={name:`SMAABlendShader`,uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`},Yt=class extends Ze{constructor(){super(),this._edgesRT=new ue(1,1,{depthBuffer:!1,type:Ae}),this._edgesRT.texture.name=`SMAAPass.edges`,this._weightsRT=new ue(1,1,{depthBuffer:!1,type:Ae}),this._weightsRT.texture.name=`SMAAPass.weights`;let e=this,t=new Image;t.src=this._getAreaTexture(),t.onload=function(){e._areaTexture.needsUpdate=!0},this._areaTexture=new l,this._areaTexture.name=`SMAAPass.area`,this._areaTexture.image=t,this._areaTexture.minFilter=he,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;let n=new Image;n.src=this._getSearchTexture(),n.onload=function(){e._searchTexture.needsUpdate=!0},this._searchTexture=new l,this._searchTexture.name=`SMAAPass.search`,this._searchTexture.image=n,this._searchTexture.magFilter=xe,this._searchTexture.minFilter=xe,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=ae.clone(Kt.uniforms),this._materialEdges=new g({defines:Object.assign({},Kt.defines),uniforms:this._uniformsEdges,vertexShader:Kt.vertexShader,fragmentShader:Kt.fragmentShader}),this._uniformsWeights=ae.clone(qt.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new g({defines:Object.assign({},qt.defines),uniforms:this._uniformsWeights,vertexShader:qt.vertexShader,fragmentShader:qt.fragmentShader}),this._uniformsBlend=ae.clone(Jt.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new g({uniforms:this._uniformsBlend,vertexShader:Jt.vertexShader,fragmentShader:Jt.fragmentShader}),this._fsQuad=new $e(null)}render(e,t,n){this._uniformsEdges.tDiffuse.value=n.texture,this._fsQuad.material=this._materialEdges,e.setRenderTarget(this._edgesRT),this.clear&&e.clear(),this._fsQuad.render(e),this._fsQuad.material=this._materialWeights,e.setRenderTarget(this._weightsRT),this.clear&&e.clear(),this._fsQuad.render(e),this._uniformsBlend.tColor.value=n.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this._fsQuad.render(e))}setSize(e,t){this._edgesRT.setSize(e,t),this._weightsRT.setSize(e,t),this._materialEdges.uniforms.resolution.value.set(1/e,1/t),this._materialWeights.uniforms.resolution.value.set(1/e,1/t),this._materialBlend.uniforms.resolution.value.set(1/e,1/t)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return`data:image/png;base64,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`}_getSearchTexture(){return`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII=`}},Xt=new ne,Zt=new w,Qt=new O,$t=new WeakMap;function en(e){let t=[];if(e.traverse(e=>{e.isSunLight===!0&&e.visible===!0&&e.castShadow===!0&&t.push(e)}),t.length===0)return null;Xt.makeEmpty(),e.traverse(e=>{e.isMesh===!0&&e.castShadow===!0&&Xt.expandByObject(e)}),Xt.getBoundingSphere(Zt);let n=Zt.center,r=Math.max(Zt.radius,1),i=[];for(let a of t){let t=$t.get(a);t===void 0&&(t=new C,t.castShadow=!0,$t.set(a,t)),t.color.copy(a.color),t.intensity=a.intensity,t.shadow.mapSize.copy(a.shadow.mapSize);let o=t.shadow.camera;o.left=-r,o.right=r,o.top=r,o.bottom=-r,o.near=r*.5,o.far=r*3.5,o.updateProjectionMatrix(),Qt.setFromMatrixPosition(a.matrixWorld).normalize(),t.target.position.copy(n),t.position.copy(n).addScaledVector(Qt,r*2),e.add(t,t.target),t.target.updateMatrixWorld(),t.updateMatrixWorld(),a.visible=!1,i.push({sunLight:a,bakeLight:t})}return i}function tn(e,t){for(let{sunLight:n,bakeLight:r}of t)e.remove(r,r.target),n.visible=!0}var nn=null,rn=null,an=null,on=null,sn=0,cn=null,ln=null,un=null,dn=0,fn=0,pn=0,mn=null,hn=0,gn=new O,_n=new O,vn=new ne,yn=null,bn=1,xn=class extends ye{constructor(e=1,t=1,n=1,r,i,a){super(),this.isLightProbeGrid=!0,this.width=e,this.height=t,this.depth=n,this.resolution=new O(r===void 0?Math.max(2,Math.round(e)+1):r,i===void 0?Math.max(2,Math.round(t)+1):i,a===void 0?Math.max(2,Math.round(n)+1):a),this.boundingBox=new ne,this.texture=null,this._renderTarget=null,this._bounceTarget=null,this._bouncePass=-1,this.updateBoundingBox()}getProbePosition(e,t,n,r){let i=this.position,a=this.resolution,o=this.width,s=this.height,c=this.depth;return r.set(a.x>1?i.x-o/2+e*o/(a.x-1):i.x,a.y>1?i.y-s/2+t*s/(a.y-1):i.y,a.z>1?i.z-c/2+n*c/(a.z-1):i.z),r}updateBoundingBox(){_n.set(this.width,this.height,this.depth),this.boundingBox.setFromCenterAndSize(this.position,_n)}bake(e,t,n={}){let r=this.resolution,i=r.x*r.y*r.z,{bounces:a=0,start:o=0,count:s=i-o,pass:c=0}=n,l=o+s;if(!Number.isInteger(o)||!Number.isInteger(s)||o<0||s<0||l>i)throw RangeError(`THREE.LightProbeGridWebGL: Invalid probe range.`);if(!Number.isInteger(c)||c<0||!Number.isInteger(a)||a<0)throw RangeError(`THREE.LightProbeGridWebGL: Pass and bounce counts must be non-negative integers.`);if(a>0&&s!==i)throw RangeError(`THREE.LightProbeGridWebGL: For ranged baking, use pass instead of bounces.`);if(s===0)return;if(c>0&&o>0&&this._bouncePass!==c)throw Error(`THREE.LightProbeGridWebGL: Start each indirect pass at probe 0.`);this._ensureTextures(),this.updateBoundingBox(),Tn(n),En(i),wn();let u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.autoClear,m=e.xr.enabled,ee=e.shadowMap.autoUpdate,h=t.matrixWorldAutoUpdate,g=this.visible,_=this.texture,v=this._renderTarget,te=v.viewport.clone(),y=null;try{this.visible=!0,h===!0&&(t.updateMatrixWorld(!0),t.matrixWorldAutoUpdate=!1),y=en(t),e.shadowMap.autoUpdate=!1,e.shadowMap.needsUpdate=!0;for(let n=c;n<=c+a;n++)this._updateBakeTexture(e,n,o),this._captureProbes(e,t,o,l),this._repackProbes(e,o,l)}finally{v.viewport.copy(te),e.setRenderTarget(u,d,f),e.autoClear=p,e.xr.enabled=m,e.shadowMap.autoUpdate=ee,y!==null&&tn(t,y),t.matrixWorldAutoUpdate=h,this.visible=g,this.texture=_}}_updateBakeTexture(e,t,n){if(t===0){this.texture=yn,n===0&&(this._bouncePass=-1);return}if(n===0){let n=this._renderTarget;this._bounceTarget===null&&(this._bounceTarget=n.clone()),e.initRenderTarget(n),e.initRenderTarget(this._bounceTarget),vn.min.set(0,0,0),vn.max.set(n.width,n.height,n.depth),e.copyTextureToTexture(n.texture,this._bounceTarget.texture,vn),this._bouncePass=t}this.texture=this._bounceTarget.texture}_captureProbes(e,t,n,r){let{x:i,y:a,z:o}=this.resolution,s=i*o;an.material=on,on.uniforms.envMap.value=ln.texture;for(let c=n;c<r;c++){let n=c%i,r=Math.floor(c/s),l=Math.floor(c/i)%o;this.getProbePosition(n,r,l,gn),un.position.copy(gn),e.autoClear=!0,un.update(e,t);let u=n+r*i+l*i*a;e.autoClear=!1,mn.viewport.set(0,u,9,1),e.setRenderTarget(mn),e.render(nn,rn)}}_repackProbes(e,t,n){let{x:r,y:i,z:a}=this.resolution,o=r*a,s=Math.floor(t/o),c=Math.floor(n/o),l=a+2,u=this._renderTarget;for(let e of cn)e.uniforms.batchTexture.value=mn.texture,e.uniforms.resolution.value.copy(this.resolution);for(let d=0;d<a;d++){let f=s*r+D.clamp(t%o-d*r,0,r),p=c*r+D.clamp(n%o-d*r,0,r);for(let t=f;t<p;){let n=t%r,o=Math.floor(t/r),s=Math.min(r-n,p-t),c=1;s===r&&(c=Math.min(i-o,Math.floor((p-t)/r))),u.viewport.set(n,o,s,c);for(let t=0;t<7;t++){an.material=cn[t],an.material.uniforms.sliceZ.value=d;let n=t*l;e.setRenderTarget(u,n+bn+d),e.render(nn,rn),d===0&&(e.setRenderTarget(u,n),e.render(nn,rn)),d===a-1&&(e.setRenderTarget(u,n+bn+a),e.render(nn,rn))}t+=s*c}}}_ensureTextures(){if(this._renderTarget!==null)return;let e=this.resolution,t=e.x,n=e.y,r=7*(e.z+2),a=new Me(t,n,r,{format:i,type:c,minFilter:he,magFilter:he,generateMipmaps:!1,depthBuffer:!1});this._renderTarget=a,this.texture=a.texture}dispose(){this._bounceTarget!==null&&(this._bounceTarget.dispose(),this._bounceTarget=null,this._bouncePass=-1),this._renderTarget!==null&&(this._renderTarget.dispose(),this._renderTarget=null,this.texture=null)}};function Sn(){nn===null&&(rn=new ce(-1,1,1,-1,0,1),an=new E(new fe(2,2)),nn=new f,nn.add(an))}function Cn(e){Sn(),e!==sn&&(on!==null&&on.dispose(),on=new g({precision:`highp`,defines:{CUBEMAP_SIZE:e},uniforms:{envMap:{value:null}},vertexShader:`
				void main() {
					gl_Position = vec4( position.xy, 0.0, 1.0 );
				}
			`,fragmentShader:`
				#include <common>

				uniform samplerCube envMap;

				void main() {

					int coefIndex = int( gl_FragCoord.x );

					vec3 accum0 = vec3( 0.0 );
					vec3 accum1 = vec3( 0.0 );
					vec3 accum2 = vec3( 0.0 );
					vec3 accum3 = vec3( 0.0 );
					vec3 accum4 = vec3( 0.0 );
					vec3 accum5 = vec3( 0.0 );
					vec3 accum6 = vec3( 0.0 );
					vec3 accum7 = vec3( 0.0 );
					vec3 accum8 = vec3( 0.0 );
					float totalWeight = 0.0;
					float pixelSize = 2.0 / float( CUBEMAP_SIZE );

					for ( int face = 0; face < 6; face ++ ) {

						for ( int iy = 0; iy < CUBEMAP_SIZE; iy ++ ) {

							for ( int ix = 0; ix < CUBEMAP_SIZE; ix ++ ) {

								// WebGL cubemaps have a left-handed orientation (flip = -1)
								float col = ( float( ix ) + 0.5 ) * pixelSize - 1.0;
								float row = 1.0 - ( float( iy ) + 0.5 ) * pixelSize;

								vec3 coord;

								if ( face == 0 ) coord = vec3( 1.0, row, -col );
								else if ( face == 1 ) coord = vec3( -1.0, row, col );
								else if ( face == 2 ) coord = vec3( col, 1.0, -row );
								else if ( face == 3 ) coord = vec3( col, -1.0, row );
								else if ( face == 4 ) coord = vec3( col, row, 1.0 );
								else coord = vec3( -col, row, -1.0 );

								float lengthSq = dot( coord, coord );
								float weight = 4.0 / ( sqrt( lengthSq ) * lengthSq );
								totalWeight += weight;

								vec3 dir = normalize( coord );
								vec3 cw = textureCube( envMap, coord ).rgb * weight;

								// band 0
								accum0 += cw * 0.282095;

								// band 1
								accum1 += cw * ( 0.488603 * dir.y );
								accum2 += cw * ( 0.488603 * dir.z );
								accum3 += cw * ( 0.488603 * dir.x );

								// band 2
								accum4 += cw * ( 1.092548 * ( dir.x * dir.y ) );
								accum5 += cw * ( 1.092548 * ( dir.y * dir.z ) );
								accum6 += cw * ( 0.315392 * ( 3.0 * dir.z * dir.z - 1.0 ) );
								accum7 += cw * ( 1.092548 * ( dir.x * dir.z ) );
								accum8 += cw * ( 0.546274 * ( dir.x * dir.x - dir.y * dir.y ) );

							}

						}

					}

					float norm = 4.0 * PI / totalWeight;

					vec3 accum;
					if ( coefIndex == 0 ) accum = accum0;
					else if ( coefIndex == 1 ) accum = accum1;
					else if ( coefIndex == 2 ) accum = accum2;
					else if ( coefIndex == 3 ) accum = accum3;
					else if ( coefIndex == 4 ) accum = accum4;
					else if ( coefIndex == 5 ) accum = accum5;
					else if ( coefIndex == 6 ) accum = accum6;
					else if ( coefIndex == 7 ) accum = accum7;
					else accum = accum8;

					gl_FragColor = vec4( accum * norm, 1.0 );

				}
			`}),sn=e)}function wn(){if(cn===null){Sn(),cn=[];for(let e=0;e<7;e++)cn[e]=new g({precision:`highp`,defines:{TEXTURE_INDEX:e},uniforms:{batchTexture:{value:null},resolution:{value:new O},sliceZ:{value:0}},vertexShader:`
		void main() {
			gl_Position = vec4( position.xy, 0.0, 1.0 );
		}
	`,fragmentShader:`
				uniform sampler2D batchTexture;
				uniform vec3 resolution;
				uniform int sliceZ;

				void main() {

					int ix = int( gl_FragCoord.x );
					int iy = int( gl_FragCoord.y );
					int iz = sliceZ;

					int probeIndex = ix + iy * int( resolution.x ) + iz * int( resolution.x ) * int( resolution.y );

					// Read 9 SH coefficients from the batch texture row
					vec4 c0 = texelFetch( batchTexture, ivec2( 0, probeIndex ), 0 );
					vec4 c1 = texelFetch( batchTexture, ivec2( 1, probeIndex ), 0 );
					vec4 c2 = texelFetch( batchTexture, ivec2( 2, probeIndex ), 0 );
					vec4 c3 = texelFetch( batchTexture, ivec2( 3, probeIndex ), 0 );
					vec4 c4 = texelFetch( batchTexture, ivec2( 4, probeIndex ), 0 );
					vec4 c5 = texelFetch( batchTexture, ivec2( 5, probeIndex ), 0 );
					vec4 c6 = texelFetch( batchTexture, ivec2( 6, probeIndex ), 0 );
					vec4 c7 = texelFetch( batchTexture, ivec2( 7, probeIndex ), 0 );
					vec4 c8 = texelFetch( batchTexture, ivec2( 8, probeIndex ), 0 );

					// Pack into the output format for this texture index
					#if TEXTURE_INDEX == 0
						gl_FragColor = vec4( c0.rgb, c1.r );
					#elif TEXTURE_INDEX == 1
						gl_FragColor = vec4( c1.gb, c2.rg );
					#elif TEXTURE_INDEX == 2
						gl_FragColor = vec4( c2.b, c3.rgb );
					#elif TEXTURE_INDEX == 3
						gl_FragColor = vec4( c4.rgb, c5.r );
					#elif TEXTURE_INDEX == 4
						gl_FragColor = vec4( c5.gb, c6.rg );
					#elif TEXTURE_INDEX == 5
						gl_FragColor = vec4( c6.b, c7.rgb );
					#else
						gl_FragColor = vec4( c8.rgb, 0.0 );
					#endif

				}
			`})}}function Tn(e){yn===null&&(yn=new s(new Uint16Array(4),1,1,1),yn.type=Ae,yn.minFilter=he,yn.magFilter=he,yn.needsUpdate=!0);let{cubemapSize:t=8,near:n=.1,far:r=100}=e;(ln===null||t!==dn||n!==fn||r!==pn)&&(ln!==null&&ln.dispose(),ln=new de(t,{type:Ae}),un=new _(n,r,ln),dn=t,fn=n,pn=r),Cn(t)}function En(e){(mn===null||hn!==e)&&(mn!==null&&mn.dispose(),mn=new ue(9,e,{type:c,minFilter:xe,magFilter:xe,depthBuffer:!1}),hn=e)}var Dn=Pe.lights_fragment_begin.replace(/defined\( RE_Direct \)/g,`defined( RE_Direct_BAKED_OFF )`).replace(`defined( RE_Direct_RectArea )`,`defined( RE_Direct_RectArea_BAKED_OFF )`).replace(`#if defined( USE_LIGHT_PROBES )`,`#if defined( USE_LIGHT_PROBES_BAKED_OFF )`).replace(`#if ( NUM_HEMI_LIGHTS > 0 )`,`#if 0`).replace(`#ifdef USE_LIGHT_PROBES_GRID`,`#ifdef USE_LIGHT_PROBES_GRID_BAKED_OFF`).replace(`vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );`,`vec3 irradiance = vec3( 0.0 );`),On=Pe.lights_fragment_maps.replace(`iblIrradiance += getIBLIrradiance( geometryNormal );`,``);function kn(e){return e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <lights_fragment_begin>`,Dn).replace(`#include <lights_fragment_maps>`,On)},e.customProgramCacheKey=()=>`baked-lm`,e}async function An({renderer:t,base:n,mobile:r,mats:i,lmGain:a=1}){let o=n+`cab/`,s=new ee,c=t.capabilities.getMaxAnisotropy(),l=(e,t,n=0)=>s.loadAsync(o+e).then(e=>(e.flipY=!1,e.channel=n,e.wrapS=e.wrapT=v,e.anisotropy=n?1:c,t&&(e.colorSpace=b),e)),u=r?`1k`:`2k`,d=new be().setMeshoptDecoder(Te),[f,p,m,h,g,_,y,ne,x,S]=await Promise.all([d.loadAsync(o+`cabinet.glb`),fetch(o+`meta.json`).then(e=>e.json()),l(`oak_diff_${u}.webp`,!0),l(`oak_nor_gl_${u}.webp`),l(`oak_rough_1k.webp`),l(`linen_diff.webp`,!0),l(`linen_nor.webp`),l(`linen_rough.webp`),l(r?`light_1k.webp`:`light_2k.webp`,!0,1),l(r?`ao_512.webp`:`ao_1k.webp`,!1,1)]);for(let e of[x,S])e.wrapS=e.wrapT=te,e.generateMipmaps=!0;let C=p.lightScale*Math.PI*a,w={lightMap:x,lightMapIntensity:C,aoMap:S,aoMapIntensity:.55},re={map:m,normalMap:h,normalScale:new T(.7,.7),roughnessMap:g,roughness:1,clearcoat:.32,clearcoatRoughness:.32,envMapIntensity:.7},ie={Oak:kn(new ke({...re,...w})),OakDark:kn(new ke({...re,...w,color:new e(.38,.3,.24),clearcoat:.1})),Linen:kn(new Ee({map:_,normalMap:y,normalScale:new T(.9,.9),roughnessMap:ne,roughness:1,envMapIntensity:.25,...w})),Alu:kn(new Ee({color:12106946,metalness:1,roughness:.42,envMapIntensity:.9,...w})),Brass:kn(new ke({color:13214826,metalness:1,roughness:.32,envMapIntensity:1,...w}))},ae=new ke({...re}),oe=(e,t)=>{switch(e.name){case`Oak`:case`OakDark`:case`Linen`:case`Alu`:case`Brass`:return t?e.name===`Brass`?i.brass:ae:ie[e.name];case`ShelfGlass`:return i.glassMat;case`GlassEdge`:return i.glassEdge;case`DoorGlass`:return i.doorGlass;case`DoorEdge`:return i.doorEdge;default:return e}},se=f.scene;return se.traverse(e=>{if(!e.isMesh)return;let t=!1;for(let n=e;n&&n!==se;n=n.parent)n.name.startsWith(`Door`)&&(t=!0);e.material=oe(e.material,t);let n=!t;if(e.material===i.glassMat||e.material===i.glassEdge)e.renderOrder=e.material===i.glassEdge?2:1,e.castShadow=!1,e.receiveShadow=!1;else if(e.material===i.doorEdge)e.renderOrder=3,e.castShadow=e.receiveShadow=!1;else if(e.material===i.doorGlass){e.renderOrder=3,e.castShadow=e.receiveShadow=!1,e.geometry.computeBoundingBox();let t=e.geometry.boundingBox,n=.004,r=t.max.z+.001,a=t.min.x+.006,o=t.max.x-.006,s=t.min.y+.006,c=t.max.y-.006,l=(t,n,a,o)=>{let s=new E(new fe(a,o),i.glassLine);s.position.set(t,n,r),s.renderOrder=4,s.castShadow=!1,e.add(s)};l((a+o)/2,s,o-a,n),l((a+o)/2,c,o-a,n),l(a,(s+c)/2,n,c-s),l(o,(s+c)/2,n,c-s)}else e.castShadow=!0,e.receiveShadow=!n}),{lmi:C,materials:ie,make(e,t){let n=se.clone(!0);n.position.x=t;let r=[];for(let[t,i]of[[`DoorL`,-1],[`DoorR`,1]]){let a=n.getObjectByName(t);a&&(a.userData={sx:i,ci:e},r.push(a))}return{group:n,doors:r}}}}var jn=`/game-catalog/`,k=new URLSearchParams(location.search),A=e=>document.getElementById(e),Mn=matchMedia(`(pointer: coarse)`).matches||innerWidth<700,Nn=localStorage.getItem(`game-catalog-lang`)===`en`?`en`:`zh`,Pn={zh:{brandT:`陈列柜`,brandS:`我的电子实体版`,vSpine:`书脊`,vFront:`正面`,makeT:`制作`,loadT:`正在布置展柜…`,emptyH:`展柜还是空的`,emptyP:`上传封面，制作你的第一张电子实体版`,emptyBtn:`开始制作`,mExport:`导出收藏`,mImport:`导入收藏`,iBackT:`放回展柜`,open:`打开`,close:`合上`,take:`取盘`,put:`放回光盘`,flip:`翻面`,iEdit:`编辑`,iLeft:`前移`,iRight:`后移`,iDel:`删除`,eNew:`制作电子实体版`,eEdit:`编辑电子实体版`,eCancel:`取消`,eSave:`保存`,lTitle:`游戏名称`,lBand:`平台标识`,lKey:`Game-Key Card（钥匙卡）`,platNote:``,pn_ps5:`PS5 蓝色 Blu-ray 盒 · 135×171×13.5 mm`,pn_ns:`Switch 透明盒 + 深灰卡带 · 105×170×11 mm`,pn_ns2:`Switch 2 半透红盒 + 红色卡带 · 105×170×11 mm`,takeC:`取卡带`,sheetOut:`抽出封面`,sheetIn:`放回封面`,resetV:`复位`,lkSearching:`正在搜索…`,lkNone:`没有找到匹配，可上传封面，或直接保存（会根据名称生成封面）`,lkWeb:`联网结果`,lkCat:`目录`,lkPick:`选一个自动填充封面与信息`,lkFilled:`已自动填充：%s`,lkFail:`封面下载失败，已保留其他信息`,untitled:`未命名`,putC:`放回卡带`,guideFrame:`红色边框`,slotNote:`全部可选：输入游戏名会自动联网查找封面并补全，未填的部分自动生成；点卡片可上传或裁切。`,cHint:`拖动移动 · 双指或滚轮缩放`,cReset:`重置`,cReplace:`换图`,cRemove:`移除`,cDone:`完成`,auto:`自动生成`,uploaded:`已上传`,required:`必填`,back:`←`,sample:`示例 · 我的实体收藏`,made:`电子实体版`,needTitle:`请填写游戏名称`,needFront:`请上传正面封面`,saved:`已保存到展柜`,deleted:`已删除`,delQ:`确定删除「%s」吗？`,exported:`已导出`,imported:`已导入 %d 项`,badFile:`文件无法识别`,sampleRO:`示例条目不能编辑`,processing:`处理中…`,guideBand:`PS5 顶条区域`,guideBleed:`出血线`,hub:`中心孔`,title:`3D 陈列柜 · 我的电子实体版`},en:{brandT:`Showcase`,brandS:`My digital physical editions`,vSpine:`Spines`,vFront:`Fronts`,makeT:`Create`,loadT:`Setting up the cabinet…`,emptyH:`The cabinet is empty`,emptyP:`Upload a cover to make your first digital physical edition`,emptyBtn:`Get started`,mExport:`Export collection`,mImport:`Import collection`,iBackT:`Back to shelf`,open:`Open`,close:`Close`,take:`Take disc`,put:`Put disc back`,flip:`Flip`,iEdit:`Edit`,iLeft:`Move left`,iRight:`Move right`,iDel:`Delete`,eNew:`New digital edition`,eEdit:`Edit digital edition`,eCancel:`Cancel`,eSave:`Save`,lTitle:`Game title`,lBand:`Platform logo`,lKey:`Game-Key Card`,platNote:``,pn_ps5:`PS5 blue Blu-ray case · 135×171×13.5 mm`,pn_ns:`Switch clear case + dark-grey card · 105×170×11 mm`,pn_ns2:`Switch 2 translucent red case + red card · 105×170×11 mm`,takeC:`Take card`,sheetOut:`Pull out cover`,sheetIn:`Put cover back`,resetV:`Reset`,lkSearching:`Searching…`,lkNone:`No match. Upload a cover or just save (a cover will be generated from the name)`,lkWeb:`Web`,lkCat:`Catalog`,lkPick:`Pick one to auto-fill cover and details`,lkFilled:`Auto-filled: %s`,lkFail:`Cover download failed; other details kept`,untitled:`Untitled`,putC:`Put card back`,guideFrame:`Red frame`,slotNote:`Everything is optional: type a game name to look up the cover online; anything left blank is generated. Tap a card to upload or crop.`,cHint:`Drag to move · pinch or scroll to zoom`,cReset:`Reset`,cReplace:`Replace`,cRemove:`Remove`,cDone:`Done`,auto:`Auto`,uploaded:`Uploaded`,required:`Required`,back:`←`,sample:`Sample · my physical copy`,made:`Digital physical edition`,needTitle:`Please enter a title`,needFront:`Please upload a front cover`,saved:`Saved to the cabinet`,deleted:`Deleted`,delQ:`Delete “%s”?`,exported:`Exported`,imported:`Imported %d item(s)`,badFile:`Unrecognised file`,sampleRO:`The sample entry is read-only`,processing:`Processing…`,guideBand:`PS5 band`,guideBleed:`Bleed`,hub:`Hub`,title:`3D Showcase · digital physical editions`}},j=e=>Pn[Nn][e]??e;function Fn(){document.documentElement.lang=Nn===`en`?`en`:`zh-CN`,document.title=j(`title`);for(let e of`brandT.brandS.vSpine.vFront.makeT.loadT.emptyH.emptyP.emptyBtn.mExport.mImport.iBackT.iEdit.iLeft.iRight.iDel.eCancel.eSave.lTitle.lBand.lKey.slotNote.cHint.cReset.cReplace.cRemove.cDone`.split(`.`)){let t=A(e);t&&(t.textContent=j(e))}A(`langBtn`).textContent=Nn===`en`?`中文`:`EN`,A(`back`).href=jn,Va(),Fo&&Yo()}function In(e){let t=A(`toast`);t.textContent=e,t.classList.remove(`hidden`),clearTimeout(In._t),In._t=setTimeout(()=>t.classList.add(`hidden`),2200)}var Ln=A(`c`),M=new Ie({canvas:Ln,antialias:!0,alpha:!0,preserveDrawingBuffer:k.has(`shot`)});M.setPixelRatio(Math.min(devicePixelRatio,Mn?1.5:2)),M.outputColorSpace=b,M.toneMapping=7,M.toneMappingExposure=1,M.shadowMap.enabled=!0,M.shadowMap.type=1,Qe.init();var N=new f,Rn=new se(M);N.environment=Rn.fromScene(new Be,.04).texture,N.environmentIntensity=.32,new le().load(jn+(Mn?`cab/gallery_512.hdr`:`cab/gallery_1k.hdr`),e=>{e.mapping=303,N.environment=Rn.fromEquirectangular(e).texture,e.dispose(),N.environmentIntensity=+(k.get(`env`)||.4),J=3},void 0,()=>{});var zn=e=>(e.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <lights_fragment_begin>`,Pe.lights_fragment_begin.replace(`#ifdef USE_LIGHT_PROBES_GRID`,`#ifdef USE_LIGHT_PROBES_GRID_OFF`))},e.customProgramCacheKey=()=>`noprobe`,e);N.background=new e(1775894);var P=new Fe(Mn?46:36,1,.05,80),Bn=new Ve(P,Ln),F=new ve(Ln,P,{onInput:()=>{J=3}});Bn.enableDamping=!0,Bn.dampingFactor=.08,Bn.screenSpacePanning=!0,Bn.touches={ONE:re.ROTATE,TWO:re.DOLLY_PAN};var Vn=!0;Bn.addEventListener(`start`,()=>{Vn=!1,J=3}),Bn.addEventListener(`change`,()=>{J=2,Gn()});var Hn=0;Bn.addEventListener(`end`,()=>{clearTimeout(Hn),H===`shelf`&&(Hn=setTimeout(()=>{H===`shelf`&&X(Ma())},2600))});function Un(){if(H===`shelf`){let e=Ma(),t=new d().setFromVector3(e.p.clone().sub(e.t)),n=D.degToRad(15),r=D.degToRad(11);Object.assign(Bn,{minAzimuthAngle:t.theta-n,maxAzimuthAngle:t.theta+n,minPolarAngle:t.phi-r,maxPolarAngle:Math.min(Math.PI/2-.05,t.phi+r),minDistance:t.radius*.5,maxDistance:t.radius*1.12,enablePan:!0,rotateSpeed:.5})}else Object.assign(Bn,{minAzimuthAngle:-1/0,maxAzimuthAngle:1/0,minPolarAngle:.25,maxPolarAngle:Math.PI/2+.3,minDistance:.9,maxDistance:9,enablePan:!0,rotateSpeed:1})}var Wn=new O;function Gn(){if(H!==`shelf`)return;let e=_i(),t=Bn.target;if(Wn.set(D.clamp(t.x,e.x-tr/2,e.x+tr/2),D.clamp(t.y,ir+.3,ir+or*rr-.3),D.clamp(t.z,-.6,.6)),!Wn.equals(t)){let e=Wn.clone().sub(t);t.add(e),P.position.add(e)}}var Kn=new T;addEventListener(`pointermove`,e=>{e.pointerType===`mouse`&&Kn.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5)});var qn=new p(16774116,5918792,.12);N.add(qn);var Jn=new C(16771538,.32);Jn.position.set(4,9,8),Jn.castShadow=!1,Jn.shadow.mapSize.set(Mn?1024:2048,Mn?1024:2048),Jn.shadow.radius=6,Jn.shadow.bias=-5e-4,Jn.shadow.normalBias=.02,Object.assign(Jn.shadow.camera,{left:-6,right:6,top:9,bottom:-1,near:1,far:30}),N.add(Jn),N.add(Jn.target);function Yn(){let e=1024,t=Re(e,e),n=t.getContext(`2d`);n.fillStyle=`#8e8780`,n.fillRect(0,0,e,e);for(let t=0;t<26;t++){let t=Math.random()*e,r=Math.random()*e,i=80+Math.random()*260,a=n.createRadialGradient(t,r,0,t,r,i),o=Math.random()<.5?`255,250,240`:`60,55,50`;a.addColorStop(0,`rgba(${o},0.07)`),a.addColorStop(1,`rgba(${o},0)`),n.fillStyle=a,n.fillRect(0,0,e,e)}for(let t=0;t<26e3;t++)n.fillStyle=Math.random()<.5?`rgba(40,36,32,${Math.random()*.25})`:`rgba(235,230,222,${Math.random()*.22})`,n.fillRect(Math.random()*e,Math.random()*e,1+Math.random()*2,1+Math.random()*2);let r=new a(t);return r.colorSpace=b,r.wrapS=r.wrapT=v,r.repeat.set(8,8),r.anisotropy=8,r}var Xn=zn(new ke({map:Yn(),color:10130315,roughness:.42,metalness:0,clearcoat:.7,clearcoatRoughness:.16,envMapIntensity:.6})),Zn=new E(new fe(160,60),Xn);Zn.rotation.x=-Math.PI/2,Zn.position.set(40,0,10),Zn.receiveShadow=!0,N.add(Zn);function Qn(){let e=Re(16,512),t=e.getContext(`2d`),n=t.createLinearGradient(0,0,0,512);n.addColorStop(0,`#2c2824`),n.addColorStop(.4,`#6d655c`),n.addColorStop(.8,`#7d7469`),n.addColorStop(.97,`#6f675e`),n.addColorStop(1,`#3a3530`),t.fillStyle=n,t.fillRect(0,0,16,512);let r=new a(e);return r.colorSpace=b,r}var $n=new E(new fe(160,16),zn(new Ee({map:Qn(),roughness:.95})));$n.position.set(40,8,-2.2),$n.receiveShadow=!0,N.add($n);var er=new E(new r(160,.14,.04),new Ee({color:2893861,roughness:.6}));er.position.set(40,.07,-2.18),N.add(er);var tr=5.7,nr=1.9,rr=2.2,ir=.42,ar=.16,or=3,sr=or,cr=6.920000000000001,lr=.055,ur=nr/2-.115,dr=12,fr=120,pr=+(k.get(`flc`)||.35),mr=.6,hr=e=>e===0?ir:ir+e*rr+.03,I=0,gr=1,_r=new m;N.add(_r);function vr(e,t,n=1){let r=Re(e,t),i=r.getContext(`2d`),o=Re(e,t).getContext(`2d`),s=Re(e,t),c=s.getContext(`2d`);i.fillStyle=`#b48858`,i.fillRect(0,0,e,t),o.fillStyle=`#808080`,o.fillRect(0,0,e,t),c.fillStyle=`#9a9a9a`,c.fillRect(0,0,e,t);let l=n*9301,u=()=>(l=(l*9301+49297)%233280)/233280;for(let n=0;n<220;n++){let r=u()*t,a=.04+u()*.12,s=.5+u()*3.2,l=u()*9,d=2+u()*6;i.strokeStyle=`rgba(${95+u()*40},${62+u()*20},32,${a})`,i.lineWidth=s,(()=>{i.beginPath();for(let t=0;t<=e;t+=16){let e=r+Math.sin(t*.003+l)*d+Math.sin(t*.019+n)*1.1;t?i.lineTo(t,e):i.moveTo(t,e)}})(),i.stroke(),o.strokeStyle=`rgba(40,40,40,${a*1.6})`,o.lineWidth=s,o.beginPath();for(let t=0;t<=e;t+=16){let e=r+Math.sin(t*.003+l)*d+Math.sin(t*.019+n)*1.1;t?o.lineTo(t,e):o.moveTo(t,e)}o.stroke(),c.strokeStyle=`rgba(230,230,230,${a})`,c.lineWidth=s,c.beginPath();for(let t=0;t<=e;t+=16){let e=r+Math.sin(t*.003+l)*d;t?c.lineTo(t,e):c.moveTo(t,e)}c.stroke()}for(let n=0;n<18;n++){let n=u()*e,r=u()*t;i.fillStyle=`rgba(110,70,35,.10)`,i.beginPath(),i.ellipse(n,r,10+u()*20,3+u()*4,0,0,7),i.fill()}let d=o.getImageData(0,0,e,t).data,f=Re(e,t),p=f.getContext(`2d`),m=p.createImageData(e,t);for(let n=0;n<t;n++)for(let r=0;r<e;r++){let i=(n*e+r)*4,a=d[(n*e+(r+1)%e)*4]-d[i],o=d[((n+1)%t*e+r)*4]-d[i],s=-a/255*3,c=-o/255*3,l=Math.hypot(s,c,1);m.data[i]=(s/l*.5+.5)*255,m.data[i+1]=(c/l*.5+.5)*255,m.data[i+2]=(1/l*.5+.5)*255,m.data[i+3]=255}p.putImageData(m,0,0);let ee=(e,t)=>{let n=new a(e);return t&&(n.colorSpace=b),n.wrapS=n.wrapT=v,n.anisotropy=8,n};return{map:ee(r,!0),normalMap:ee(f),roughnessMap:ee(s)}}var yr=vr(1024,256,3);function br(e=0,t=[1,1]){let n=new ke({roughness:.66,clearcoat:.3,clearcoatRoughness:.45,normalScale:new T(.45,.45),sheen:.15});for(let r of[`map`,`normalMap`,`roughnessMap`]){let i=yr[r].clone();i.anisotropy=M.capabilities.getMaxAnisotropy(),i.rotation=e,i.repeat.set(...t),i.needsUpdate=!0,n[r]=i}return n}var xr=br(0,[1.5,1]),Sr=br(Math.PI/2,[1.5,1]),Cr=br(0,[2,.5]);function wr(){let e=Re(256,256),t=e.getContext(`2d`),n=t.createRadialGradient(128,0,0,128,0,230);n.addColorStop(0,`rgba(255,236,205,.85)`),n.addColorStop(.45,`rgba(255,236,205,.28)`),n.addColorStop(1,`rgba(255,236,205,0)`),t.fillStyle=n,t.fillRect(0,0,256,256);let r=new a(e);return r.colorSpace=b,r}var Tr=new Ne({map:wr(),transparent:!0,depthWrite:!1,blending:2,opacity:.3});function Er(){let e=Re(256,256),t=e.getContext(`2d`),n=t.createRadialGradient(128,128,20,128,128,128);return n.addColorStop(0,`rgba(0,0,0,.55)`),n.addColorStop(.6,`rgba(0,0,0,.22)`),n.addColorStop(1,`rgba(0,0,0,0)`),t.fillStyle=n,t.fillRect(0,0,256,256),new a(e)}var Dr=new Ne({map:Er(),transparent:!0,depthWrite:!1}),Or=new Ne({map:(()=>{let e=Re(64,256),t=e.getContext(`2d`),n=t.createLinearGradient(0,0,64,0);return n.addColorStop(0,`rgba(40,25,10,.35)`),n.addColorStop(1,`rgba(40,25,10,0)`),t.fillStyle=n,t.fillRect(0,0,64,256),new a(e)})(),transparent:!0,depthWrite:!1});function kr(){let e=Re(256,512),t=e.getContext(`2d`),n=t.createLinearGradient(0,0,256,512);return n.addColorStop(0,`rgba(255,255,255,0)`),n.addColorStop(.38,`rgba(255,255,255,0)`),n.addColorStop(.45,`rgba(255,255,255,.22)`),n.addColorStop(.5,`rgba(255,255,255,.05)`),n.addColorStop(.56,`rgba(255,255,255,.14)`),n.addColorStop(.62,`rgba(255,255,255,0)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,256,512),new a(e)}var Ar=new Ne({map:kr(),transparent:!0,depthWrite:!1,blending:2,opacity:.35,side:2});function jr(){let e=Re(512,512),t=e.getContext(`2d`);t.fillStyle=`#ece7df`,t.fillRect(0,0,512,512);for(let e=0;e<9e3;e++)t.fillStyle=`rgba(${Math.random()<.5?`255,255,255`:`120,105,85`},${Math.random()*.05})`,t.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*3,1);let n=new a(e);return n.colorSpace=b,n.wrapS=n.wrapT=v,n.repeat.set(3,3),n}var Mr=new Ee({map:jr(),color:11774621,roughness:.92});function Nr(e,t){return kn(new ke({color:0,roughness:0,metalness:0,ior:1.52,specularIntensity:1,envMapIntensity:t,transparent:!0,opacity:e,depthWrite:!1,blending:5,blendSrc:201,blendDst:205,blendEquation:100}))}var Pr=Nr(.05,+(k.get(`ge`)||.5)),Fr=new ke({color:9225902,roughness:.04,transparent:!0,opacity:.5,envMapIntensity:1.2,depthWrite:!1}),Ir=Nr(.03,+(k.get(`de`)||.25));k.has(`nopane`)&&(Ir.visible=!1);var Lr=Ir.clone();Lr.side=2;var Rr=new ke({color:11853259,roughness:.05,transparent:!0,opacity:.4,envMapIntensity:1.2,depthWrite:!1}),zr=new Ne({color:13627104,transparent:!0,opacity:.32,depthWrite:!1,blending:2});for(let e of[Pr,Fr,Ir,Lr,Rr,zr,Ar])e.userData.noAO=!0;var Br=new ke({color:13214826,metalness:1,roughness:.36,clearcoat:.2,clearcoatRoughness:.2}),Vr=[],Hr=[],Ur={};function Wr(e,t,n,r=.012){let i=[e,t,n,r].map(e=>e.toFixed(3)).join();return Ur[i]||=new Xe(e,t,n,3,r)}function Gr(e,t,n,i,a,o,s,c,l=!0,u=0){let d=new E(u?Wr(e,t,n,u):new r(e,t,n),i);return d.position.set(o,s,c),d.castShadow=l,d.receiveShadow=!0,a.add(d),d}function Kr(e,t,n,r,i,a,o,s=0,c=0){let l=new E(new fe(e,t),n);return l.position.set(i,a,o),l.rotation.set(s,c,0),r.add(l),l}for(let e=0;e<or;e++)Hr.push(ir+e*rr+(e===0?0:.04));function qr(e){let t=new m;t.position.x=e*cr,_r.add(t);let n=or*rr,i=7.180000000000001,a=2.06;Gr(ar,i,a,Sr,t,-5.7/2-ar/2,i/2,0,!0,.02),Gr(ar,i,a,Sr,t,2.93,i/2,0,!0,.02),Gr(6.0200000000000005,ar,a,xr,t,0,i-ar/2,0,!0,.02),Gr(6.140000000000001,.06,2.16,xr,t,0,7.210000000000001,.05,!0,.02),Gr(6.24,.07,2.23,xr,t,0,7.275,.085,!0,.03),Gr(6.180000000000001,.035,2.19,xr,t,0,7.330000000000001,.065,!0,.015),Gr(5.920000000000001,.33999999999999997,1.94,new Ee({color:5916210,roughness:.8}),t,0,.33999999999999997/2,-.04),Gr(6.0600000000000005,.09,2.1,xr,t,0,.375,.01,!0,.02),Gr(tr,n,.05,Mr,t,0,3.72,-1.9/2+.025,!1);for(let e of[-1,1]){let r=Kr(.25,n,Or,t,e*(tr/2-.125),3.72,-1.9/2+.052);r.scale.x=-e}for(let e=0;e<or;e++){let n=ir+e*rr;if(e>0){let e=Gr(5.680000000000001,.03,1.7999999999999998,Pr,t,0,n+.015,-.01,!1);e.renderOrder=1,Gr(5.680000000000001,.03,.012,Fr,t,0,n+.015,nr/2-.066,!1);for(let e of[-1,1])for(let r of[-1,1])Gr(.03,.012,.012,Br,t,e*(tr/2-.02),n-.006,r*(nr/2-.25),!1)}else Gr(tr,.05,nr,Cr,t,0,n-.025,0,!1,.008);n+rr;let r=hr(e);Gr(tr,lr,.03,xr,t,0,r+lr/2,nr/2-.075,!1,.006),Kr(tr,rr*.95,Tr,t,0,r+rr*.475,-1.9/2+.055).rotation.z=Math.PI,e||(Kr(5.6000000000000005,.5,Dr,t,0,n+.004,-.2,-Math.PI/2).scale.y=2.4)}Kr(6.920000000000001,2.96,Dr,t,0,.003,0,-Math.PI/2);for(let i of[-1,1]){let a=new m;a.position.set(i*2.93,ir,1.06),t.add(a);let o=new m;a.add(o);let s=i*.06,c=-i*2.915,l=Math.abs(s-c),u=new E(new r(l,6.580000000000001,.08),[Rr,Rr,Rr,Rr,Ir,Ir]);u.position.set((s+c)/2,n/2,0),u.renderOrder=3,o.add(u);for(let[e,t,r,i]of[[0,-1,1,0],[0,1,1,0],[-1,0,0,1],[1,0,0,1]]){let a=new E(new fe(r?l-.012:.004,i?6.5680000000000005:.004),zr);a.position.set((s+c)/2+e*(l/2-.006),n/2+t*(6.580000000000001/2-.006),.041),a.renderOrder=4,o.add(a)}for(let[e,t]of[[.07,-1],[6.53,1]]){Gr(.15,.11,.13,Br,o,-i*.035,e,0,!1,.012);let n=new E(new y(.016,.016,.07,16),Br);n.position.set(0,e+t*.09,0),o.add(n)}let d=new E(new y(.026,.026,.03,24),Br);d.rotation.x=Math.PI/2,d.position.set(-i*2.83,n/2,.10200000000000001),o.add(d);let f=new E(new y(.011,.011,.05,12),Br);f.rotation.x=Math.PI/2,f.position.set(-i*2.83,n/2,.065),o.add(f),a.userData={sx:i,ci:e},Vr.push(a)}return t}var Jr=null,Yr=[];function Xr(e){let{group:t,doors:n}=Jr.make(e,e*cr);return _r.add(t),Vr.push(...n),Kr(6.920000000000001,2.96,Dr,t,0,.003,0,-Math.PI/2),t}function Zr(){let e=!1;for(let t=0;t<gr;t++){let n=Math.abs(t-I)<=1;n&&!Yr[t]&&(Yr[t]=Jr?Xr(t):qr(t),e=!0),Yr[t]&&(Yr[t].visible=n)}e&&(M.shadowMap.needsUpdate=!0,J=3)}function Qr(e,t=!1){if(e===gr&&_r.children.length&&!t){Zr();return}Jr||_r.traverse(e=>{e.isMesh&&e.geometry&&!Object.values(Ur).includes(e.geometry)&&e.geometry.dispose()}),_r.clear(),Vr.length=0,Yr.length=0,gr=e,I=Math.min(I,e-1),Zr(),pi(),mi()}var $r=new m;N.add($r);var ei=[];function ti(e,t){let n=D.degToRad(dr),r=e.userData.floor+.028;e.color.set(16762250),e.width=4.9,e.height=.025,e.intensity=t/(Math.PI*e.width*e.height)*(Mn?.85:1),e.position.set(0,r,ur),e.lookAt(0,r+Math.sin(n),ur-Math.cos(n))}function ni(){ei.forEach(e=>ti(e,fr*pr)),oi[0].intensity=oi[1].intensity=70,oi[0].angle=oi[1].angle=.32,oi[0].penumbra=oi[1].penumbra=.8,oi[2].intensity=39}for(let e=0;e<or;e++){let n=new t(16762250,1,1,1);n.userData.floor=hr(e),ti(n,fr*mr),$r.add(n),ei.push(n)}var ri=10.58,ii=6.5,ai=16765859,oi=[];for(let[e,t,n,r,i,a,o,s,c]of[[-2.3,ri,ii,-.6,4.6,.6,150,.4,!0],[2.3,ri,ii,.6,4.6,.6,150,.4,!1],[0,ri,ii,0,ir,.2,0,.3,!1],[-3.65,ri,-.7,-3.65,1.2,-2.2,120,.5,!1],[3.65,ri,-.7,3.65,1.2,-2.2,120,.5,!1]]){let l=new S(ai,o,0,s,.9,2);l.position.set(e,t,n),l.target.position.set(r,i,a),c&&(l.castShadow=!0,l.shadow.mapSize.set(Mn?1024:2048,Mn?1024:2048),l.shadow.radius=4,l.shadow.blurSamples=12,l.shadow.bias=-15e-5,l.shadow.normalBias=.012,l.shadow.camera.near=4,l.shadow.camera.far=16),$r.add(l,l.target),oi.push(l)}var si=new Ee({color:1710618,roughness:.4,metalness:.6}),ci=new E(new r(160,.06,.08),si);ci.position.set(40,10.83,ii),N.add(ci);var li=ci.clone();li.position.z=-.7,N.add(li);var ui=new y(.11,.13,.42,20,1,!0),di=new Ee({color:1381653,roughness:.35,metalness:.7,side:2}),fi=new m;N.add(fi);function pi(){fi.clear();for(let e=0;e<gr;e++)for(let t of oi){if(t.position.z<0&&e>0&&t.position.x<0)continue;let n=new E(ui,di),i=new O(t.position.x+e*cr,ri,t.position.z);n.position.copy(i),n.lookAt(new O(t.target.position.x+e*cr,t.target.position.y,t.target.position.z)),n.rotateX(Math.PI/2),fi.add(n);let a=new E(new r(.03,.25,.03),si);a.position.set(i.x,10.71,i.z),fi.add(a)}}function mi(){Zr(),$r.position.x=I*cr,Jn.position.x=4+I*cr,Jn.target.position.x=I*cr,Jn.target.updateMatrixWorld()}var hi=0,gi=0;function _i(){return new O(I*cr,3.72,0)}var vi={ps5:new ke({color:1590992,roughness:.18,transparent:!0,opacity:.88,clearcoat:.8,clearcoatRoughness:.1}),ns:new ke({color:15660022,roughness:.12,transparent:!0,opacity:.55,clearcoat:.9,clearcoatRoughness:.08}),ns2:new ke({color:13111326,roughness:.16,transparent:!0,opacity:.88,clearcoat:.8,clearcoatRoughness:.1})},yi={},bi=e=>Oe(e?.platform);function xi(e){let t=Oe(e),n=t.W+`:`+t.D;if(yi[n])return yi[n];let i=new r(t.W,t.H,t.D),a=i.index.array,o=i.groups,s=[],c=[],l=(e,t)=>{let n=s.length;for(let t of e)for(let e=o[t].start;e<o[t].start+o[t].count;e++)s.push(a[e]);c.push({start:n,count:s.length-n,materialIndex:t})};return l([0,2,3],0),l([1],1),l([4],2),l([5],3),i.setIndex(s),i.clearGroups(),c.forEach(e=>i.addGroup(e.start,e.count,e.materialIndex)),yi[n]=i}var L=[],R=new Map,Si=new Map,Ci=localStorage.getItem(`showcase-view`)||`spine`,wi=Mn?devicePixelRatio>2&&(navigator.hardwareConcurrency||4)>4?1024:512:1024;function Ti(e,t){let[n,r]=e instanceof HTMLCanvasElement?We(e):[e.width,e.height],i=Ue(e,Math.min(1,t/Math.max(n,r))),o=new a(i);return o.colorSpace=b,o.anisotropy=M.capabilities.getMaxAnisotropy(),o}function Ei(e,t=`ps5`){let n=vi[t]||vi.ps5,r=e=>new ke({map:e,roughness:.42,clearcoat:.7,clearcoatRoughness:.12});return[n,r(Ti(e.spine,wi)),r(Ti(e.front,wi)),r(Ti(e.back,wi))]}var Di=null;async function Oi(e){if(Si.has(e.id))return Si.get(e.id);let t;if(e.sample)t=await(Di||=De(jn));else{let n={};for(let t of Object.keys(Je))n[t]=await Ke(e.slots?.[t]?.blob);t=He(e,n)}return Si.set(e.id,t),t}var ki=``,Ai=`all`,ji=localStorage.getItem(`showcase-sort`)||`custom`,Mi=[];function Ni(){let e=mt(ki);Mi=L.filter(t=>(Ai===`all`||(t.platform||`ps5`)===Ai)&&(!e||mt(t.title).includes(e)||Object.values(t.lookup?.titles||{}).some(t=>mt(t).includes(e))));let t={name:(e,t)=>(e.title||``).localeCompare(t.title||``,Nn===`en`?`en`:`zh`),date:(e,t)=>(t.lookup?.date||t.createdAt||0)>(e.lookup?.date||e.createdAt||0)?1:-1,platform:(e,t)=>(e.platform||`ps5`).localeCompare(t.platform||`ps5`)||e.order-t.order,custom:(e,t)=>e.order-t.order};Mi.sort(t[ji]||t.custom)}var Pi=new Map;function Fi(){Ni();let e=Ci===`spine`?5.4:5.5,t=[[]],n=0;for(let r of Mi){let i=bi(r),a=Ci===`spine`?i.D+.045:i.W+.16;n+a>e&&t[t.length-1].length&&(t.push([]),n=0),t[t.length-1].push({e:r,w:a,s:i}),n+=a}return Pi=new Map,t.forEach((e,t)=>{let n=-e.reduce((e,t)=>e+t.w,0)/2;for(let r of e)Pi.set(r.e.id,{row:t,cab:Math.floor(t/sr),x:n+r.w/2,s:r.s}),n+=r.w}),Math.max(1,Math.ceil(t.filter(e=>e.length).length/sr))}function Ii(e){let t=Pi.get(e);if(!t)return null;let n=2-t.row%sr,r=(n===0?ir:ir+n*rr+.03)+.0015+t.s.H/2,i=t.cab*cr+t.x;return Ci===`spine`?{p:new O(i,r,-.05),r:new u(0,Math.PI/2,0),cab:t.cab,glass:n>0,shelf:n}:{p:new O(i,r+.006,-.35),r:new u(-.07,0,0),cab:t.cab,glass:n>0,shelf:n}}var Li=new fe(1,1),Ri=new Ne({map:Dr.map,transparent:!0,depthWrite:!1,opacity:.9,polygonOffset:!0,polygonOffsetFactor:-2}),zi=Ri.clone();zi.opacity=.45;function Bi(e,t){let n=e.userData.decal;n||(n=new E(Li,Ri),n.rotation.x=-Math.PI/2,n.renderOrder=2,e.add(n),e.userData.decal=n);let r=Oe(t);n.position.y=-r.H/2-.001,n.scale.set(r.W*1.1+.06,r.D*2.4+.08,1)}var Vi=(()=>{let e=Re(128,128),t=e.getContext(`2d`),n=t.createImageData(128,128);for(let e=0;e<128;e++)for(let t=0;t<128;t++){let r=(t/127-.5)*2,i=e/127,a=Math.exp(-r*r*3.2)*(1-Math.max(0,i-0)**2.2*.55)*Math.min(1,(1-i)*40),o=(e*128+t)*4;n.data[o]=n.data[o+1]=n.data[o+2]=255*a,n.data[o+3]=255}return t.putImageData(n,0,0),new a(e)})();Vi.flipY=!1;var Hi=new Ne({color:0,alphaMap:Vi,transparent:!0,opacity:.3,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2}),Ui=new x,Wi=new O;function Gi(e,t){if(!t)return;let n=e.userData.wall;n||(n=new E(Li,Hi),n.renderOrder=2,n.castShadow=!1,e.add(n),e.userData.wall=n);let r=Oe(e.userData.plat),i=Ci===`spine`?r.D:r.W,a=hr(t.shelf),o=(t.shelf===2?or*rr:(t.shelf+1)*rr)+ir-a;Ui.setFromEuler(t.r).invert(),Wi.set(t.p.x,a+o/2,-1.9/2+.053).sub(t.p).applyQuaternion(Ui),n.position.copy(Wi),n.quaternion.copy(Ui),n.scale.set(Math.max(.3,i*2.2)+.2,o,1)}var Ki={};function qi(e){return Ki[e]||=new Ee({color:e===`ns`?12849182:e===`ns2`?6952992:1909811,roughness:.55})}var Ji=e=>Object.values(Ki).includes(e.material);function Yi(e){!Ji(e)&&Array.isArray(e.material)&&e.material.forEach(e=>{e.map&&(e.map.dispose(),e.dispose())})}var Xi=[],Zi=!1;async function Qi(){if(Zi||!Xi.length)return;Zi=!0;let e=Xi.shift(),t=L.find(t=>t.id===e),n=R.get(e);if(t&&n&&Ji(n)&&Math.abs((n.userData.cab??0)-I)<=1){let r=await Oi(t);R.get(e)===n&&Ji(n)&&(n.material=Ei(r,t.platform||`ps5`),J=2),!(U&&U.id===e)&&!(Fo&&Fo.id===e)&&Si.delete(e)}Zi=!1}function $i(){Xi=[];for(let[e,t]of R){let n=Math.abs((t.userData.cab??0)-I),r=Pi.has(e);t.visible=r&&n<=1&&(!U||U.id!==e||H!==`inspect`&&H!==`editor`),!r||n>1?Ji(t)||(Yi(t),t.material=qi(t.userData.plat)):Ji(t)&&Xi.push(e)}Xi.sort((e,t)=>Math.abs(R.get(e).userData.cab-I)-Math.abs(R.get(t).userData.cab-I))}async function ea(e=!0){Qr(Fi());let t=new Set(L.map(e=>e.id));for(let[e,n]of R)t.has(e)||(N.remove(n),Yi(n),R.delete(e));for(let t of L){let n=R.get(t.id);n||(n=new E(xi(t.platform),qi(t.platform||`ps5`)),n.castShadow=!0,n.receiveShadow=!0,n.userData.id=t.id,n.userData.plat=t.platform||`ps5`,N.add(n),R.set(t.id,n),n.userData.fresh=!0,Bi(n,t.platform));let r=Ii(t.id);if(!r){n.visible=!1;continue}n.userData.decal.material=r.glass?zi:Ri,Gi(n,r),n.userData.home=r,n.userData.cab=r.cab,!e||n.userData.fresh||Math.abs(r.cab-I)>1?(n.position.copy(r.p),n.rotation.copy(r.r),n.userData.fresh&&e&&Math.abs(r.cab-I)<=1&&(n.scale.setScalar(.001),n.userData.pop=0),n.userData.fresh=!1):n.userData.glide={from:n.position.clone(),q0:n.quaternion.clone(),t:0}}$i(),ra(),A(`empty`).classList.toggle(`hidden`,L.length>0||H!==`shelf`),J=3}async function ta(e){Si.delete(e.id);let t=R.get(e.id);if(!t)return;let n=await Oi(e);Yi(t),t.geometry=xi(e.platform),Bi(t,e.platform),t.userData.plat=e.platform||`ps5`,Gi(t,t.userData.home),t.material=Ei(n,e.platform||`ps5`),J=3}function na(e,t=!0){if(e=D.clamp(e,0,gr-1),e===I&&t){X(Ma());return}I=e,mi(),$i(),ra(),bs(),t&&H===`shelf`&&(X(Ma()),Un()),J=3}function ra(){let e=A(`pager`);if(!e)return;e.classList.toggle(`hidden`,gr<=1),A(`pgLbl`).textContent=`${I+1} / ${gr}`,A(`pgPrev`).disabled=I<=0,A(`pgNext`).disabled=I>=gr-1;let t=A(`pgJump`);if(t.options.length!==gr){t.innerHTML=``;for(let e=0;e<gr;e++){let n=Mi.find(t=>Pi.get(t.id)?.cab===e),r=document.createElement(`option`);r.value=e,r.textContent=`${e+1} · ${n?n.title.slice(0,14):``}`,t.appendChild(r)}}t.value=I}var z=new m;N.add(z),z.visible=!1;var ia={},B=null;function aa(e){if(e=[`ns`,`ns2`].includes(e)?e:`ps5`,!ia[e]){let t=me({renderer:M,scene:N,mobile:Mn,maxAniso:M.capabilities.getMaxAnisotropy(),platform:e});z.add(t.root),t.disc.visible=!1,t.root.traverse(e=>{e.isMesh&&(e.castShadow=!0)}),ia[e]=t}let t=B?B.disc.visible:!1;for(let[t,n]of Object.entries(ia))n.root.visible=t===e,t!==e&&(n.disc.visible=!1);return B=ia[e],B.disc.visible=t,B}aa(`ps5`);var oa=()=>B.H,V=new O;function sa(){let e=_i();return V.set(0,Math.min(e.y,2.4),3.25),V}var H=`shelf`,U=null,ca=0,la=null,W=0,ua=0,da=0,fa=0,G=0,K=0,q=!1,pa=0,ma=0,ha=0,ga=!1,_a=!1,J=3,va=null,Y=0,ya=0,ba=`case`,xa=0,Sa=!1,Ca=0,wa=!1,Ta=new O(-1.55,.62,-.7),Ea=new O,Da=new O,Oa=new O;function ka(e){let t=Mn&&innerWidth<innerHeight?5.2:4;return e.copy(V).add(Aa.set(.75,.42,t))}var Aa=new O;function ja(e){H=e,Un(),typeof $i==`function`&&L.length&&$i(),document.body.className=`mode-`+e,A(`inspect`).classList.toggle(`hidden`,e!==`inspect`),A(`empty`).classList.toggle(`hidden`,L.length>0||e!==`shelf`),Va(),J=3}function Ma(){let e=_i(),t=innerWidth/innerHeight,n=D.degToRad(P.fov),r=3.7908000000000004/Math.tan(n/2),i=6.3*.55/(Math.tan(n/2)*t),a=Math.max(r,i)+nr/2;return{p:new O(e.x+a*.12,e.y+.35,a),t:new O(e.x,e.y-.05,0)}}function Na(){let e=Mn&&innerWidth<innerHeight?5.2:4;return{p:V.clone().add(new O(.75,.42,e)),t:V.clone()}}var Pa=null;function X(e){Pa=e,Vn=!0}async function Fa(e){if(H!==`shelf`)return;let t=R.get(e);t&&(U=L.find(t=>t.id===e),sa(),la={p:t.position.clone(),q:t.quaternion.clone()},ca=0,H=`fly`,document.body.className=`mode-inspect`,gi=1,A(`empty`).classList.add(`hidden`),aa(U.platform),va=Oi(U).then(e=>B.setArt(e)),X(Na()))}async function Ia(){await va;let e=R.get(U.id);z.position.copy(V).sub(new O(0,oa()/2,0)),z.rotation.set(0,0,0),z.visible=!0,B.disc.visible=!0,W=ua=da=fa=G=K=0,q=!1,pa=ma=0,B.pose(0,0),e.visible=!1,ja(`inspect`),X(Na())}function La(){if(H!==`inspect`)return;if(ya||Y>.01){Ra=!0,Mo();return}if(!F.idle){F.reset(),Ra=!0;return}if(K||G>.01){Ba(),Ra=!0;return}if(ua||W>.01){ua=0,Ra=!0,Va();return}Ra=!1;let e=R.get(U.id);z.visible=!1,B.disc.visible=!1,e.visible=!0,e.position.copy(V),e.rotation.set(0,0,0),la={p:e.position.clone(),q:e.quaternion.clone()},ca=0,H=`back`,document.body.className=`mode-shelf`,A(`inspect`).classList.add(`hidden`),X(Ma()),Ra=!1}var Ra=!1;function za(){H!==`inspect`||W<.65||K||Y>0&&!Sa||(F.reset(),_a=!1,ga=!1,fa=1,Va())}function Ba(){F.reset(),q=!1,ma=0,K=0,_a=!0,Va(),X(Na())}function Va(){if(!U)return;A(`iTitle`).textContent=U.title||``,A(`iSub`).textContent=U.sample?j(`sample`):`${{ps5:`PS5`,ns:`Nintendo Switch`,ns2:`Nintendo Switch 2`}[U.platform||`ps5`]}${U.keyCard&&U.platform===`ns2`?` · Game-Key Card`:``} · ${j(`made`)}`,A(`iOpen`).textContent=j(ua?`close`:`open`),A(`iOpen`).disabled=!!(K||G>.02||fa||ya&&Y<1&&!Sa||!ya&&Y>0),A(`iSheet`).textContent=j(ya?`sheetIn`:`sheetOut`),A(`iSheet`).disabled=!ya&&(jo()||Y>0)||ya&&Y<1,A(`iReset`).textContent=j(`resetV`);let e=B.kind===`cart`;A(`iDisc`).textContent=j(K||q?e?`putC`:`put`:e?`takeC`:`take`),A(`iDisc`).disabled=!(W>.65)&&!K||Y>0&&!Sa,A(`iFlip`).textContent=j(`flip`),A(`iFlip`).classList.toggle(`hidden`,!q),A(`iEdit`).disabled=!!U.sample}var Ha=new we,Ua=new T,Wa=null;Ln.addEventListener(`pointerdown`,e=>{Wa=[e.clientX,e.clientY,performance.now()],ko()}),Ln.addEventListener(`pointerup`,e=>{if(Wa&&H===`shelf`){let t=e.clientX-Wa[0],n=e.clientY-Wa[1];if(Math.abs(t)>90&&Math.abs(t)>2*Math.abs(n)){na(I+(t<0?1:-1));return}}if(!(!Wa||Math.hypot(e.clientX-Wa[0],e.clientY-Wa[1])>8||performance.now()-Wa[2]>600)){if(Ua.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1),Ha.setFromCamera(Ua,P),H===`shelf`){let e=Ha.intersectObjects([...R.values()])[0];e&&Fa(e.object.userData.id);return}if(H===`inspect`){if(Sa&&Y>=1&&!jo()&&Ha.intersectObject(B.sheetG,!0).length){Sa=!1,F.reset(),Va(),J=3;return}let e=Ha.intersectObjects([B.btnHit,...B.discPick,B.root],!0);if(!e.length)return;let t=e[0].object,n=!1,r=!1;for(let e=t;e;e=e.parent)(e===B.hub||e.name===`hubBtn`)&&(n=!0),e===B.disc&&(r=!0);if(q)return;(n||r)&&W>.65?za():!ua&&!K&&(Y<=0||Sa&&Y>=1)&&(F.reset(),ua=1,Va())}}});var Ga=new Ce,Ka=e=>e<.5?4*e*e*e:1-(-2*e+2)**3/2,qa=(e,t,n,r)=>t>e?Math.min(t,e+n/r):Math.max(t,e-n/r),Ja=new x,Ya=new O,Xa=new pe,Za=new O(0,1,0),Qa=new x().setFromAxisAngle(new O(0,1,0),Math.PI),$a=new O,eo=new x,to=new O,no=new O,ro=new x;function io(e,t,n,r,i){let a=1-r;return i.set(0,0,0).addScaledVector(e,a*a).addScaledVector(t,2*a*r).addScaledVector(n,r*r)}function ao(){let e=Math.min(Ga.getDelta(),.05),t=!1,n=hi;hi=qa(hi,gi,e,.8),n!==hi&&(t=!0),Vr.forEach(e=>e.rotation.y=e.userData.ci===I?e.userData.sx*Ka(hi)*D.degToRad(105):0),Qi();for(let n of R.values()){if(n.userData.glide){let r=n.userData.glide;r.t=Math.min(1,r.t+e/.6);let i=Ka(r.t);n.position.lerpVectors(r.from,n.userData.home.p,i),eo.setFromEuler(n.userData.home.r),n.quaternion.slerpQuaternions(r.q0,eo,i),r.t>=1&&delete n.userData.glide,t=!0}if(n.userData.pop!=null){n.userData.pop=Math.min(1,n.userData.pop+e/.55);let r=n.userData.pop;n.scale.setScalar(Math.max(.001,1+Math.sin(r*Math.PI)*.06-(1-Ka(r))*1)),r>=1&&(n.scale.setScalar(1),delete n.userData.pop),t=!0}}if(H===`fly`||H===`back`){t=!0,ca=Math.min(1,ca+e/1.15);let n=R.get(U.id),r=Ka(ca);n.userData.decal.visible=H===`back`&&r>.9,n.userData.wall&&(n.userData.wall.visible=n.userData.decal.visible);let i=n.userData.home,a=i.p.clone().add(new O(0,.05,Ci===`spine`?1:.9));H===`fly`?(io(la.p,a.clone().add(new O(0,0,.6)),V,r,n.position),n.quaternion.slerpQuaternions(la.q,ro,Math.min(1,r*1.2)),ca>=1&&Ia()):(eo.setFromEuler(i.r),io(V,a.clone().add(new O(0,0,.6)),i.p,r,n.position),n.quaternion.slerpQuaternions(ro,eo,r),ca>=1&&(ja(`shelf`),gi=0,U=null))}if(H===`inspect`||H===`editor`){let n=W,r=da,i=G;W=qa(W,ua,e,.9),da=qa(da,fa,e,.28),fa===1&&da>.92&&!K&&!ga&&(ga=!0,K=1),G=qa(G,K,e,1),_a&&G<.01&&(_a=!1,fa=0),K===1&&G>.92&&!q&&(q=!0,Va(),X(Na())),Ra&&G<.01&&!K&&W>.99&&da<.01&&(ua=0),Y=qa(Y,ya,e,2.2),Y!==ao._sk&&(ao._sk=Y,t=!0,(Y===0||Y===1)&&Va());let a=Ra&&W<.01&&!K&&G<.01&&Y<=0&&F.idle;wa&&W<.01&&!ua&&G<.01&&!K&&(wa=!1,Sa=!1,ya=0,Va());let o=Ca;Ca=qa(Ca,+!!Sa,e,.7),o!==Ca&&(t=!0),(n!==W||r!==da||i!==G||q)&&(t=!0),n>.4!=W>.4&&Vn&&X(Na()),H===`inspect`?F.update(e)&&(t=!0):F.resetNow();let s=q?`disc`:Y>.34&&!Sa?`sheet`:`case`;s!==ba&&(ba=s,F.resetNow()),F.quaternion(Ja);let c=q?1:Sa?0:D.smoothstep(Y,.4,.9),l=xa;xa+=(c-xa)*(1-Math.exp(-e*6)),Math.abs(c-xa)<1e-4&&(xa=c),l!==xa&&(t=!0);let u=B.root,d=Ka(W);if(z.position.copy(V).sub($a.set(0,oa()/2,0)),z.rotation.set(0,0,0),u.quaternion.copy(s===`case`?Ja:eo.identity()),u.position.set(0,oa()/2+5e-4,0).add(s===`case`?F.offset(V,$a):$a.set(0,0,0)).sub($a.set(-.62*d,0,0).applyQuaternion(u.quaternion)).add($a.set(-3.6*xa,0,0)),Y>0){let e=ka(Da),t=Ya.copy(V).lerp(Ea.copy(V).add(Ta),Ka(Ca));s===`sheet`&&t.add(F.offset(V,$a));let n=e.distanceTo(t),r=2*Math.tan(D.degToRad(P.fov)/2)*n,i=r*P.aspect,a=Math.min(1,.86*i/B.sheetSize.w,.7*r/B.sheetSize.h)*(1-.62*Ka(Ca));Xa.lookAt(e,t,Za),eo.setFromRotationMatrix(Xa).multiply(Qa),s===`sheet`&&eo.premultiply(Ja),Xa.compose(t,eo,$a.setScalar(a)),B.setSheet(Y,Xa)}else B.setSheet(0);z.updateMatrixWorld(!0),B.pose(W,da),z.updateMatrixWorld(!0),B.seatWorld(to);let f=Ka(G),p=Oa.copy(V).lerp(ka(Da),B.kind===`cart`?.5:.4);no.copy(to).add($a.set(.05,.12,.35));let m=B.kind===`cart`;if(B.disc.scale.setScalar(m?1+1.8*D.smoothstep(f,.3,1):1),G<.01)B.disc.position.copy(to),u.getWorldQuaternion(B.disc.quaternion),ha=0;else if(m&&f<.35){let e=f/.35;B.disc.position.lerpVectors(to,no,Ka(e)),B.disc.rotation.set(-e*.25,0,0)}else if(f<.35){let e=f/.35;B.disc.position.lerpVectors(to,no,Ka(e)),B.disc.rotation.set(-e*.15,e*.1,0)}else{let t=(f-.35)/.65;B.disc.position.lerpVectors(no,p,Ka(t)),q&&m?(k.has(`shot`)||(ha+=e*.6),pa=qa(pa,ma,e,.7),B.disc.rotation.set(-.18,Ka(pa)*Math.PI+Math.sin(ha)*.3,0)):q?(!k.has(`shot`)&&!F.dragging&&(ha+=e*.35),pa=qa(pa,ma,e,.7),B.disc.rotation.set(-.3,Ka(pa)*Math.PI,0),B.disc.rotateZ(ha)):B.disc.rotation.set(-.3*t,.2*t,0),s===`disc`&&(B.disc.quaternion.premultiply(Ja),B.disc.position.add(F.offset(p,$a)))}z.visible=!0;let ee=`${W>.65}|${ua}|${K}|${fa}|${q}|${Sa}|${Y>0}`;ee!==ao._ui&&(ao._ui=ee,Va()),a&&H===`inspect`&&La()}if(Vn&&Pa){let n=1-Math.exp(-e*3.2);H===`shelf`&&!k.has(`shot`)?($a.copy(Pa.p).add(new O(Kn.x*.5,-Kn.y*.3,0)),P.position.lerp($a,n)):P.position.lerp(Pa.p,n),Bn.target.lerp(Pa.t,n),P.position.distanceTo(Pa.p)>.004&&(t=!0)}if(Bn.enabled=H===`shelf`,F.enabled=H===`inspect`,ho){let n=H===`inspect`?.52:.32,r=ho.uniforms.uAmt;Math.abs(r.value-n)>.002&&(r.value+=(n-r.value)*(1-Math.exp(-e*5)),t=!0)}let r=Bn.update();if(wo(H===`inspect`&&(F.active||t),e),t||r||J>0){let t=performance.now();yo(),Eo(performance.now()-t,e),J=Math.max(0,J-1)}}M.setAnimationLoop(ao),document.addEventListener(`visibilitychange`,()=>M.setAnimationLoop(document.hidden?null:ao));var oo={uniforms:{tDiffuse:{value:null},uAmt:{value:.32}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`uniform sampler2D tDiffuse; uniform float uAmt; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = smoothstep(0.85, 0.2, length(d * vec2(1.0, 0.85))); c.rgb *= mix(1.0 - uAmt, 1.0, v); gl_FragColor = c; }`},so=[`low`,`mid`,`high`],co=(()=>{try{let e=M.getContext(),t=e.getExtension(`WEBGL_debug_renderer_info`);return t?e.getParameter(t.UNMASKED_RENDERER_WEBGL):``}catch{return``}})(),lo=/SwiftShader|llvmpipe|Mali-[GT][0-7]\d|Adreno \(TM\) [3-5]\d\d|PowerVR|Intel\(R\) (HD|UHD) Graphics [1-6]/i.test(co),uo=k.get(`tier`)||(k.has(`shot`)?`high`:Mn?lo?`low`:`mid`:lo?`mid`:`high`),fo=null,po=null,mo=null,ho=null,go=k.has(`tier`)||k.has(`shot`);function _o(){if(fo?.dispose(),fo=null,po?.dispose?.(),po=null,M.setPixelRatio(Math.min(devicePixelRatio,uo===`high`?2:uo===`mid`?1.5:1)),oi[0].castShadow=uo!==`low`,M.shadowMap.needsUpdate=!0,uo!==`low`){if(fo=new At(M,new ue(1,1,{type:Ae,samples:M.capabilities.isWebGL2===!1?0:4})),fo.addPass(new jt(N,P)),uo===`high`){po=new Vt(N,P,innerWidth,innerHeight);let e=po._overrideVisibility.bind(po);po._overrideVisibility=function(){e();let t=this._visibilityCache;this.scene.traverse(e=>{e.isMesh&&e.visible&&e.material?.userData?.noAO&&(e.visible=!1,t.push(e))})},po.blendIntensity=.6,po.updateGtaoMaterial({radius:.35,distanceExponent:1.6,thickness:1,scale:1}),fo.addPass(po)}mo=new Ut(new T(innerWidth/2,innerHeight/2),.32,.55,1.6),fo.addPass(mo),ho=new Dt(oo),fo.addPass(ho),fo.addPass(new Gt),uo===`high`&&fo.addPass(new Yt)}vo(),J=3}function vo(){M.setSize(innerWidth,innerHeight,!1),fo&&(fo.setPixelRatio(M.getPixelRatio()),fo.setSize(innerWidth,innerHeight))}function yo(){fo?fo.render():M.render(N,P)}var bo=!1,xo=0,So=0,Co=!1;function wo(e,t){e?(xo=0,bo||(bo=!0,po&&(po.enabled=!1),M.shadowMap.autoUpdate=!1),t>.024?++So>20&&!Co&&fo&&M.getPixelRatio()>1&&(Co=!0,fo.setPixelRatio(1)):So=Math.max(0,So-1)):bo&&(xo+=t)>.25&&(bo=!1,So=0,po&&(po.enabled=!0),M.shadowMap.autoUpdate=!0,M.shadowMap.needsUpdate=!0,Co&&(Co=!1,fo?.setPixelRatio(M.getPixelRatio())),J=3)}var To=[];function Eo(e,t){if(go||document.hidden||(To.push(Math.max(e,Math.min(t*1e3,200))),To.length<45))return;let n=To.sort((e,t)=>e-t)[22];To.length=0,n>40&&uo!==`low`&&(uo=so[so.indexOf(uo)-1],_o())}_o();function Do(){vo(),P.aspect=innerWidth/innerHeight,P.fov=innerWidth/innerHeight<.8?46:36,Oo(),P.updateProjectionMatrix(),H===`shelf`&&Vn&&X(Ma()),J=3}function Oo(){let e=H===`editor`?A(`editor`):null;if(!e){P.clearViewOffset();return}let t=e.getBoundingClientRect(),n=innerWidth,r=innerHeight;innerWidth>=900?P.setViewOffset(n,r,t.width/2,0,n,r):P.setViewOffset(n,r,0,t.height/2,n,r),P.updateProjectionMatrix()}addEventListener(`resize`,Do);function ko(){A(`menu`).classList.add(`hidden`),A(`imore`).classList.add(`hidden`)}A(`langBtn`).onclick=()=>{Nn=Nn===`en`?`zh`:`en`;try{localStorage.setItem(`game-catalog-lang`,Nn)}catch{}Fn()},A(`menuBtn`).onclick=e=>{e.stopPropagation(),A(`menu`).classList.toggle(`hidden`)},A(`iMore`).onclick=e=>{e.stopPropagation(),A(`imore`).classList.toggle(`hidden`)};function Ao(e){Ci=e,localStorage.setItem(`showcase-view`,e);for(let t of A(`viewSeg`).children)t.setAttribute(`aria-pressed`,String(t.dataset.v===e));ea(!0).then(()=>{H===`shelf`&&X(Ma())})}A(`viewSeg`).onclick=e=>{let t=e.target.dataset?.v;t&&t!==Ci&&H===`shelf`&&Ao(t)},A(`mExport`).onclick=async()=>{ko();let e=await ut(L.filter(e=>!e.sample)),t=document.createElement(`a`);t.href=URL.createObjectURL(e),t.download=`showcase-${new Date().toISOString().slice(0,10)}.json`,t.click(),In(j(`exported`))},A(`mImport`).onclick=()=>{ko(),A(`importFile`).click()},A(`importFile`).onchange=async e=>{let t=e.target.files[0];if(e.target.value=``,t)try{let e=await dt(t,L);L=await ot.all(),await ea(),X(Ma()),In(j(`imported`).replace(`%d`,e))}catch{In(j(`badFile`))}},A(`iOpen`).onclick=()=>{K||fa||(ya&&(Sa=!0),F.reset(),ua=+!ua,Va())},A(`iDisc`).onclick=()=>{K||q?Ba():za()},A(`iFlip`).onclick=()=>{ma=+!ma};function jo(){return!!(ua||W>.01||K||G>.01||fa)}function Mo(){F.reset(),jo()?(wa=!0,Sa=!0,(K||q)&&Ba(),ua=0):(Sa=!1,ya=0),Va(),J=3}A(`iSheet`).onclick=()=>{ya?Mo():jo()||(ya=1,Sa=!1,F.reset(),Va(),J=3)},A(`iReset`).onclick=()=>{F.reset(),J=3},A(`iBack`).onclick=()=>La(),A(`iDel`).onclick=async()=>{if(ko(),!confirm(j(`delQ`).replace(`%s`,U.title)))return;let e=U.id;await ot.del(e),Si.delete(e),z.visible=!1,B.disc.visible=!1,K=G=0,ua=W=0,fa=da=0,q=!1,L=L.filter(t=>t.id!==e),await No(),U=null,gi=0,ja(`shelf`),await ea(),X(Ma()),In(j(`deleted`))};async function No(){L.forEach((e,t)=>e.order=t),await ot.putMany(L)}async function Po(e){ko(),ji!==`custom`&&(ji=`custom`,A(`sort`).value=`custom`);let t=L.findIndex(e=>e.id===U.id),n=t+e;if(n<0||n>=L.length)return;[L[t],L[n]]=[L[n],L[t]],await No(),await ea(!0),R.get(U.id).userData.glide=null;let r=R.get(U.id);r.position.copy(V),r.quaternion.copy(ro)}A(`iLeft`).onclick=()=>Po(-1),A(`iRight`).onclick=()=>Po(1),A(`iEdit`).onclick=()=>{if(ko(),U.sample)return In(j(`sampleRO`));Go(U)},A(`makeBtn`).onclick=()=>Go(null),A(`emptyBtn`).onclick=()=>Go(null),addEventListener(`keydown`,e=>{H===`shelf`&&document.activeElement?.tagName!==`INPUT`&&(e.key===`ArrowRight`&&na(I+1),e.key===`ArrowLeft`&&na(I-1)),e.key===`Escape`&&(H===`editor`?is(!1):H===`inspect`&&(q?Ba():La()))});var Fo=null,Z=null,Io={},Lo=null,Q=null,Ro=0,zo=null,Bo=null,Vo=[`front`,`spine`,`back`,`inner`,`disc`],Ho=()=>Ye(Z?.platform);function Uo(){let e=Z.platform||`ps5`;for(let t of A(`platSeg`).children)t.setAttribute(`aria-pressed`,String(t.dataset.p===e));A(`keyWrap`).classList.toggle(`hidden`,e!==`ns2`),A(`fKey`).checked=!!Z.keyCard,A(`platNote`).textContent=j(`pn_`+e)}A(`platSeg`).onclick=e=>{let t=e.target.dataset?.p;t&&Z&&t!==Z.platform&&(Z.platUser=!0,Wo(t))};function Wo(e){Z.platform=e,e!==`ns2`&&(Z.keyCard=!1);for(let e of Vo)Z.slots[e]?.crop&&(Z.slots[e].crop={x:0,y:0,s:1});let t=B.disc.visible;aa(e),B.disc.visible=t,z.position.copy(V).sub(new O(0,oa()/2,0)),W=ua=da=fa=G=K=0,q=!1,B.pose(0,0),Uo(),qo(),Yo(),A(`crop`).classList.add(`hidden`)}A(`fKey`).onchange=()=>{Z.keyCard=A(`fKey`).checked,Jo()};function Go(e){if(ko(),Bo=H,zo=U,Fo=e||{id:null},Z=e?JSON.parse(JSON.stringify({...e,slots:Object.fromEntries(Object.entries(e.slots||{}).map(([e,t])=>[e,{crop:t.crop}]))})):{title:``,platform:`ps5`,band:!0,slots:{}},e)for(let t of Vo)e.slots?.[t]?.blob&&(Z.slots[t].blob=e.slots[t].blob);es=[],ts(null),yt(),Io={},Z.platform||=`ps5`,aa(Z.platform),Uo(),A(`fTitle`).value=Z.title||``,A(`fBand`).checked=Z.band!==!1,A(`eTitleH`).textContent=j(e?`eEdit`:`eNew`),A(`editor`).classList.remove(`hidden`),A(`crop`).classList.add(`hidden`),H===`inspect`?U&&(R.get(U.id).visible=!1):(B.disc.visible=!0,sa(),z.position.copy(V).sub(new O(0,oa()/2,0)),z.visible=!0,B.disc.visible=!0,W=ua=da=fa=G=K=0,q=!1,B.pose(0,0),gi=1),K&&(K=G=0,fa=da=0,q=!1),H=`editor`,document.body.className=`mode-editor`,A(`inspect`).classList.add(`hidden`),A(`empty`).classList.add(`hidden`),Promise.all(Vo.map(async e=>Io[e]=await Ke(Z.slots[e]?.blob))).then(()=>{qo(),Yo()}),Yo(),requestAnimationFrame(()=>{Oo(),X(Ko())})}function Ko(){sa();let e=innerWidth>=900?4.4:5.6;return{p:V.clone().add(new O(1.6,.5,e)),t:V.clone()}}function qo(){Z.title=A(`fTitle`).value.trim(),Z.band=A(`fBand`).checked,Lo=He(Z,Io),B.setArt(Lo),J=3}function Jo(){Ro||=setTimeout(()=>{Ro=0,qo(),Xo()},Mn?90:50)}function Yo(){let e=A(`slots`);e.innerHTML=``;for(let t of Vo){let n=!!Z.slots[t]?.blob,r=document.createElement(`button`);r.className=`slot`+(n?` up`:``),r.dataset.k=t,r.innerHTML=`<div class="th">${n||Lo?``:`＋`}</div><b>${Ho()[t].label[+(Nn===`en`)]}</b><i>${n?Z.slots[t].auto?j(`lkWeb`):j(`uploaded`):j(`auto`)}</i>`,r.onclick=()=>{n?cs(t):Zo(t)},e.appendChild(r)}Xo()}function Xo(){if(!Lo)return;let e={front:Lo.front,spine:Lo.spine,back:Lo.back,inner:Lo.innerCover,disc:Lo.disc};for(let t of A(`slots`).children){let n=e[t.dataset.k],r=t.querySelector(`.th`);if(!n)continue;let i=r.querySelector(`canvas`);i||(r.textContent=``,i=document.createElement(`canvas`),r.appendChild(i));let a=160/Math.max(n.width,n.height);i.width=Math.max(1,Math.round(n.width*a)),i.height=Math.max(1,Math.round(n.height*a)),i.getContext(`2d`).drawImage(n,0,0,i.width,i.height)}}function Zo(e){Q=e,A(`fileIn`).click()}A(`fileIn`).onchange=async e=>{let t=e.target.files[0];if(e.target.value=``,!t||!Q)return;In(j(`processing`));let n=await Ge(t,Q===`disc`?2048:2560);Z.slots[Q]={blob:n,crop:{x:0,y:0,s:1}},Io[Q]=await Ke(n),qo(),Yo(),cs(Q)};var Qo=0,$o=0,es=[];function ts(e){let t=A(`sugg`);if(t.classList.toggle(`hidden`,!e),e){if(e===`loading`&&!es.length){t.innerHTML=`<div class="sg-msg">${j(`lkSearching`)}</div>`;return}if(e===`none`){t.innerHTML=`<div class="sg-msg">${j(`lkNone`)}</div>`;return}t.innerHTML=`<div class="sg-msg">${j(`lkPick`)}${e===`loading`?` · `+j(`lkSearching`):``}</div>`,es.forEach((e,n)=>{let r=document.createElement(`button`);r.className=`sg`,r.dataset.i=n;let i={ps5:`PS5`,ns:`Switch`,ns2:`Switch 2`}[e.platform]||`—`,a=[e.src===`catalog`?j(`lkCat`):j(`lkWeb`),i,e.date?.slice(0,4),e.publisher].filter(Boolean).join(` · `);r.innerHTML=`<span class="sg-th">${e.cover?`<img alt="" loading="lazy" referrerpolicy="no-referrer">`:``}</span><span class="sg-t"><b></b><i></i></span>`,r.querySelector(`b`).textContent=e.title,r.querySelector(`i`).textContent=a;let o=r.querySelector(`img`);o&&(o.src=e.cover,o.onerror=()=>{o.onerror=null,o.src=`https://wsrv.nl/?url=${encodeURIComponent(e.cover.replace(/^https?:\/\//,``))}&w=120`}),r.onclick=()=>rs(e,!0),t.appendChild(r)})}}async function ns(e){let t=++Qo;if(e=e.trim(),mt(e).length<2){es=[],ts(null);return}ts(`loading`);let n=await St(e,6);if(t!==Qo)return;es=n,ts((n.length,`loading`));let r=(n[0]?.score||0)>=.92&&n.length>=3?[]:await Promise.race([wt(e,4).catch(()=>[]),new Promise(e=>setTimeout(()=>e([]),12e3))]);if(t!==Qo)return;let i=new Set(n.map(e=>mt(e.titles.en||e.title)));es=[...n,...r.filter(e=>!i.has(mt(e.titles.en||e.title)))].slice(0,8),ts(es.length?`done`:`none`)}async function rs(e,t){ts(null);let n=[];if((t||!A(`fTitle`).value.trim())&&(A(`fTitle`).value=e.title,n.push(`title`)),e.platform&&e.platform!==Z.platform&&(t||!Z.platUser)&&(Wo(e.platform),n.push(`platform`)),Z.lookup={src:e.src,titles:e.titles,wiki:e.wiki||null,cover:e.cover||null,date:e.date||null,publisher:e.publisher||null},e.cover&&!Z.slots.front?.blob){In(j(`processing`));let t=await Tt(e.cover);if(t){let r=await ze(t)||await Ge(t,2560),i=await Ke(r);i&&i.height/i.width>1.2&&/cdjapan/.test(e.cover||``),Z.slots.front={blob:r,crop:{x:0,y:0,s:1},auto:!0},Io.front=i,Z.bandUser||(Z.band=!1,A(`fBand`).checked=!1),n.push(`cover`)}else In(j(`lkFail`))}return qo(),Yo(),n.length&&In(j(`lkFilled`).replace(`%s`,n.join(` / `))),n}A(`fTitle`).addEventListener(`input`,()=>{clearTimeout($o),$o=setTimeout(()=>ns(A(`fTitle`).value),350)}),A(`fTitle`).addEventListener(`keydown`,e=>{e.key===`Enter`&&es[0]&&(e.preventDefault(),rs(es[0],!0))}),A(`fTitle`).oninput=Jo,A(`fBand`).onchange=()=>{Z.bandUser=!0,Jo()},A(`eCancel`).onclick=()=>is(!1),A(`eSave`).onclick=async()=>{if(Z.title=A(`fTitle`).value.trim(),Z.title&&!Z.slots.front?.blob&&!Z.lookup){let e=(await St(Z.title,1))[0];e&&e.score>=.85&&await rs(e,!1),Z.title=A(`fTitle`).value.trim()}Z.title||(Z.title=j(`untitled`)),Z.band=A(`fBand`).checked;let e=!Fo.id,t={id:Fo.id||st(),title:Z.title,platform:Z.platform||`ps5`,keyCard:Z.platform===`ns2`&&!!Z.keyCard,lookup:Z.lookup||null,bandUser:!!Z.bandUser,band:Z.band,slots:Z.slots,createdAt:Fo.createdAt||Date.now(),updatedAt:Date.now(),order:e?L.length:Fo.order};await ot.put(t),e?L.push(t):L[L.findIndex(e=>e.id===t.id)]=t,Si.set(t.id,Lo),e?Si.set(t.id,Lo):await ta(t),is(!0,t,e),In(j(`saved`))};async function is(e,t,n){if(A(`editor`).classList.add(`hidden`),Fo=null,H=`shelf`,Oo(),Bo===`inspect`&&zo&&!(e&&n)){U=e?t:zo,H=`inspect`,aa(U.platform),B.disc.visible=!0,z.position.copy(V).sub(new O(0,oa()/2,0));let n=await Oi(U);B.setArt(n),ja(`inspect`),X(Na());return}z.visible=!1,B.disc.visible=!1,zo&&R.get(zo.id)&&(R.get(zo.id).visible=!0),U=null,gi=0,ja(`shelf`),await ea(!0),X(Ma())}var as=null,os=null,ss=A(`cc`),$=ss.getContext(`2d`);function cs(e){if(Q=e,as=Io[e],!as)return Zo(e);os=Z.slots[e].crop||={x:0,y:0,s:1},A(`crop`).classList.remove(`hidden`),A(`cTitle`).textContent=Ho()[e].label[+(Nn===`en`)],A(`cZoom`).value=os.s,A(`cRemove`).disabled=!1,requestAnimationFrame(ls)}function ls(){if(!Q||!as)return;let e=Ho()[Q],t=Q===`spine`,n=A(`cwrap`).getBoundingClientRect(),r=t?e.h:e.w,i=t?e.w:e.h,a=Math.min((n.width-32)/r,(n.height-12)/i,1),o=Math.min(devicePixelRatio,2);ss.width=Math.round(r*a*o),ss.height=Math.round(i*a*o),ss.style.width=`${r*a}px`,ss.style.height=`${i*a}px`;let s=Re(e.w,e.h),c=s.getContext(`2d`);c.fillStyle=`#ccc`,c.fillRect(0,0,e.w,e.h),qe(c,as,e.w,e.h,os),$.save(),$.scale(ss.width/r,ss.height/i),t&&($.translate(0,e.w),$.rotate(-Math.PI/2)),$.drawImage(s,0,0);let l=2/a;if(e.circle){let t=e.w/2;$.fillStyle=`rgba(246,244,239,.86)`,$.beginPath(),$.rect(0,0,e.w,e.h),$.arc(t,t,t,0,Math.PI*2,!0),$.fill(),$.fillStyle=`rgba(246,244,239,.92)`,$.beginPath(),$.arc(t,t,t*.125,0,Math.PI*2),$.fill(),$.strokeStyle=`rgba(47,111,99,.9)`,$.lineWidth=l,$.setLineDash([10/a,8/a]),$.beginPath(),$.arc(t,t,t*.283,0,Math.PI*2),$.stroke(),$.beginPath(),$.arc(t,t,t-3,0,Math.PI*2),$.stroke(),$.setLineDash([]),$.fillStyle=`rgba(47,111,99,.95)`,$.font=`600 ${14/a}px sans-serif`,$.textAlign=`center`,$.fillText(j(`hub`),t,t+t*.34)}else if(e.rect){let t=e.w*.06;$.fillStyle=`rgba(246,244,239,.86)`,$.beginPath(),$.rect(0,0,e.w,e.h),$.roundRect(6,6,e.w-12,e.h-12,t),$.fill(`evenodd`),$.strokeStyle=`rgba(217,137,63,.95)`,$.lineWidth=l,$.setLineDash([12/a,9/a]),$.beginPath(),$.roundRect(6,6,e.w-12,e.h-12,t),$.stroke(),$.setLineDash([]),Z.keyCard&&($.fillStyle=`rgba(230,0,18,.8)`,$.beginPath(),$.arc(e.w-34,34,22,0,7),$.fill())}else if(Z.platform===`ns`||Z.platform===`ns2`){let t=Z.platform===`ns2`,n=t?128:176,r=`rgba(230,0,18,.55)`;e.band&&A(`fBand`).checked&&(t?($.fillStyle=r,$.fillRect(0,0,e.w,n),$.fillStyle=`#fff`,$.font=`600 ${Math.min(30,14/a)}px sans-serif`,$.fillText(Q===`spine`?`NS2`:j(`guideBand`),12,n/2+6)):Q===`front`&&($.fillStyle=r,$.fillRect(0,0,n,n),$.fillStyle=`#fff`,$.font=`600 ${Math.min(26,13/a)}px sans-serif`,$.fillText(`LOGO`,10,n/2+6)),t&&Q!==`spine`)&&($.fillStyle=r,$.fillRect(0,n,16,e.h-n),$.fillRect(e.w-16,n,16,e.h-n),$.fillRect(0,e.h-16,e.w,16),Q===`front`&&Z.keyCard&&($.fillStyle=`rgba(255,255,255,.8)`,$.fillRect(16,e.h-16-92,e.w-32,92))),$.strokeStyle=`rgba(217,137,63,.95)`,$.lineWidth=l,$.setLineDash([12/a,9/a]),$.strokeRect(18,18,e.w-36,e.h-36),$.setLineDash([])}else e.band&&A(`fBand`).checked&&($.fillStyle=`rgba(255,255,255,.82)`,$.fillRect(0,0,e.w,118),$.fillStyle=`rgba(47,111,99,.95)`,$.font=`600 ${Math.min(30,14/a)}px sans-serif`,$.fillText(Q===`spine`?`PS5`:j(`guideBand`),12,65)),$.strokeStyle=`rgba(217,137,63,.95)`,$.lineWidth=l,$.setLineDash([12/a,9/a]),$.strokeRect(18,18,e.w-36,e.h-36),$.setLineDash([]);$.restore()}var us=new Map,ds=null;ss.addEventListener(`pointerdown`,e=>{if(ss.setPointerCapture(e.pointerId),us.set(e.pointerId,[e.clientX,e.clientY]),us.size===2){let[e,t]=[...us.values()];ds={d:Math.hypot(e[0]-t[0],e[1]-t[1]),s:os.s}}}),ss.addEventListener(`pointermove`,e=>{if(!us.has(e.pointerId))return;let t=us.get(e.pointerId);if(us.set(e.pointerId,[e.clientX,e.clientY]),us.size===2&&ds){let[e,t]=[...us.values()];ps(ds.s*Math.hypot(e[0]-t[0],e[1]-t[1])/ds.d);return}let n=ss.getBoundingClientRect(),r=(e.clientX-t[0])/n.width,i=(e.clientY-t[1])/n.height;Q===`spine`&&([r,i]=[-i,r]),os.x=D.clamp(os.x+r*2,-2,2),os.y=D.clamp(os.y+i*2,-2,2),ls(),Jo()});var fs=e=>{us.delete(e.pointerId),us.size<2&&(ds=null)};ss.addEventListener(`pointerup`,fs),ss.addEventListener(`pointercancel`,fs),ss.addEventListener(`wheel`,e=>{e.preventDefault(),ps(os.s*Math.exp(-e.deltaY*.0015))},{passive:!1});function ps(e){os.s=D.clamp(e,1,4),A(`cZoom`).value=os.s,ls(),Jo()}A(`cZoom`).oninput=e=>ps(+e.target.value),A(`cReset`).onclick=()=>{Object.assign(os,{x:0,y:0,s:1}),A(`cZoom`).value=1,ls(),Jo()},A(`cReplace`).onclick=()=>Zo(Q),A(`cRemove`).onclick=()=>{delete Z.slots[Q],Io[Q]=null,A(`crop`).classList.add(`hidden`),qo(),Yo()},A(`cDone`).onclick=()=>{A(`crop`).classList.add(`hidden`),qo(),Yo()},addEventListener(`resize`,()=>{A(`crop`).classList.contains(`hidden`)||ls()}),A(`pgPrev`).onclick=()=>na(I-1),A(`pgNext`).onclick=()=>na(I+1),A(`pgJump`).onchange=e=>na(+e.target.value);var ms=0;A(`q`).oninput=()=>{clearTimeout(ms),ms=setTimeout(()=>{ki=A(`q`).value,I=0,ea(!0).then(()=>na(0))},250)},A(`pf`).onclick=e=>{let t=e.target.dataset?.p;if(t){Ai=t;for(let e of A(`pf`).children)e.setAttribute(`aria-pressed`,String(e.dataset.p===t));I=0,ea(!0).then(()=>na(0))}},A(`sort`).value=ji,A(`sort`).onchange=e=>{ji=e.target.value,localStorage.setItem(`showcase-sort`,ji),ea(!0)};async function hs(){Fn();for(let e of A(`viewSeg`).children)e.setAttribute(`aria-pressed`,String(e.dataset.v===Ci));try{L=await ot.all();let e=L.filter(e=>e.slots?.front?.auto&&!e.bandUser&&e.band!==!1);if(e.length&&(e.forEach(e=>e.band=!1),await ot.putMany(e)),!localStorage.getItem(`showcase-seeded`)){let e={id:`sample-re4`,sample:!0,title:`Resident Evil 4 Gold Edition`,platform:`ps5`,order:0,createdAt:Date.now(),slots:{}};await ot.put(e),L=await ot.all(),localStorage.setItem(`showcase-seeded`,`1`)}}catch(e){console.warn(`IndexedDB unavailable`,e)}await _s,await ea(!1);let e=Ma();P.position.copy(e.p).add(new O(.8,.6,2.2)),Bn.target.copy(e.t),X(e),Bn.minDistance=1.2,Bn.maxDistance=22,Do(),J=5,setTimeout(()=>A(`loading`).classList.add(`fade`),250),ja(`shelf`),window.__sc={vis:()=>{let e=U&&R.get(U.id),t=0;for(let e of R.values())e.visible&&t++;return{holder:z.visible&&B.root.visible,disc:B.disc.visible,selProxy:e?e.visible:null,shelf:t,mode:H,mem:{...M.info.memory},kids:B.root.children.length,sheetKids:B.sheetG.children.length,sheetParent:B.sheetG.parent===B.root,dock:Sa,open:+W.toFixed(2),out:+G.toFixed(2),discFocus:q}},back:()=>La(),click:e=>A(e).click(),cam:()=>P.position.toArray().map(e=>+e.toFixed(4)),sheet:e=>(e!=null&&A(`iSheet`).click(),+Y.toFixed(2)),rot:(e,t)=>(e!=null&&(F.set(e,t||0),J=3),{yaw:+F.yaw.toFixed(2),pitch:+F.pitch.toFixed(2),obj:ba,zoom:+F.zoom.toFixed(2)}),tier:e=>(e&&(uo=e,go=!0,_o()),uo+` `+co),bulk:async e=>{let t=[`ps5`,`ns`,`ns2`];for(let n=0;n<e;n++)L.push({id:`bulk`+n,title:`Test Game ${String(n+1).padStart(3,`0`)}`,platform:t[n%3],order:L.length,createdAt:Date.now()-n*1e6,slots:{}});return await ea(!1),X(Ma()),gr},page:()=>[I,gr],goPage:e=>na(e),fps:()=>M.info.render.calls,entries:()=>L.map(e=>e.title),info:()=>L.map(e=>({t:e.title,p:e.platform,front:!!e.slots?.front?.blob,auto:!!e.slots?.front?.auto,band:e.band,src:e.lookup?.src})),sugg:()=>es.map(e=>e.src+`:`+e.title+`:`+e.platform),plats:()=>L.map(e=>e.platform),kind:()=>B.kind,glb:()=>B.glbParts,door:e=>{gi=e,J=3},editor:()=>Z,mode:()=>H,state:()=>({open:+W.toFixed(2),out:+G.toFixed(2),discFocus:q}),select:e=>Fa(L[e].id),screen:e=>{let t=R.get(L[e].id).position.clone().project(P);return[(t.x+1)/2*innerWidth,(1-t.y)/2*innerHeight]}},k.has(`inspect`)&&setTimeout(()=>Fa(L[Math.min(+k.get(`inspect`)||0,L.length-1)].id),300)}var gs=(e,t)=>Promise.race([e,new Promise((e,n)=>setTimeout(()=>n(Error(`timeout`)),t))]),_s=k.has(`procedural`)?Promise.resolve():Promise.allSettled([gs(An({renderer:M,base:jn,mobile:Mn,lmGain:+(k.get(`lm`)||1),mats:{doorGlass:Ir,streakMat:Ar,glassMat:Pr,glassEdge:Fr,glassLine:zr,doorEdge:Rr,brass:Br}}),2e4).then(e=>{Jr=e,ni(),gr&&Qr(gr,!0),console.info(`[showcase] baked cabinet ready`)}).catch(e=>console.warn(`[showcase] baked cabinet failed, using procedural`,e)),gs(ge(jn),2e4).then(()=>{for(let e of Object.keys(ia))ia[e].dispose(),delete ia[e];aa(U?.platform||`ps5`)}).catch(e=>console.warn(`[showcase] case GLB failed, using procedural case`,e))]),vs=null,ys=0;function bs(){clearTimeout(ys),ys=setTimeout(xs,400)}function xs(){if(!Jr||Mn||uo===`low`||k.has(`noprobe`))return;let e=or*rr;vs||(vs=new xn(tr,e,nr,6,6,3),N.add(vs)),vs.position.set(I*cr,3.72,-.05);let t=[];for(let e of[...R.values(),z,B.disc])e.visible&&(e.visible=!1,t.push(e));let n=performance.now();vs.bake(M,N,{cubemapSize:16,near:.02,far:40}),t.forEach(e=>e.visible=!0),console.info(`[showcase] probe grid baked`,Math.round(performance.now()-n),`ms`),J=3}hs().then(bs);