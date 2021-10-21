import * as THREE from "/public/build/three.module.js";
import { OrbitControls } from "/public/jsm/controls/OrbitControls.js";
import { gsap } from "/public/build/gsap-core.js"

// Definir donde se pondra el lienzo
const canvas = document.querySelector('.web-gl-container')

// Crear la escena
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x333333)

// Constantes del tamaño de la pantalla
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Definir funcion utilitaria pasar valores de grados a radianes para rotar
const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

// Definir funcion utilitaria para generar numeros aleatorios a partir de un intervalo
const random = (min, max, float = false) => {
  const value = Math.random() * (max - min) + min

  if (float) {
    return value
  }

  return Math.floor(value)
}

// Crear la camara
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
)

// Modificar posicion del eje z para la camara
camera.position.z = 5;

// Agregar la camara a la escena
scene.add(camera);

// Crear el objeto renderer indicar el lienzo donde va a renderizar, si se va a trabajar
// con antialiasing y con opacidad
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
})

// Metodo update de la escena, para reflejar los cambios del renderer
const render = () => {
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  controls.update()
  renderer.render(scene, camera)
}

// Renderizar la escena
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera)

// Interceptar evento resize para ajustar el lienzo al tamaño del navegador
window.addEventListener('resize', () => {
  // Actualizar Tamaños 
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Actualizar camara
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Actualizar objeto renderer
  render()
})

// Crear material con el color blanco
const material = new THREE.MeshLambertMaterial({ color: 0xffffff })

// Crear Luz direccional para visualizar la malla
const lightDirectional = new THREE.DirectionalLight(0xffffff, 1)
scene.add(lightDirectional)

// Posicionar la luz direccional para ver las caras del cubo
lightDirectional.position.set(5, 5, 5)

// Definir luz de ambiente para el entorno de la escena
const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.2)
scene.add(lightAmbient)


// Clase figura para agrupar geometrias en un solo objeto para controlarlo
class Figure {
  constructor(params) {
    this.params = {
      x: 0,
      y: 0,
      z: 0,
      // Parametro de rotacion en y
      ry: 0,
      ...params
    }

    // variable para la animacion de los brazos
    this.arms = []

    // Variables de color para el material del cuierpo y de la cabeza
    this.headHue = random(0, 360)
    this.bodyHue = random(0, 360)

    // Variables que representan los materiales usando HSL para controlar saturacion e iluminacion
    this.headMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.headHue}, 30%, 50%)` })
    this.bodyMaterial = new THREE.MeshLambertMaterial({ color: `hsl(${this.bodyHue}, 85%, 50%)` })

    // Definir un grupo de three.js para gestionar varias geometrias como un unico objeto
    this.group = new THREE.Group()
    scene.add(this.group)

    // Parametrizar el posicionamiento del grupo general
    this.group.position.x = this.params.x
    this.group.position.y = this.params.y
    this.group.position.z = this.params.z
    this.group.rotation.y = this.params.ry
  }

  // Metodo para crear el torso del cuerpo del personaje o figura
  createBody() {
    // Crear el grupo interno del cuerpo
    this.body = new THREE.Group()

    const geometry = new THREE.BoxGeometry(1, 1.5, 1)
    const bodyMain = new THREE.Mesh(geometry, this.bodyMaterial)
    this.body.add(bodyMain)

    // Agregar el grupo interno del cuerpo
    this.group.add(this.body)

    this.createLegs()
  }

  // Metodo para crear la cabeza del cuerpo del personaje o figura
  createHead() {
    // Crear el grupo interno de la cabeza
    this.head = new THREE.Group()

    // Crear el cubo que representa la cabeza y agregar al grupo interno
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4)
    const headMain = new THREE.Mesh(geometry, this.headMaterial)
    this.head.add(headMain)

    // Agregar el grupo interno de la cabeza
    this.group.add(this.head)

    // Posicionar la cabeza por encima del torso del cuerpo
    this.head.position.y = 1.65

    // Invocar al metodo para crear los ojos
    this.createEyes()
  }

  // Metodo para crear los brazos del personaje o figura
  createArms() {

    // variable de altura para el brazo
    const height = 1
    const geometry = new THREE.BoxGeometry(0.25, height, 0.25)
    for (let i = 0; i < 2; i++) {
      // Crear un nuevo grupo de three.js interno en la clase figura para cada brazo
      const armGroup = new THREE.Group()

      const arm = new THREE.Mesh(geometry, this.headMaterial)

      // Validar indice para posicionar el brazo al lado derecho o al lado izquierdo
      const m = i % 2 === 0 ? 1 : -1

      // Agregar el brazo al grupo interno 
      armGroup.add(arm)

      // Cargar los brazos al array para la animacion
      this.arms.push(armGroup)

      // Agregar el grupo interno al grupo general de la clase figura
      this.group.add(armGroup)

      // Traslacion del brazo (no del grupo interno) hacia abajo desde la mitad de la altura
      arm.position.y = height * -0.5

      armGroup.position.x = m * 0.6
      armGroup.position.y = 0.6

      armGroup.rotation.z = degreesToRadians(30 * m)
    }
  }

  // Metodo para crear los ojos en la cabeza del personaje o figura
  createEyes() {
    // Crear un nuevo grupo de three.js interno en la clase figura para los ojos
    const eyes = new THREE.Group()
    const geometry = new THREE.SphereGeometry(0.15, 12, 8)

    // Definir el material para los ojos
    const material = new THREE.MeshLambertMaterial({ color: 0x44445c })

    for (let i = 0; i < 2; i++) {
      const eye = new THREE.Mesh(geometry, material)

      // Validar indice para posicionar el brazo al lado derecho o al lado izquierdo
      const m = i % 2 === 0 ? 1 : -1

      // Agregar el ojo al grupo interno de los ojos
      eyes.add(eye)

      // Establecer posicion del ojo
      eye.position.x = 0.36 * m

      // Agregar al grupo interno de la cabeza el grupo interno de los ojos
      this.head.add(eyes)

      // Mover los ojos hacia adelante desde la parte interna de la cabeza
      eyes.position.z = 0.7
    }
  }

  createLegs() {
    // Crear un nuevo grupo de three.js interno en la clase figura para las piernas
    const legs = new THREE.Group()
    const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25)

    for (let i = 0; i < 2; i++) {
      const leg = new THREE.Mesh(geometry, this.headMaterial)

      // Validar indice para posicionar el brazo al lado derecho o al lado izquierdo
      const m = i % 2 === 0 ? 1 : -1

      // agregar al grupo interno de la cabeza
      legs.add(leg)
      leg.position.x = m * 0.22
    }

    this.group.add(legs)
    legs.position.y = -1.15

    this.body.add(legs)
  }

  // Metodo para establecer los valores de la animacion de salto
  bounce() {
    this.group.rotation.y = this.params.ry
    this.group.position.y = this.params.y

    // Animacion de mover los brazos de manera simetrica al salto
    this.arms.forEach((arm, index) => {
      const m = index % 2 === 0 ? 1 : -1
      arm.rotation.z = this.params.armRotation * m
    })
  }

  init() {
    this.createBody()
    this.createHead()
    this.createArms()
  }

}

const character = new Figure({
  y: -1,
  ry: degreesToRadians(17)
})
character.init()

// Funcion para parametrizar la animacion usando las librerias de greensock
gsap.to(character.params, {
  ry: degreesToRadians(360),
  repeat: -1,
  duration: 20
})

gsap.ticker.add(() => {
  // Actualizar el valor de la rotacion
  character.group.rotation.y = character.params.ry

  // invocar la animacion de salto
  character.bounce()

  // Renderizar la escena
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)
})

// Establecer la posicion inicial del personaje
gsap.set(character.params, {
  y: -1.5
})

// Generar la animacion de salto
gsap.to(character.params, {
  y: 0,
  armRotation: degreesToRadians(90),
  repeat: -1,
  yoyo: true,
  duration: 0.5
})

//new THREE.Box3().setFromObject(character.group).getCenter(character.group.position).multiplyScalar(-1)

const controls = new OrbitControls(
  camera,
  renderer.domElement
);
controls.update();

render()