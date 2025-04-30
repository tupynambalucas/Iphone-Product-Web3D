import * as THREE from 'three';
import TWEEN from 'tween';
import { GLTFLoader } from 'GLTFLoader'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
var textureLoader = new THREE.TextureLoader();
let gltfLoader = new GLTFLoader()
var clock = new THREE.Clock()

let camera,scene,renderer,delta,object,a18,directionalLight,tweenRotation,screen

let iphoneColorMeshes = new Array
let iphoneColors = {
    pink:'#EE94CA',
    ultraMarine:'#6467E6',
    grayedGreen:'#85ADAC',
    white:'#E7E7E7',
    black:'#0f0f0f'
}

function init() {
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set(0,0,-20)
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene = new THREE.Scene();
    scene.background = null;
    scene.add(camera)

    scene.fog = new THREE.Fog( 0xffffff, 0, 10000 );

    // const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.4 );
    // light.position.set( 0.5, 1, 0.75 );
    // scene.add( light );

    var rendererDiv = document.getElementById('rendererDiv')
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true, powerPreference: "high-performance" } );
    renderer.setPixelRatio( 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.3
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    rendererDiv.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );

    gltfLoader.load(
        // resource URL
        'three/models/iphone/scene.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            object = gltf.scene; // THREE.Group
            object.position.set(14,0,30)
            object.scale.set(1,1,1)
            // object.rotateY( Math.PI / -2 );
            // object.rotateZ( Math.PI / -2 );
            directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
            directionalLight.position.set(-40,10,-10)
            scene.add( directionalLight )
            scene.add( directionalLight.target );
            directionalLight.target = object
            let directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
            directionalLight2.position.set(30,0,-10)
            scene.add( directionalLight2 )
            scene.add( directionalLight2.target );
            directionalLight2.target = object
            let HSLColor = hexToHSL(color)
            object.traverse(o => {
                o.receiveShadow = true
                if (o.isMesh) {
                    if (o.name == 'Object_67'||o.name =='Object_62' ||o.name =='Object_54'||o.name =='Object_52'||o.name =='Object_64'||o.name =='Object_46'||o.name =='Object_29'||o.name =='Object_33'||o.name =='Object_72'||o.name =='Object_86') {
                        iphoneColorMeshes.push(o)
                        
                    }
                    if (o.name=='Object_18') {
                        screen = o
                        loadScreen(screen,'video', 'video/fortnite.mp4')
                    }
                }
            })
            changeColor(iphoneColorMeshes,iphoneColors.pink)
            // rotate(object,{x: 0,y:200,z:90});
            gltfLoader.load(
                // resource URL
                'three/models/a18/scene.gltf',
                // called when the resource is loaded
                function ( gltf ) {
                    a18 = gltf.scene; // THREE.Group
                    a18.position.set(-3,6,20)
                    a18.scale.set(1,1,1)
                    // a18.rotateY( Math.PI / -2.5 );

                    a18.traverse(o => {
                        o.receiveShadow = true
                    });
                    // scene.add( a18 );
                    addEventListener('mousemove', (event) => {
                        event.preventDefault();
                        let mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                        let mouseY = (event.clientY / window.innerHeight) * 2 - 1;
                        a18.rotation.y = THREE.MathUtils.lerp(a18.rotation.x, (mouseX * Math.PI) / -40, 1)
                        a18.rotation.x = THREE.MathUtils.lerp(a18.rotation.y, (mouseY * Math.PI) / -40, 1)
                    }) 

            })
            scene.add( object );
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
    // object.rotation.y -= 0.007
    if(TWEEN) TWEEN.update()
    renderer.render( scene, camera )
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

addEventListener("wheel", specsScroll)
let rendererDivBackground = document.getElementById('rendererDivBackground')
let specs = [
    'spec1',
    'spec2',
    'cam'
]
let down = true
let i = 0
function specsScroll(e) {
    const scrollDirection = e.deltaY < 0 ? 1 : 0
    // console.log(scrollDirection === 1 ? "up" : "down")
    if(scrollDirection===0){
        i += 1
        if (i>2) {
            i=2
        } else {
            let scrollDiv = document.getElementById(specs[i]).offsetTop;
            console.log(specs[i])
            window.scrollTo({ top: scrollDiv, behavior: 'smooth'})
        }
    } else {
        i -= 1
        if (i<0) {
            i=0
        } else {
            let scrollDiv = document.getElementById(specs[i]).offsetTop;
            console.log(specs[i])
            window.scrollTo({ top: scrollDiv, behavior: 'smooth'})
        }
    }
    console.log(i)
    if (specs[i]=='spec1') {
        rendererDivBackground.style.background = '#0f0f0f'
        rotate(object,{x: 0,y:200,z:90});
        move(object,{x:14,y:0,z:30})
        loadScreen(screen,'video', 'video/fortnite.mp4')
        changeColor(iphoneColorMeshes,iphoneColors.pink)
        move(directionalLight,{x:-40,y:10,z:-10})
    }
    if (specs[i]=='spec2') {
        rendererDivBackground.style.background = 'black'
        rotate(object,{x: 0,y:220,z:0});
        move(object,{x:14,y:0,z:30})
        loadScreen(screen,'image', 'img/iphone-charged.png')
        changeColor(iphoneColorMeshes,iphoneColors.grayedGreen)
        move(directionalLight,{x:-40,y:10,z:-10})
        
    }
    if (specs[i]=='cam') {
        rotate(object,{x:0,y:0,z:90});
        changeColor(iphoneColorMeshes,iphoneColors.pink)
        move(object, {x:4,y:-5.5,z:-2})
        move(directionalLight,{x:0,y:0,z:-20})
    }
}

function loadScreen(o,type,src) {
    if (type=='video') {
        let video = document.getElementById( 'fortniteVideo' );
        video.src = `../${src}`
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
        let source = `../${src}`
        let texture = textureLoader.load(source);
        texture.rotation = -0.03;
        texture.center = new THREE.Vector2(0.5, 0.5);
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        // texture.flipY = false;
        texture.repeat.set( 1, 1 );
        let material = new THREE.MeshPhongMaterial( { map: texture } );
        o.material = material
    }
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
function move(o, cords ) {
    // axis is a THREE.Vector3
    let position = new THREE.Vector3(cords.x,cords.y,cords.z)
      // we need to use radians
    let tweenPosition = new TWEEN.Tween(o.position)
     .to(position)
     .delay(0)
     .duration(1500)
     .easing(TWEEN.Easing.Cubic.InOut) 
    tweenPosition.start()
}
function changeColor(array,color) {
    let HSLColor = hexToHSL(color)
    array.forEach((o) =>{
        if (color==iphoneColors.black) {
            directionalLight.intensity = 5
        } else {
            directionalLight.intensity = 0.7
        }
        console.log(o.material.color)
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

function hexToHSL(hex) {
    const color = new THREE.Color(hex);
    const hsl = {};
    color.getHSL(hsl);
    return hsl;
}