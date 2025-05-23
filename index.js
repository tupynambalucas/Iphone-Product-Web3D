import * as THREE from 'three';
import TWEEN from 'tween';
import { GLTFLoader } from 'GLTFLoader'
import glowVertexShader from './three/shaders/glowVertexShader.js'
import glowFragmentShader from './three/shaders/glowFragmentShader.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
var rendererDiv = document.getElementById('rendererDiv')
var textureLoader = new THREE.TextureLoader();
let gltfLoader = new GLTFLoader()
var clock = new THREE.Clock()
let passiveRotation = false
let camera,scene,renderer,delta,iphone,a18,iphoneGlow,directionalLight,tweenRotation,screen,pointLightSpherePivot


let glowShaderMaterial
let objects = [
    {   
        name: 'a18',
        object: undefined,
        position: new THREE.Vector3(-20.4,5.1,20)
    },
    {
        name: 'iphone',
        object: undefined,
        position: new THREE.Vector3(14,0,30),
        colors : {
            pink:'#EE94CA',
            ultraMarine:'#6467E6',
            grayedGreen:'#85ADAC',
            white:'#E7E7E7',
            black:'#0f0f0f'
        },
        colorMeshes: new Array
    }
]

function resize3DWorld() {
    console.log(navigator.userAgent)
    console.log(`Browser default  -  width: ${window.innerWidth} height: ${window.innerHeight}`)
    console.log(`Browser size change  -  width: ${window.screen.height - window.innerHeight} height: ${window.screen.width - window.innerWidth}`)
    let windowScreen = {
        enabled: false,
        height: window.screen.height - window.innerHeight,
        width: window.screen.width - window.innerWidth
    }
    if (windowScreen.width > 0 || windowScreen.height > 0) {
        windowScreen.enabled = true
        console.log(windowScreen.enabled)
    } else {
        windowScreen.enabled = false
        console.log(windowScreen.enabled)
    }
    if (window.screen.width <= 3840 && window.screen.height <= 2160) {
        objects.forEach((o) => {
            if (o.name=='a18') {
                o.position = new THREE.Vector3(-2.2,5.8,20)            
            }

        })
    }
    if (window.screen.width <= 1920 && window.screen.height <= 1080) {
        objects.forEach((o) => {
            if (o.name=='a18') {
                if (windowScreen.enabled) {
                    o.position = new THREE.Vector3(-2.4,5.1,20) 
                } else {
                    o.position = new THREE.Vector3(-2.1,5.8,20)
                }     
            }
        })
    }
    if (window.screen.width <= 1280 && window.screen.height <= 720) {
        objects.forEach((o) => {
            if (o.name=='a18') {
                if (windowScreen.enabled) {
                    o.position = new THREE.Vector3(-2.4,4.8,20)    
                } else {
                    o.position = new THREE.Vector3(-1.95,5.8,20)    
                }     
            }
        })
    }
    objects.forEach((o) => {
        move(o.object, o.position, 200)
    })
}

function init() {
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set(0,0,-20)
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene = new THREE.Scene();
    scene.background = null;
    scene.add(camera)

    scene.fog = new THREE.Fog( 0xEE94CA, 0, 10000 );

    glowShaderMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 1 },
			"p":   { type: "f", value: 4 },
			glowColor: { type: "c", value: new THREE.Color(0xEE94CA) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader: glowVertexShader,
		fragmentShader: glowFragmentShader,
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true,
});
    // PointLight Rotation

    pointLightSpherePivot = new THREE.Object3D()
    let pointLight = new THREE.PointLight( 0xEE94CA, 1.5, 100, 0 );
    pointLightSpherePivot.position.set(-2.4,5.2,20)
    pointLight.position.set(8,-8,0);
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
    scene.add( pointLightHelper );
    pointLightSpherePivot.add( pointLight );
    scene.add(pointLightSpherePivot);
    // const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.4 );
    // light.position.set( 0.5, 1, 0.75 );
    // scene.add( light );
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true, powerPreference: "high-performance" } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 2
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    rendererDiv.appendChild( renderer.domElement );

    window.addEventListener( 'resize', resizeRendererToDisplaySize );

    gltfLoader.load(
        // resource URL
        'three/models/iphone/scene.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            iphone = gltf.scene; // THREE.Group
            let objectFind = objects.find((element) => element.name=='iphone');
            objectFind.object = iphone
            iphone.position.copy(objectFind.position)
            iphone.scale.set(1,1,1)
            // iphone.rotateY( Math.PI / -2 );
            // iphone.rotateZ( Math.PI / -2 );
            directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
            directionalLight.position.set(-40,10,-10)
            scene.add( directionalLight )
            scene.add( directionalLight.target );
            directionalLight.target = iphone
            let directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.8 );
            directionalLight2.position.set(-2.4,0,-50)
            scene.add( directionalLight2 )
            scene.add( directionalLight2.target );
            iphone.traverse(o => {
                o.receiveShadow = true
                if (o.isMesh) {
                    if (o.name == 'Object_67'||o.name =='Object_62' ||o.name =='Object_54'||o.name =='Object_52'||o.name =='Object_64'||o.name =='Object_46'||o.name =='Object_29'||o.name =='Object_33'||o.name =='Object_72'||o.name =='Object_86') {
                        objects[1].colorMeshes.push(o)
                    }
                    if (o.name=='Object_18') {
                        screen = o
                        o.material.transparent = true;
                        textureCrossfade(screen,1000,'video', 'video/fortnite.mp4')
                    }
                    if (o.name == 'Object_54') {
                        let geometry = new THREE.SphereGeometry( 2,32,32); 
                        iphoneGlow = new THREE.Mesh( geometry,glowShaderMaterial);
                        iphoneGlow.position.set(-3,6.5,20)
                        // scene.add( iphoneGlow );
                        iphoneGlow.rotation.y = 0
                    }
                }
            })
            changeColor(objects[1].colorMeshes,objects[1].colors.pink)
            rotate(iphone,{x: 0,y:200,z:90});
            gltfLoader.load(
                // resource URL
                'three/models/a18/scene.gltf',
                // called when the resource is loaded
                function ( gltf ) {
                    a18 = gltf.scene;
                    let objectFind = objects.find((element) => element.name=='a18');
                    objectFind.object = a18
                    a18.position.copy(objectFind.position)
                    a18.scale.set(1.9,1.9,1.9)
                    directionalLight2.target = a18
                    a18.traverse(o => {
                        o.receiveShadow = true
                    });
                    scene.add( a18 );
                    addEventListener('mousemove', (event) => {
                        event.preventDefault();
                        let mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                        let mouseY = (event.clientY / window.innerHeight) * 2 - 1;
                        a18.rotation.y = THREE.MathUtils.lerp(a18.rotation.x, (mouseX * Math.PI) / -40, 1)
                        a18.rotation.x = THREE.MathUtils.lerp(a18.rotation.y, (mouseY * Math.PI) / -40, 1)
                        iphoneGlow.rotation.y = THREE.MathUtils.lerp(a18.rotation.x, (mouseX * Math.PI) / -40, 1)
                        iphoneGlow.rotation.x = THREE.MathUtils.lerp(a18.rotation.y, (mouseY * Math.PI) / -40, 1)
                    }) 
                    resize3DWorld()

            })
            scene.add( iphone );
            animate()
        },
        
        // called while loading is progressing
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log(error);
    
        }
    )
}

init()
function animate() {
    delta = clock.getDelta()
    requestAnimationFrame( animate );
    if (passiveRotation) {
        iphone.rotation.y -= 0.007   
    }
    pointLightSpherePivot.rotateY(0.007)
    pointLightSpherePivot.rotateX(0.007)
    if(TWEEN) TWEEN.update()
    renderer.render( scene, camera )
}

function resizeRendererToDisplaySize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resize3DWorld()
}

addEventListener("wheel", specsScroll)
addEventListener("keydown", specsScroll)
let rendererDivBackground = document.getElementById('rendererDivBackground')
let specs = [
    'specHeader1',
    'specHeader2',
    'camHeader1',
    'camHeader2',
    'camHeader3',
    'camHeader4',
]
let i = 0
let shouldRun = true
let prevState
function specsScroll(e) {
    let scrollDirection
    if (e instanceof KeyboardEvent) {
        if (e.key=='ArrowDown') {
            scrollDirection = 0
        }
        if (e.key=='ArrowUp') {
            scrollDirection = 1
        }
    } else {
        scrollDirection = e.deltaY < 0 ? 1 : 0
    }
    if(scrollDirection===0){
        // Down
        console.log('down')
        i += 1
        if (i>=6) {
            shouldRun = false
            i=3
            console.log('desativado')
        } else {
            shouldRun = true
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            let scrollDiv = document.getElementById(specs[i])
            let rectViewport = scrollDiv.getBoundingClientRect();
            let top = rectViewport.top + scrollTop;
            console.log(scrollDiv)
            setTimeout(function () {
                window.scrollTo({ top: top, behavior: 'smooth'})
            },100);
        }
        console.log(i)
    } else {
        // Up
        i -= 1

        console.log('up')
        if (i<0) {
            shouldRun = false
            i=0
        } else {
            shouldRun = true
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            let scrollDiv = document.getElementById(specs[i])
            let rectViewport = scrollDiv.getBoundingClientRect();
            let top = rectViewport.top + scrollTop;
            setTimeout(function () {
                window.scrollTo({ top: top, behavior: 'smooth'})
            },100);
        }
    }
    if (shouldRun) {
        if (specs[i]=='specHeader1') {
            rendererDivBackground.style.background = '#F5F5F7'
            passiveRotation = false
            move(a18, getPosition('a18', new THREE.Vector3(0,0,0)),1000)
            rotate(iphone,{x: 0,y:200,z:90});
            move(iphone,{x:14,y:0,z:30}, 1500)
            move(pointLightSpherePivot,{x:-2.4,y:5.2,z:20},1500)
            move(iphoneGlow,{x:-1.6,y:6,z:20}, 750)
            textureCrossfade(screen,1000,'video', 'video/fortnite.mp4')
            changeColor(objects[1].colorMeshes,objects[1].colors.pink)
            move(directionalLight,{x:-40,y:10,z:-10}, 1500)
            setTimeout(() => {
                    rendererDiv.style.zIndex = '100'
            }, "500");
        }
        if (specs[i]=='specHeader2') {
            rendererDivBackground.style.background = 'black'
            rotate(iphone,{x: 0,y:0,z:0});
            move(iphone,{x:14.5,y:0,z:30},1500)
            move(pointLightSpherePivot,{x:14.5,y:0,z:30},1500)
            move(a18, getPosition('a18', new THREE.Vector3(0,20,0)),200)
            move(iphoneGlow,{x:-1.6,y:20,z:20},200)
            passiveRotation = false
            textureCrossfade(screen,1000,'image', 'img/screenshots/iphone-charged.png')
            changeColor(objects[1].colorMeshes,objects[1].colors.ultraMarine)
            move(directionalLight,{x:-40,y:10,z:-50},1500)
            if (prevState=='camHeader1') {
                setTimeout(() => {
                    rendererDiv.style.zIndex = '5'
                }, "500");
            } else {
                setTimeout(() => {
                    rendererDiv.style.zIndex = '5'
                }, "500");
            }
        }
        if (specs[i]=='camHeader1') {
            rendererDiv.style.zIndex = '100'
            passiveRotation = false
            rendererDivBackground.style.background = 'snow'
            move(iphone, {x:4,y:-5.5,z:-2}, 1500)
            move(pointLightSpherePivot,{x:4,y:-5.5,z:-2},1500)
            move(directionalLight,{x:0,y:0,z:-20},1500)
            setTimeout(() => {
                rotate(iphone,{x:0,y:0,z:90});
                changeColor(objects[1].colorMeshes,objects[1].colors.pink)
            }, "500");
        } 
        if (specs[i]=='camHeader2') {
            rendererDiv.style.zIndex = '100'
            passiveRotation = false
            move(iphone,{x:-8,y:-1,z:15},1500)
            move(pointLightSpherePivot,{x:-8,y:0,z:25},1500)
            textureCrossfade(screen,500,'image', 'img/screenshots/cam-screenshot-1.png')
            move(directionalLight,{x:-40,y:10,z:-10},1500)
            rotate(iphone,{x: 0,y:175,z:0});
        }    
        if (specs[i]=='camHeader3') {
            rendererDiv.style.zIndex = '100'
            passiveRotation = false
            move(pointLightSpherePivot,{x:-8,y:0,z:25},1500)
            textureCrossfade(screen,500,'image', 'img/screenshots/cam-screenshot-2.png')
            move(directionalLight,{x:-40,y:10,z:-10},1500)
        }
        
        if (specs[i]=='camHeader4') {
            rendererDiv.style.zIndex = '100'
            passiveRotation = false
            move(pointLightSpherePivot,{x:-8,y:0,z:25},1500)
            textureCrossfade(screen,500,'image', 'img/screenshots/cam-screenshot-3.png')
            move(directionalLight,{x:-40,y:10,z:-10},1500)
        }    
    }
    
    // console.log(scrollDirection)
    prevState = specs[i]
    console.log(prevState)
}

function rotate(o, deg ) {
    // axis is a THREE.Vector3
    let rotation = new THREE.Vector3(THREE.MathUtils.degToRad( deg.x ),THREE.MathUtils.degToRad( deg.y ),THREE.MathUtils.degToRad( deg.z ))
      // we need to use radians
    tweenRotation = new TWEEN.Tween(o.rotation)
     .to(rotation)
     .delay(0)
     .duration(1500)
     .easing(TWEEN.Easing.Cubic.InOut) 
    tweenRotation.start()
}
function move(o, cords, duration ) {
    // console.log(cords)
    // axis is a THREE.Vector3
    let position = cords
      // we need to use radians
    let tweenPosition = new TWEEN.Tween(o.position)
     .to(position)
     .delay(0)
     .duration(duration)
     .easing(TWEEN.Easing.Cubic.InOut) 
    tweenPosition.start()
}
function changeColor(array,color) {
    let HSLColor = hexToHSL(color)
    array.forEach((o) =>{
        if (color==objects[1].colors.black) {
            directionalLight.intensity = 5
        } else {
            directionalLight.intensity = 0.7
        }
        const hsl = {};
        o.material.color.getHSL(hsl);
        let colorTween = new TWEEN.Tween(hsl)
        .to({
            h: HSLColor.h,
            s: HSLColor.s,
            l: HSLColor.l
        }, 1000)// Change to red over 1 second
        .onUpdate(() => {
            o.material.color.setHSL(hsl.h, hsl.s, hsl.l);
        })
        colorTween.start()
    })
}
function textureCrossfade(o,duration,type,src) {
    let tweenTextureOpacity = new TWEEN.Tween(o.material)
        .to({opacity:0})
        .delay(0)
        .duration(duration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
        })
        .onComplete(() => {
            if (type=='video') {
                let video = document.getElementById( 'fortniteVideo' );
                video.src = src
                video.currentTime = 0;
                let texture = new THREE.VideoTexture( video );
                // texture.flipY = true;
                texture.wrapT = THREE.RepeatWrapping;
                texture.wrapS = THREE.RepeatWrapping;
                texture.repeat.set( 1, 1 );
                let material = new THREE.MeshPhongMaterial( { map: texture } );
                o.material = material
                // video.autoplay = true
                video.muted= "muted"
                video.play()
                
            }
            if (type=='image') {
                let source = src
                let texture = textureLoader.load(source);
                // texture.rotation = Math.PI * .5;
                // texture.center.set( 0.5, 0.5 );
                texture.wrapT = THREE.RepeatWrapping;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                texture.repeat.set( 1, 1 );
                let material = new THREE.MeshPhongMaterial({ 
                    map: texture,
                    shininess: 100,
                    reflectivity: 1,
                    specular: 0x000000,
                    fog: false,
                    emissive: 0x0f0f0f
                });
                o.material = material
            }
            o.material.opacity = 0
            o.material.transparent = true;
            o.material.needsUpdate = true; 
            let tweenTextureOpacity2 = new TWEEN.Tween(o.material)
            .to({opacity:1})
            .delay(0)
            .duration(duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onStart(() =>{
                o.material.transparent = true;
                o.material.needsUpdate = true; 
            })
            .onComplete(() => {
            }).onUpdate(() =>{
            })
            tweenTextureOpacity2.start()
    })
    tweenTextureOpacity.start()
}

let designBatery = [document.getElementById('iphoneBatery'),document.getElementById('iphoneDesign')]
designBatery.forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
        e.preventDefault()
        let id = e.target.id
        if (id=='iphoneDesign') {
            rotate(iphone,{x: 0,y:-10,z:0});
        } else {
            rotate(iphone,{x: 0,y:190,z:0});
        }
        changeColor(objects[1].colorMeshes,objects[1].colors.ultraMarine)
    })
})

function hexToHSL(hex) {
    const color = new THREE.Color(hex);
    const hsl = {};
    color.getHSL(hsl);
    return hsl;
}

function getPosition(objectName,translation) {
    let objectFind = objects.find((o) => o.name==objectName);
    let result = translation.addVectors(objectFind.position, translation)
    console.log(result)
    return result
}