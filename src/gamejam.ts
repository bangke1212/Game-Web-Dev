import * as THREE from 'three'

type Phase = 'IDEATION' | 'PRODUCTION' | 'BUG-FIXING' | 'POLISH' | 'SUBMISSION'
type Screen = 'title' | 'tutorial' | 'game' | 'pause' | 'settings' | 'event' | 'triage' | 'results'
type Mood = 'focused' | 'tired' | 'hyped' | 'panic' | 'proud'
type BugKind = 'CODE' | 'CONTENT' | 'BUILD'
type ActionKey = 'build' | 'refactor' | 'test' | 'polish' | 'devlog' | 'rest' | 'encourage' | 'celebrate' | 'push'
type SettingsState = { muted: boolean; reducedMotion: boolean; highContrast: boolean }

interface Feature {
  id: string
  title: string
  icon: string
  description: string
  effort: number
  value: number
  bugs: number
  accent: string
  built?: boolean
}

interface Brief {
  title: string
  genre: string
  pitch: string
  constraint: string
  vibe: string
  features: Feature[]
}

interface Bug {
  id: string
  title: string
  kind: BugKind
  severity: 1 | 2 | 3
  detail: string
  createdAt: number
}

interface Rival {
  name: string
  handle: string
  style: string
  progress: number
  color: string
  taunt: string
}

interface Run {
  briefIndex: number
  brief: Brief
  difficulty: number
  phase: number
  hoursLeft: number
  energy: number
  morale: number
  hype: number
  stability: number
  polish: number
  devlogs: number
  actions: number
  built: string[]
  bugs: Bug[]
  fixedBugs: number
  rivals: Rival[]
  reaction: string
  mood: Mood
  toast: string
  history: string[]
  ended?: boolean
  ending?: 'ship' | 'crash' | 'timeout'
  score?: Score
}

interface Score {
  feature: number
  stability: number
  polish: number
  hype: number
  energy: number
  devlog: number
  total: number
  rank: number
  ending: string
  postmortem: string
}

interface EventChoice {
  id: string
  label: string
  note: string
  apply: (run: Run) => string
}

interface JamEvent {
  title: string
  eyebrow: string
  copy: string
  choices: EventChoice[]
}

const PHASES: Phase[] = ['IDEATION', 'PRODUCTION', 'BUG-FIXING', 'POLISH', 'SUBMISSION']
const PHASE_LABELS = ['Idea', 'Build', 'Bugs', 'Polish', 'Ship']
const BUG_LABELS: Record<BugKind, string> = { CODE: 'Code', CONTENT: 'Content', BUILD: 'Build' }
const STORAGE_KEY = 'jamrush-v1'

const BRIEFS: Brief[] = [
  {
    title: 'Moonbase Window Cleaner', genre: 'Cozy / zero-g arcade', pitch: 'Clean the windows. Ignore the existential dread.', constraint: 'One button. Maximum vibes.', vibe: 'soft sci-fi',
    features: [
      { id: 'squeegee', title: 'Magnetic Squeegee', icon: '↝', description: 'Sweep cosmic dust into satisfying spirals.', effort: 4, value: 16, bugs: 1, accent: '#76e7ff' },
      { id: 'mooncats', title: 'Moon Cats', icon: '◉', description: 'They float. They judge. They shed.', effort: 5, value: 20, bugs: 2, accent: '#ffcb6e' },
      { id: 'lullaby', title: 'Window Lullaby', icon: '♫', description: 'A tiny song for a very large dark.', effort: 3, value: 14, bugs: 1, accent: '#c9ff5a' },
      { id: 'meteor', title: 'Meteor Mode', icon: '✦', description: 'Clean around incoming space rocks.', effort: 6, value: 24, bugs: 3, accent: '#ff769e' },
      { id: 'stickers', title: 'Ship Stickers', icon: '✚', description: 'A small reward for surviving the shift.', effort: 3, value: 12, bugs: 1, accent: '#b79cff' },
    ],
  },
  {
    title: 'Haunted Grocery Run', genre: 'Comedy / stealth', pitch: 'Buy milk before the aisles remember your name.', constraint: 'No combat. Only coupons.', vibe: 'fluorescent spooky',
    features: [
      { id: 'cart', title: 'Squeaky Cart', icon: '▱', description: 'Every wheel has a personal grievance.', effort: 4, value: 16, bugs: 1, accent: '#76e7ff' },
      { id: 'aisles', title: 'Shifting Aisles', icon: '⌁', description: 'The map is a suggestion, at best.', effort: 6, value: 24, bugs: 3, accent: '#ff769e' },
      { id: 'coupons', title: 'Ghost Coupons', icon: '▤', description: 'Save 10% and lose 10% of your soul.', effort: 4, value: 18, bugs: 2, accent: '#c9ff5a' },
      { id: 'checkout', title: 'Possessed Checkout', icon: '$', description: 'The self-checkout checks itself out.', effort: 5, value: 22, bugs: 2, accent: '#ffcb6e' },
      { id: 'milk', title: 'Milk Ending', icon: '◍', description: 'The most important carton in the afterlife.', effort: 3, value: 15, bugs: 1, accent: '#b79cff' },
    ],
  },
  {
    title: 'Tiny Wizard, Big Problem', genre: 'Puzzle / spellcraft', pitch: 'You have one spell. The dungeon has opinions.', constraint: 'Hand-drawn spell inputs only.', vibe: 'ink & sparks',
    features: [
      { id: 'spell', title: 'One Good Spell', icon: '✧', description: 'Draw a line. Hope it means fire.', effort: 5, value: 21, bugs: 2, accent: '#c9ff5a' },
      { id: 'goblins', title: 'Rude Goblins', icon: '☻', description: 'They heckle your release candidate.', effort: 4, value: 18, bugs: 2, accent: '#ff769e' },
      { id: 'map', title: 'Folded Dungeon', icon: '▦', description: 'A map that politely refuses to unfold.', effort: 5, value: 20, bugs: 2, accent: '#76e7ff' },
      { id: 'familiar', title: 'Pocket Familiar', icon: '♡', description: 'Small paws. Large deployment risk.', effort: 4, value: 17, bugs: 2, accent: '#ffcb6e' },
      { id: 'boss', title: 'Tiny Final Boss', icon: '✹', description: 'The boss is tiny. The scope is not.', effort: 7, value: 28, bugs: 3, accent: '#b79cff' },
    ],
  },
]

const RIVAL_SETS: Rival[][] = [
  [
    { name: 'Mina', handle: '@minamakes', style: 'scope goblin', progress: 22, color: '#ff769e', taunt: 'Mina just added another feature.' },
    { name: 'Patch', handle: '@patchnotes', style: 'stability nerd', progress: 18, color: '#76e7ff', taunt: 'Patch is suspiciously calm.' },
    { name: 'The Beige Team', handle: '@beige.exe', style: 'corporate vibes', progress: 28, color: '#ffcb6e', taunt: 'The Beige Team shipped a roadmap.' },
  ],
  [
    { name: 'Nox', handle: '@noxiousjoy', style: 'sound-first', progress: 20, color: '#b79cff', taunt: 'Nox posted a 40-second teaser.' },
    { name: 'Kite', handle: '@kitebyte', style: 'speedrunner', progress: 31, color: '#c9ff5a', taunt: 'Kite is already polishing.' },
    { name: 'Ollie', handle: '@ollieoops', style: 'accidental genius', progress: 14, color: '#ff769e', taunt: 'Ollie found a bug and called it lore.' },
  ],
  [
    { name: 'Soda', handle: '@sodacode', style: 'vibes only', progress: 24, color: '#ffcb6e', taunt: 'Soda replaced the menu with a poem.' },
    { name: 'Luz', handle: '@luzloops', style: 'animation gremlin', progress: 19, color: '#76e7ff', taunt: 'Luz made the bug dance.' },
    { name: '404 Kids', handle: '@404kids', style: 'three keyboards', progress: 35, color: '#b79cff', taunt: 'The 404 Kids are typing in stereo.' },
  ],
]

const EVENTS: JamEvent[] = [
  {
    eyebrow: 'INBOX / 02:13 PM', title: 'A streamer noticed your prototype', copy: 'They want a build for tonight. Your buddy is already hovering over the upload button.',
    choices: [
      { id: 'stream', label: 'Send the rough build', note: '+hype, -stability', apply: run => { run.hype += 15; run.stability -= 6; return 'The streamer clipped the bug. The clip is doing numbers.' } },
      { id: 'wait', label: 'Ask for one more hour', note: '+stability, -hype', apply: run => { run.stability += 7; run.hype -= 4; return 'The streamer waited. Your build stopped screaming.' } },
    ],
  },
  {
    eyebrow: 'TEAM CHAT / 7 UNREAD', title: 'Your buddy wrote a tiny poem', copy: 'It is mostly about coffee, the deadline, and how the build system is “a haunted cupboard.”',
    choices: [
      { id: 'post', label: 'Post it as a devlog', note: '+hype, +devlog', apply: run => { run.hype += 9; run.devlogs += 1; return 'The poem got bookmarked by three strangers.' } },
      { id: 'hug', label: 'Make them take five', note: '+morale, +energy', apply: run => { run.morale += 14; run.energy += 9; return 'Five minutes becomes seven. Everyone returns alive.' } },
    ],
  },
  {
    eyebrow: 'RIVAL FEED / HOT TAKE', title: 'Mina says your scope is “brave”', copy: 'That is either a compliment or an extremely polite warning.',
    choices: [
      { id: 'scope', label: 'Cut the least-loved feature', note: '+stability, -feature score', apply: run => { const target = run.brief.features.find(f => !run.built.includes(f.id)); if (target) target.value = Math.max(6, target.value - 5); run.stability += 10; return 'You cut scope. The game got smaller and better.' } },
      { id: 'double', label: 'Double down on the weird', note: '+hype, +bugs', apply: run => { run.hype += 12; run.stability -= 8; thisAddBug(run, 'The weird mechanic escaped the menu.', 'CODE', 2); return 'The weird is now the point. Probably.' } },
    ],
  },
]

function thisAddBug(run: Run, title: string, kind: BugKind, severity: 1 | 2 | 3): void {
  run.bugs.push({ id: `${Date.now()}-${Math.random()}`, title, kind, severity, detail: severity === 3 ? 'This one knows where the launch button lives.' : 'Small, loud, and probably reproducible.', createdAt: run.actions })
}

class JamAudio {
  private context?: AudioContext
  private musicTimer?: number
  private muted = false
  private musicStep = 0

  setMuted(muted: boolean): void { this.muted = muted }

  unlock(): void {
    if (!this.context) this.context = new AudioContext()
    if (this.context.state === 'suspended') void this.context.resume()
  }

  tone(kind: 'click' | 'success' | 'warning' | 'bug' | 'ship'): void {
    if (this.muted || !this.context) return
    const ctx = this.context
    const values = { click: [280, 0.035], success: [620, 0.12], warning: [150, 0.16], bug: [90, 0.18], ship: [880, 0.22] } as const
    const [frequency, duration] = values[kind]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = kind === 'warning' || kind === 'bug' ? 'sawtooth' : 'triangle'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    if (kind === 'success' || kind === 'ship') osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, ctx.currentTime + duration)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(kind === 'bug' ? 0.045 : 0.075, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration + 0.03)
  }

  startMusic(): void {
    if (this.musicTimer || this.muted) return
    this.musicTimer = window.setInterval(() => {
      if (!this.context || this.muted) return
      const notes = [110, 123.47, 146.83, 164.81, 146.83, 123.47]
      const frequency = notes[this.musicStep++ % notes.length]
      const osc = this.context.createOscillator()
      const gain = this.context.createGain()
      osc.type = 'sine'
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, this.context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.012, this.context.currentTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.24)
      osc.connect(gain).connect(this.context.destination)
      osc.start()
      osc.stop(this.context.currentTime + 0.28)
    }, 320)
  }

  stopMusic(): void { if (this.musicTimer) window.clearInterval(this.musicTimer); this.musicTimer = undefined }
}

class StudioBackdrop {
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer?: THREE.WebGLRenderer
  private readonly group = new THREE.Group()
  private readonly buddy = new THREE.Group()
  private readonly monitor: THREE.Mesh
  private readonly monitorGlow: THREE.Mesh
  private readonly bugOrb: THREE.Mesh
  private reducedMotion = false
  private shake = 0
  private time = 0
  private accent = new THREE.Color('#c9ff5a')

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#10152d')
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    this.camera.position.set(0, 3.1, 10)
    this.camera.lookAt(0, 1.2, 0)
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      this.renderer.toneMappingExposure = 1.05
    } catch {
      canvas.style.display = 'none'
    }
    this.scene.add(new THREE.AmbientLight('#9fb9ff', 1.25))
    const key = new THREE.PointLight('#c9ff5a', 24, 12, 2)
    key.position.set(-3, 5, 3)
    this.scene.add(key)
    const pink = new THREE.PointLight('#ff4f91', 18, 10, 2)
    pink.position.set(4, 2, 2)
    this.scene.add(pink)
    this.scene.add(this.group)
    this.buildRoom()
    this.buildBuddy()
    this.monitor = this.makeBox(2.4, 1.5, 0.18, '#202c59')
    this.monitor.position.set(-0.5, 2.0, -0.3)
    this.group.add(this.monitor)
    this.monitorGlow = this.makeBox(2.15, 1.14, 0.03, '#78e8ff')
    this.monitorGlow.position.set(-0.5, 2.0, -0.41)
    this.group.add(this.monitorGlow)
    const stand = this.makeBox(0.16, 0.8, 0.18, '#263568')
    stand.position.set(-0.5, 1.1, -0.25)
    this.group.add(stand)
    this.bugOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), new THREE.MeshStandardMaterial({ color: '#ff6f9c', emissive: '#ff356f', emissiveIntensity: 2.4 }))
    this.bugOrb.position.set(2.8, 2.5, 0)
    this.group.add(this.bugOrb)
    window.addEventListener('resize', () => this.resize())
    this.resize()
    this.animate()
  }

  setReducedMotion(value: boolean): void { this.reducedMotion = value }
  setAccent(value: string): void { this.accent.set(value); (this.monitorGlow.material as THREE.MeshStandardMaterial).color.copy(this.accent); (this.monitorGlow.material as THREE.MeshStandardMaterial).emissive.copy(this.accent) }
  bump(): void { if (!this.reducedMotion) this.shake = Math.min(0.22, this.shake + 0.08) }

  private makeBox(x: number, y: number, z: number, color: string): THREE.Mesh {
    return new THREE.Mesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 }))
  }

  private buildRoom(): void {
    const floor = this.makeBox(14, 0.16, 8, '#1a2346')
    floor.position.y = -0.35
    this.group.add(floor)
    const desk = this.makeBox(7, 0.42, 2.6, '#433d76')
    desk.position.set(0, 0.45, -0.4)
    this.group.add(desk)
    for (const x of [-3.2, 3.2]) { const leg = this.makeBox(0.25, 2.5, 0.25, '#252b5b'); leg.position.set(x, -0.7, -0.4); this.group.add(leg) }
    const pinboard = this.makeBox(7.6, 3.8, 0.12, '#27295a')
    pinboard.position.set(0, 2.65, -2.3)
    this.group.add(pinboard)
    for (let i = 0; i < 12; i += 1) {
      const note = this.makeBox(0.56 + (i % 3) * 0.12, 0.38, 0.04, ['#ffcb6e', '#c9ff5a', '#ff769e', '#76e7ff'][i % 4])
      note.position.set(-3.1 + (i % 5) * 1.55, 1.55 + Math.floor(i / 5) * 0.75, -2.39)
      note.rotation.z = (i % 3 - 1) * 0.08
      this.group.add(note)
    }
    const keyboard = this.makeBox(2.4, 0.11, 0.72, '#22294f')
    keyboard.position.set(-0.5, 0.73, 0.55)
    this.group.add(keyboard)
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 12), new THREE.MeshStandardMaterial({ color: '#ff769e' }))
    mug.position.set(2.5, 0.9, 0.3)
    this.group.add(mug)
    const plant = new THREE.Group()
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 10), new THREE.MeshStandardMaterial({ color: '#ffcb6e' }))
    pot.position.y = 0.25
    plant.add(pot)
    for (let i = 0; i < 5; i += 1) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 6), new THREE.MeshStandardMaterial({ color: '#76e7a4' })); leaf.scale.set(0.6, 1.5, 0.35); leaf.position.set(Math.cos(i) * 0.2, 0.7 + i * 0.04, Math.sin(i) * 0.12); leaf.rotation.z = i * 0.45; plant.add(leaf) }
    plant.position.set(-3.1, 0.7, 0.3)
    this.group.add(plant)
  }

  private buildBuddy(): void {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.88, 5, 10), new THREE.MeshStandardMaterial({ color: '#ff769e', roughness: 0.6 }))
    body.position.y = 0.9
    this.buddy.add(body)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: '#ffc6a9', roughness: 0.8 }))
    head.position.y = 1.82
    this.buddy.add(head)
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.54, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.58), new THREE.MeshStandardMaterial({ color: '#20234d' }))
    hair.position.set(0, 2.05, 0)
    this.buddy.add(hair)
    for (const x of [-0.18, 0.18]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: '#10152d' })); eye.position.set(x, 1.82, -0.48); this.buddy.add(eye) }
    this.buddy.position.set(2.1, 0, 0.1)
    this.group.add(this.buddy)
  }

  private resize(): void {
    if (!this.renderer) return
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  private animate = (): void => {
    this.time += 0.016
    const motion = this.reducedMotion ? 0 : 1
    this.buddy.position.y = Math.sin(this.time * 1.8) * 0.035 * motion
    this.buddy.rotation.z = Math.sin(this.time * 1.2) * 0.018 * motion
    this.bugOrb.position.y = 2.5 + Math.sin(this.time * 3.1) * 0.18 * motion
    this.bugOrb.rotation.x += 0.013 * motion
    this.bugOrb.rotation.y += 0.019 * motion
    this.group.rotation.y = Math.sin(this.time * 0.24) * 0.035 * motion
    if (this.shake > 0) { this.camera.position.x = Math.sin(this.time * 60) * this.shake; this.camera.position.y = 3.1 + Math.cos(this.time * 50) * this.shake * 0.5; this.shake *= 0.9 } else { this.camera.position.x = 0; this.camera.position.y = 3.1 }
    this.renderer?.render(this.scene, this.camera)
    requestAnimationFrame(this.animate)
  }
}

export class JamRushApp {
  private readonly root: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly audio = new JamAudio()
  private readonly scene: StudioBackdrop
  private screen: Screen = 'title'
  private run?: Run
  private event?: JamEvent
  private selectedBug?: string
  private lastFrame = performance.now()
  private lastUi = 0
  private lastGamepad = 0
  private lastPadButtons: boolean[] = []
  private tutorialSeen = false
  private settings: SettingsState = { muted: false, reducedMotion: false, highContrast: false }
  private runNumber = 0
  private bestScore = 0

  constructor(root: HTMLElement, canvas: HTMLCanvasElement) {
    this.root = root
    this.canvas = canvas
    this.scene = new StudioBackdrop(canvas)
    this.loadSettings()
    this.root.innerHTML = this.template()
    this.bind()
    this.show('title')
    ;(window as unknown as { __jamrush: unknown }).__jamrush = { app: this, getState: () => this.publicState(), start: () => this.startRun(false) }
  }

  start(): void {
    requestAnimationFrame(this.frame)
  }

  private template(): string {
    return `<div class="app-shell" data-contrast="false">
      <div class="grain"></div><div class="toast" data-bind="toast" aria-live="polite"></div>
      <section class="screen screen-title" data-screen="title" aria-hidden="true">
        <div class="title-stamp"><span>GAME JAM 48H</span><b>NO SCOPE<br>NO MERCY</b></div>
        <div class="title-copy"><div class="wordmark"><span class="wordmark-mark">↯</span><h1>JAM<span>RUSH</span></h1></div><p class="tagline">A tiny team. A giant deadline. One extremely questionable build.</p><div class="title-brief" data-bind="title-brief"></div>
          <div class="menu-row"><button class="jam-button primary" data-action="start"><span>START JAM</span><small>ENTER</small></button><button class="jam-button" data-action="tutorial"><span>HOW TO JAM</span><small>?</small></button></div>
          <div class="title-links"><button class="text-button" data-action="settings">Settings & accessibility</button><span>Best build: <b data-bind="best">—</b></span></div>
        </div><div class="title-footer"><span>ORIGINAL DESKTOP STUDIO SIM</span><span>© 2026 JAMRUSH TEAM</span><span>LOCAL RUN / NO ACCOUNT</span></div>
      </section>

      <section class="screen screen-game" data-screen="game" aria-hidden="true">
        <header class="game-header"><div class="mini-brand"><span>↯</span> JAMRUSH</div><div class="phase-track" data-bind="phase-track"></div><div class="header-actions"><button class="icon-button" data-action="pause" aria-label="Pause">Ⅱ</button><button class="icon-button" data-action="open-settings" aria-label="Settings">⚙</button></div></header>
        <div class="game-layout">
          <aside class="left-rail"><div class="rail-label">CURRENT BRIEF</div><h2 data-bind="brief-title"></h2><div class="brief-type" data-bind="brief-genre"></div><p data-bind="brief-pitch"></p><div class="constraint"><span>CONSTRAINT</span><b data-bind="brief-constraint"></b></div><div class="rail-tip"><span class="tip-dot"></span><span data-bind="tip">Click an action. Time is a resource.</span></div></aside>
          <main class="workbench">
            <div class="deadline-panel"><div><span class="eyebrow">DEADLINE / LOCAL JAM TIME</span><strong data-bind="clock">48:00</strong></div><div class="deadline-side"><span data-bind="deadline-word">SHIP SOMETHING GOOD</span><i class="deadline-ticks"></i></div></div>
            <div class="work-row"><section class="action-panel"><div class="section-head"><div><span class="eyebrow">DESK ACTIONS</span><h3>Make the next call</h3></div><button class="micro-button" data-action="open-triage"><span data-bind="bug-count">0</span> BUGS <kbd>Q</kbd></button></div><div class="action-grid" data-bind="actions"></div></section><section class="feature-panel"><div class="section-head"><div><span class="eyebrow">FEATURE CARDS</span><h3>Scope it, then ship it</h3></div><span class="feature-count" data-bind="feature-count">0 / 5 BUILT</span></div><div class="feature-list" data-bind="features"></div></section></div>
            <div class="work-footer"><div class="ship-meter"><div class="meter-label"><span>SHIP READINESS</span><b data-bind="readiness">0%</b></div><div class="meter"><i data-bind="readiness-bar"></i></div></div><div class="hotkeys"><span><kbd>1–9</kbd> actions</span><span><kbd>P</kbd> pause</span><span><kbd>Q</kbd> bugs</span></div></div>
          </main>
          <aside class="signal-stack"><section class="buddy-card"><div class="buddy-top"><div class="buddy-avatar" data-bind="buddy-avatar">☻</div><div><span class="eyebrow">YOUR BUDDY / <b data-bind="buddy-mood">FOCUSED</b></span><h3>Rae</h3><span class="handle">@raebuilds</span></div></div><div class="speech"><span class="quote-mark">“</span><p data-bind="buddy-reaction">Let’s make one good thing.</p></div><div class="stat-row"><span>ENERGY</span><div class="stat-bar"><i data-bind="energy-bar"></i></div><b data-bind="energy">72</b></div><div class="stat-row"><span>MORALE</span><div class="stat-bar morale"><i data-bind="morale-bar"></i></div><b data-bind="morale">76</b></div></section><section class="rival-card"><div class="section-head"><div><span class="eyebrow">RIVAL FEED</span><h3>Everyone is cooking</h3></div><span class="live-dot">LIVE</span></div><div class="rivals" data-bind="rivals"></div><div class="feed-line" data-bind="feed-line">The jam feed is refreshing...</div></section><section class="score-card"><div class="section-head"><div><span class="eyebrow">BUILD SIGNAL</span><h3>Current telemetry</h3></div><span class="signal-badge" data-bind="signal">STABLE</span></div><div class="signal-grid"><div><b data-bind="hype">18</b><span>HYPE</span></div><div><b data-bind="stability">82</b><span>STABILITY</span></div><div><b data-bind="polish">0</b><span>POLISH</span></div><div><b data-bind="devlogs">0</b><span>DEVLOGS</span></div></div></section></aside>
        </div><div class="mobile-warning" data-bind="warning"></div>
      </section>

      <section class="screen overlay-screen" data-screen="tutorial" aria-hidden="true"><div class="modal tutorial-modal"><div class="modal-kicker">FIRST BUILD / 01</div><h2>WELCOME TO THE PANIC ROOM</h2><p>You have a brief, a deadline, and Rae. Spend hours on features and polish, but keep enough energy to fix the bugs your ambition creates.</p><div class="tutorial-grid"><div><kbd>1–9</kbd><b>Choose an action</b><span>Keyboard shortcuts work anywhere on the desk.</span></div><div><kbd>Q</kbd><b>Triage bugs</b><span>Drag each bug to its best lane, or tap a lane.</span></div><div><kbd>P</kbd><b>Pause</b><span>Nothing moves while you plan your next move.</span></div><div><kbd>R</kbd><b>Restart</b><span>On results, restart instantly for another brief.</span></div></div><button class="jam-button primary wide" data-action="continue-tutorial"><span>OKAY, LET’S JAM</span><small>ENTER</small></button></div></section>

      <section class="screen overlay-screen" data-screen="pause" aria-hidden="true"><div class="modal small-modal"><div class="modal-kicker">BUILD PAUSED</div><h2>THE CLOCK CAN WAIT</h2><p data-bind="pause-copy">Your desk is safe. Your scope is not.</p><div class="menu-stack"><button class="jam-button primary wide" data-action="resume"><span>BACK TO DESK</span><small>P / ESC</small></button><button class="jam-button wide" data-action="open-settings"><span>SETTINGS & ACCESSIBILITY</span><small>⚙</small></button><button class="jam-button wide" data-action="quit"><span>ABANDON THIS BUILD</span><small>ESC</small></button></div></div></section>

      <section class="screen overlay-screen" data-screen="settings" aria-hidden="true"><div class="modal settings-modal"><div class="modal-kicker">DESK SETTINGS</div><h2>KEEP IT READABLE</h2><div class="settings-list"><button class="setting-row" data-action="toggle-sound"><span><b>Reactive sound</b><small>Original tones and generative pulse</small></span><i data-bind="sound-toggle">ON</i></button><button class="setting-row" data-action="toggle-motion"><span><b>Reduced motion</b><small>Disable shake and looping bob</small></span><i data-bind="motion-toggle">OFF</i></button><button class="setting-row" data-action="toggle-contrast"><span><b>High contrast</b><small>Make status colors extra loud</small></span><i data-bind="contrast-toggle">OFF</i></button></div><button class="jam-button wide" data-action="close-settings"><span>BACK TO IT</span><small>ESC</small></button></div></section>

      <section class="screen overlay-screen" data-screen="event" aria-hidden="true"><div class="modal event-modal"><div class="modal-kicker" data-bind="event-eyebrow">INBOX</div><h2 data-bind="event-title">A THING HAPPENED</h2><p data-bind="event-copy"></p><div class="choice-list" data-bind="event-choices"></div></div></section>

      <section class="screen overlay-screen" data-screen="triage" aria-hidden="true"><div class="modal triage-modal"><div class="modal-kicker">BUG TRIAGE / <span data-bind="triage-total">0</span> OPEN</div><h2>MAKE THE BUGS BEHAVE</h2><p>Drag a ticket into the lane that can solve it. Wrong lanes make the bug louder.</p><div class="triage-board"><div class="bug-dock" data-bind="bug-dock"></div><div class="triage-lanes"><div class="triage-lane" data-kind="CODE"><b>CODE</b><small>logic / input / state</small></div><div class="triage-lane" data-kind="CONTENT"><b>CONTENT</b><small>scope / text / vibes</small></div><div class="triage-lane" data-kind="BUILD"><b>BUILD</b><small>deploy / assets / ritual</small></div></div></div><button class="jam-button wide" data-action="close-triage"><span>BACK TO DESK</span><small>ESC</small></button></div></section>

      <section class="screen overlay-screen" data-screen="results" aria-hidden="true"><div class="modal results-modal"><div class="modal-kicker" data-bind="result-kicker">POSTMORTEM / BUILD COMPLETE</div><h2 data-bind="result-title">YOU SHIPPED A THING</h2><p class="result-copy" data-bind="result-copy"></p><div class="results-grid" data-bind="results-grid"></div><div class="ranking" data-bind="ranking"></div><div class="result-actions"><button class="jam-button primary" data-action="restart"><span>RUN IT BACK</span><small>R</small></button><button class="jam-button" data-action="quit"><span>DESK HOME</span><small>ESC</small></button></div></div></section>
    </div>`
  }

  private bind(): void {
    this.root.addEventListener('click', event => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
      if (!target) return
      const action = target.dataset.action
      this.audio.unlock()
      if (action === 'start') this.startRun(false)
      else if (action === 'tutorial') this.show('tutorial')
      else if (action === 'continue-tutorial') { this.tutorialSeen = true; this.saveSettings(); if (this.run) this.show('game'); else this.startRun(true) }
      else if (action === 'pause') this.pause()
      else if (action === 'resume') this.show('game')
      else if (action === 'open-settings') this.show('settings')
      else if (action === 'settings') this.show('settings')
      else if (action === 'close-settings') this.show(this.run?.ended ? 'results' : this.run ? 'game' : 'title')
      else if (action === 'toggle-sound') this.toggleSetting('muted')
      else if (action === 'toggle-motion') this.toggleSetting('reducedMotion')
      else if (action === 'toggle-contrast') this.toggleSetting('highContrast')
      else if (action === 'quit') { this.audio.stopMusic(); this.run = undefined; this.show('title'); this.updateTitle() }
      else if (action === 'restart') this.startRun(false)
      else if (action === 'open-triage') this.openTriage()
      else if (action === 'close-triage') this.show('game')
      else if (action === 'event-choice') this.chooseEvent(target.dataset.choice ?? '')
      else if (action === 'action') this.doAction(target.dataset.kind as ActionKey)
      else if (action === 'build-specific') this.buildFeature(target.dataset.feature ?? '')
      else if (action === 'submit') this.submit()
      this.audio.tone('click')
    })
    this.root.addEventListener('dragstart', event => {
      const card = (event.target as HTMLElement).closest<HTMLElement>('[data-bug-id]')
      if (card && event.dataTransfer) event.dataTransfer.setData('text/plain', card.dataset.bugId ?? '')
    })
    this.root.addEventListener('dragover', event => { if ((event.target as HTMLElement).closest('.triage-lane')) event.preventDefault() })
    this.root.addEventListener('drop', event => {
      const lane = (event.target as HTMLElement).closest<HTMLElement>('.triage-lane')
      if (!lane) return
      event.preventDefault()
      const id = event.dataTransfer?.getData('text/plain') || this.selectedBug
      if (id) this.resolveBug(id, lane.dataset.kind as BugKind)
    })
    window.addEventListener('keydown', event => this.keydown(event))
    this.root.addEventListener('pointerover', event => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-tip]')
      if (target) this.setTip(target.dataset.tip ?? '')
    })
    this.root.addEventListener('pointerout', event => { if ((event.target as HTMLElement).closest('[data-tip]')) this.setTip('Click an action. Time is a resource.') })
  }

  private keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.screen === 'pause') this.show('game')
      else if (this.screen === 'settings') this.show(this.run ? 'game' : 'title')
      else if (this.screen === 'event' || this.screen === 'triage') this.show('game')
      else if (this.screen === 'game') this.pause()
      return
    }
    if (this.screen === 'tutorial' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); this.root.querySelector<HTMLElement>('[data-action="continue-tutorial"]')?.click(); return }
    if (this.screen === 'title' && event.key === 'Enter') { this.startRun(false); return }
    if (this.screen === 'results' && event.key.toLowerCase() === 'r') { this.startRun(false); return }
    if (this.screen !== 'game') return
    const number = Number(event.key)
    const action = ['build', 'refactor', 'test', 'polish', 'devlog', 'rest', 'encourage', 'celebrate', 'push'][number - 1] as ActionKey | undefined
    if (action) { event.preventDefault(); this.doAction(action) }
    if (event.key.toLowerCase() === 'q') this.openTriage()
    if (event.key.toLowerCase() === 'p') this.pause()
  }

  private startRun(fromTutorial: boolean): void {
    this.audio.unlock()
    this.audio.startMusic()
    const stored = this.readStored()
    const briefIndex = this.runNumber % BRIEFS.length
    const source = BRIEFS[briefIndex]
    const brief: Brief = { ...source, features: source.features.map(feature => ({ ...feature, built: false })) }
    const rivals = RIVAL_SETS[briefIndex].map(rival => ({ ...rival, progress: rival.progress + this.runNumber * 3 }))
    this.run = { briefIndex, brief, difficulty: Math.min(3, Math.floor(this.runNumber / 2)), phase: 0, hoursLeft: 56 - Math.min(8, this.runNumber * 2), energy: 74, morale: 78, hype: 18, stability: 82, polish: 0, devlogs: 0, actions: 0, built: [], bugs: [], fixedBugs: 0, rivals, reaction: 'Let’s make one good thing.', mood: 'focused', toast: '', history: ['The brief lands. The room goes quiet.'] }
    this.runNumber += 1
    this.bestScore = Math.max(this.bestScore, stored.best ?? 0)
    this.show(fromTutorial || (!this.tutorialSeen && !stored.tutorialSeen) ? 'tutorial' : 'game')
    if (this.screen === 'tutorial') this.renderTutorialForRun()
    this.updateGameUI()
    this.scene.bump()
  }

  private renderTutorialForRun(): void { const title = this.root.querySelector<HTMLElement>('.tutorial-modal h2'); if (title) title.textContent = 'YOUR FIRST JAM STARTS NOW' }

  private pause(): void { if (this.screen === 'game' && this.run && !this.run.ended) this.show('pause') }

  private doAction(kind?: ActionKey): void {
    if (!kind || this.screen !== 'game' || !this.run || this.run.ended) return
    const run = this.run
    const outcome = (() => {
      switch (kind) {
        case 'build': return this.buildNextFeature()
        case 'refactor': return this.performWork(3, 10, () => { run.stability += 10; this.removeOneBug('CODE'); return 'Refactor pass complete. The code stopped arguing with itself.' })
        case 'test': return this.performWork(3, 8, () => { run.stability += 8; this.removeOneBug(); return 'Test suite green-ish. That is a color.' })
        case 'polish': return this.performWork(4, 11, () => { run.polish += 14; run.hype += 3; return 'The rough edges now look intentional.' })
        case 'devlog': return this.performWork(2, 7, () => { run.devlogs += 1; run.hype += 11; return 'Devlog posted. Three strangers now have opinions.' })
        case 'rest': return this.performWork(4, 0, () => { run.energy += 25; run.morale += 5; return 'You put the kettle on. The kettle believes in you.' }, true)
        case 'encourage': return this.performWork(2, 3, () => { run.morale += 18; return 'Rae remembers this is supposed to be fun.' })
        case 'celebrate': return this.performWork(3, 0, () => { run.energy += 7; run.morale += 16; run.hype += 5; return 'Tiny celebration. Huge emotional ROI.' }, true)
        case 'push': return this.performWork(2, 16, () => { run.morale -= 13; run.stability -= 5; run.hype += 7; return 'You push through. The build gets faster and more haunted.' })
      }
    })()
    if (!outcome) return
    run.actions += 1
    run.history.unshift(outcome)
    run.reaction = outcome
    run.mood = run.morale < 30 ? 'panic' : run.energy < 24 ? 'tired' : run.hype > 72 ? 'hyped' : 'focused'
    this.advancePhase()
    this.rivalBeat()
    this.updateGameUI()
    this.scene.bump()
    this.audio.tone(kind === 'push' || kind === 'test' ? 'warning' : 'success')
    if (this.shouldShowEvent()) this.openEvent()
    if (run.bugs.length >= 4 && run.stability < 42) this.setTip('BUG STORM: triage before the build turns into soup.')
    if (run.stability <= 0 || this.bugPressure() >= 22) this.finish('crash')
  }

  private performWork(hours: number, energy: number, effect: () => string, allowLowEnergy = false): string | undefined {
    const run = this.run
    if (!run) return undefined
    if (run.hoursLeft <= hours) { this.setTip('The deadline is too close for that move. Submit now or rest.') ; return undefined }
    if (!allowLowEnergy && run.energy < energy) { this.setTip('Not enough energy. Rest or encourage before pushing again.'); run.reaction = 'I need a recharge before I can make this good.'; run.mood = 'tired'; this.updateGameUI(); return undefined }
    run.hoursLeft -= hours
    run.energy = clamp(run.energy - energy, 0, 100)
    run.morale = clamp(run.morale - (energy > 12 ? 3 : 0), 0, 100)
    return effect()
  }

  private buildNextFeature(requestedId?: string): string | undefined {
    const run = this.run
    if (!run) return undefined
    const feature = run.brief.features.find(item => !run.built.includes(item.id) && (!requestedId || item.id === requestedId))
    if (!feature) { this.setTip('Every card is built. Polish, test, or ship it.'); return undefined }
    const result = this.performWork(feature.effort, 14 + feature.effort, () => {
      run.built.push(feature.id)
      feature.built = true
      run.hype += Math.round(feature.value / 5)
      run.stability -= feature.bugs * (run.difficulty + 1)
      for (let i = 0; i < feature.bugs; i += 1) {
        if (Math.random() < 0.72) this.addBugForFeature(run, feature, i)
      }
      return `${feature.title} is in. The scope is now officially real.`
    })
    return result
  }

  private buildFeature(id: string): void {
    if (!this.run || this.screen !== 'game') return
    const next = this.run.brief.features.find(feature => feature.id === id && !this.run?.built.includes(id))
    if (!next) return
    const result = this.buildNextFeature(id)
    if (result) { this.run.reaction = result; this.updateGameUI(); this.scene.bump(); this.audio.tone('success') }
  }

  private addBugForFeature(run: Run, feature: Feature, index: number): void {
    const kinds: BugKind[] = ['CODE', 'CONTENT', 'BUILD']
    const kind = kinds[(feature.value + index + run.actions) % kinds.length]
    const severity = feature.bugs >= 3 && index === feature.bugs - 1 ? 3 : (index % 2 === 0 ? 1 : 2) as 1 | 2 | 3
    thisAddBug(run, `${feature.title}: ${kind === 'CODE' ? 'the button ate the click' : kind === 'CONTENT' ? 'a sentence escaped the brief' : 'the build only works on Rae’s laptop'}`, kind, severity)
  }

  private addBug(title: string, kind: BugKind, severity: 1 | 2 | 3): void { if (this.run) thisAddBug(this.run, title, kind, severity) }

  private removeOneBug(kind?: BugKind): void {
    if (!this.run || this.run.bugs.length === 0) return
    const index = kind ? this.run.bugs.findIndex(bug => bug.kind === kind) : 0
    if (index >= 0) { this.run.bugs.splice(index, 1); this.run.fixedBugs += 1; this.run.stability = clamp(this.run.stability + 5, 0, 100) }
  }

  private openTriage(): void { if (this.run && this.run.bugs.length > 0 && (this.screen === 'game' || this.screen === 'pause')) { this.renderTriage(); this.show('triage') } else if (this.run) this.setTip('No open bugs. This is the rare good screen.') }

  private resolveBug(id: string, lane: BugKind): void {
    const run = this.run
    if (!run) return
    const index = run.bugs.findIndex(bug => bug.id === id)
    if (index < 0) return
    const bug = run.bugs[index]
    if (bug.kind === lane) {
      run.bugs.splice(index, 1)
      run.fixedBugs += 1
      run.stability = clamp(run.stability + 7 + bug.severity * 2, 0, 100)
      run.morale = clamp(run.morale + 2, 0, 100)
      run.reaction = `Nice triage. ${BUG_LABELS[lane]} is where that bug belonged.`
      this.audio.tone('success')
    } else {
      bug.severity = Math.min(3, bug.severity + 1) as 1 | 2 | 3
      run.stability = clamp(run.stability - 4, 0, 100)
      run.reaction = 'Wrong lane. The bug got louder.'
      this.audio.tone('bug')
    }
    this.renderTriage()
    this.updateGameUI()
    if (run.bugs.length === 0) window.setTimeout(() => { if (this.screen === 'triage') this.show('game') }, 420)
  }

  private renderTriage(): void {
    const run = this.run
    const dock = this.root.querySelector<HTMLElement>('[data-bind="bug-dock"]')
    const count = this.root.querySelector<HTMLElement>('[data-bind="triage-total"]')
    if (!run || !dock || !count) return
    count.textContent = String(run.bugs.length)
    dock.innerHTML = run.bugs.length ? run.bugs.map(bug => `<button class="bug-ticket severity-${bug.severity}" draggable="true" data-bug-id="${bug.id}" data-tip="${bug.detail}"><span class="bug-ticket-top"><b>${BUG_LABELS[bug.kind]}</b><em>${'!'.repeat(bug.severity)}</em></span><strong>${bug.title}</strong><small>${bug.detail}</small></button>`).join('') : '<div class="empty-bugs"><b>BUGS CLEARED</b><span>Rae is doing a tiny victory dance.</span></div>'
  }

  private shouldShowEvent(): boolean { return Boolean(this.run && this.run.actions > 1 && this.run.actions % 3 === 0 && Math.random() < 0.75 && this.screen === 'game') }

  private openEvent(): void {
    if (!this.run) return
    this.event = EVENTS[(this.run.actions + this.run.briefIndex) % EVENTS.length]
    this.root.querySelector<HTMLElement>('[data-bind="event-eyebrow"]')!.textContent = this.event.eyebrow
    this.root.querySelector<HTMLElement>('[data-bind="event-title"]')!.textContent = this.event.title
    this.root.querySelector<HTMLElement>('[data-bind="event-copy"]')!.textContent = this.event.copy
    this.root.querySelector<HTMLElement>('[data-bind="event-choices"]')!.innerHTML = this.event.choices.map(choice => `<button class="choice-card" data-action="event-choice" data-choice="${choice.id}"><b>${choice.label}</b><span>${choice.note}</span></button>`).join('')
    this.show('event')
    this.audio.tone('warning')
  }

  private chooseEvent(id: string): void {
    if (!this.event || !this.run) return
    const choice = this.event.choices.find(item => item.id === id)
    if (!choice) return
    const result = choice.apply(this.run)
    this.run.history.unshift(result)
    this.run.reaction = result
    this.event = undefined
    this.show('game')
    this.updateGameUI()
    this.scene.bump()
    this.audio.tone('success')
  }

  private advancePhase(): void {
    const run = this.run
    if (!run) return
    const built = run.built.length
    const desired = built === 0 ? 0 : built < 2 && run.hoursLeft > 34 ? 1 : built < 4 && run.bugs.length > 0 ? 2 : run.hoursLeft < 24 || built >= 4 ? 3 : 1
    if (desired > run.phase) run.phase = Math.min(3, desired)
    if (run.hoursLeft <= 8) run.phase = 3
  }

  private rivalBeat(): void {
    if (!this.run) return
    this.run.rivals.forEach(rival => { rival.progress = clamp(rival.progress + 0.9 + Math.random() * (1.6 + this.run!.difficulty * 0.6), 0, 100) })
    if (this.run.actions % 2 === 0) {
      const rival = this.run.rivals[this.run.actions % this.run.rivals.length]
      this.run.history.unshift(rival.taunt)
    }
  }

  private bugPressure(): number { return this.run?.bugs.reduce((sum, bug) => sum + bug.severity, 0) ?? 0 }

  private finish(reason: 'ship' | 'crash' | 'timeout'): void {
    const run = this.run
    if (!run || run.ended) return
    run.ended = true
    run.ending = reason
    run.phase = 4
    if (reason === 'crash') { run.reaction = 'The build has become a weather event.'; this.audio.tone('bug') }
    else if (reason === 'timeout') { run.reaction = 'The deadline hit zero. Ship what you have.'; this.audio.tone('warning') }
    else { run.reaction = 'It is not perfect. It is real. Ship it.'; this.audio.tone('ship') }
    run.score = this.scoreRun(reason)
    this.persistBest(run.score.total)
    this.scene.bump()
    window.setTimeout(() => { if (this.run === run) { this.renderResults(); this.show('results') } }, 260)
  }

  private submit(): void {
    if (!this.run || this.screen !== 'game') return
    if (this.run.built.length < 2) { this.setTip('You need at least two features before you can call this a game.'); this.run.reaction = 'Two features. Then we can bravely hit submit.'; this.updateGameUI(); return }
    this.finish('ship')
  }

  private scoreRun(reason: 'ship' | 'crash' | 'timeout'): Score {
    const run = this.run!
    const featureMax = run.brief.features.reduce((sum, feature) => sum + feature.value, 0)
    const feature = clamp(Math.round(run.brief.features.filter(item => run.built.includes(item.id)).reduce((sum, item) => sum + item.value, 0) / featureMax * 100), 0, 100)
    const stability = clamp(Math.round(run.stability - this.bugPressure() * 3), 0, 100)
    const polish = clamp(Math.round(run.polish), 0, 100)
    const hype = clamp(Math.round(run.hype), 0, 100)
    const energy = clamp(Math.round((run.energy * 0.45 + run.morale * 0.55)), 0, 100)
    const devlog = clamp(Math.round(run.devlogs * 18), 0, 100)
    const total = Math.round(feature * 2.1 + stability * 1.7 + polish * 1.2 + hype * 1.05 + energy * 0.75 + devlog * 0.6)
    const rivalLead = run.rivals.filter(rival => total / 8 > rival.progress).length
    const rank = clamp(4 - rivalLead, 1, 4)
    let ending = 'A scrappy little ship'
    let postmortem = 'You made a small thing with a pulse. Rae has already opened a branch called “next jam”.'
    if (reason === 'crash') { ending = 'The build became folklore'; postmortem = 'The bugs won the sprint, but the wreckage has excellent screenshots. Rae wants to try again with fewer features and the same coffee.' }
    else if (reason === 'timeout') { ending = 'A brave unfinished build'; postmortem = 'The deadline was louder than the scope. Still, someone bookmarked the devlog. That counts as a tiny lighthouse.' }
    else if (total >= 610) { ending = 'The weird little hit'; postmortem = 'Against every sensible projection, the jam feed is quoting your loading screen. Rae is pretending not to cry.' }
    else if (total >= 470) { ending = 'A delightful jank machine'; postmortem = 'The rough edges became texture. Your postmortem has three bullet points and one suspiciously glowing graph.' }
    return { feature, stability, polish, hype, energy, devlog, total, rank, ending, postmortem }
  }

  private renderResults(): void {
    const run = this.run
    const score = run?.score
    if (!run || !score) return
    const resultTitle = this.root.querySelector<HTMLElement>('[data-bind="result-title"]')!
    resultTitle.textContent = score.ending.toUpperCase()
    this.root.querySelector<HTMLElement>('[data-bind="result-copy"]')!.textContent = score.postmortem
    this.root.querySelector<HTMLElement>('[data-bind="result-kicker"]')!.textContent = run.ending === 'ship' ? 'POSTMORTEM / BUILD COMPLETE' : 'POSTMORTEM / THE CLOCK WON'
    this.root.querySelector<HTMLElement>('[data-bind="results-grid"]')!.innerHTML = [['FEATURES', score.feature], ['STABILITY', score.stability], ['POLISH', score.polish], ['HYPE', score.hype], ['TEAM ENERGY', score.energy], ['DEVLOGS', score.devlog]].map(([label, value]) => `<div class="result-stat"><span>${label}</span><b>${value}</b><i><em style="width:${value}%"></em></i></div>`).join('')
    const rankCopy = score.rank === 1 ? '1ST / THE FEED IS MELTING' : score.rank === 2 ? '2ND / EXTREMELY SHIPPABLE' : score.rank === 3 ? '3RD / HONORABLE JANK' : '4TH / YOU MADE A GAME'
    this.root.querySelector<HTMLElement>('[data-bind="ranking"]')!.innerHTML = `<div><span>FINAL SCORE</span><strong>${score.total}</strong></div><b>${rankCopy}</b><small>${run.built.length}/${run.brief.features.length} features · ${run.fixedBugs} bugs fixed · ${run.actions} decisions</small>`
  }

  private updateGameUI(): void {
    const run = this.run
    if (!run) return
    const set = (name: string, value: string): void => { const el = this.root.querySelector<HTMLElement>(`[data-bind="${name}"]`); if (el) el.textContent = value }
    set('brief-title', run.brief.title); set('brief-genre', run.brief.genre); set('brief-pitch', run.brief.pitch); set('brief-constraint', run.brief.constraint); set('clock', formatClock(run.hoursLeft)); set('energy', String(Math.round(run.energy))); set('morale', String(Math.round(run.morale))); set('hype', String(Math.round(run.hype))); set('stability', String(Math.round(run.stability))); set('polish', String(Math.round(run.polish))); set('devlogs', String(run.devlogs)); set('bug-count', String(run.bugs.length)); set('feature-count', `${run.built.length} / ${run.brief.features.length} BUILT`); set('buddy-reaction', run.reaction); set('buddy-mood', run.mood.toUpperCase()); set('signal', run.stability < 40 ? 'CRITICAL' : run.bugs.length > 0 ? 'NOISY' : 'STABLE'); set('warning', run.hoursLeft < 12 ? `DEADLINE WARNING / ${formatClock(run.hoursLeft)} LEFT` : '')
    this.root.querySelector<HTMLElement>('[data-bind="energy-bar"]')!.style.width = `${clamp(run.energy, 0, 100)}%`; this.root.querySelector<HTMLElement>('[data-bind="morale-bar"]')!.style.width = `${clamp(run.morale, 0, 100)}%`
    const readiness = clamp(Math.round(run.built.length / run.brief.features.length * 45 + run.stability * 0.25 + run.polish * 0.2 + run.hype * 0.1), 0, 100)
    set('readiness', `${readiness}%`); this.root.querySelector<HTMLElement>('[data-bind="readiness-bar"]')!.style.width = `${readiness}%`
    const phaseTrack = this.root.querySelector<HTMLElement>('[data-bind="phase-track"]'); if (phaseTrack) phaseTrack.innerHTML = PHASE_LABELS.map((label, index) => `<span class="phase-step ${index === run.phase ? 'current' : index < run.phase ? 'done' : ''}"><i>${index < run.phase ? '✓' : index + 1}</i>${label}</span>`).join('')
    const avatar = this.root.querySelector<HTMLElement>('[data-bind="buddy-avatar"]'); if (avatar) { avatar.textContent = run.mood === 'panic' ? '!' : run.mood === 'tired' ? 'z' : run.mood === 'hyped' ? '✦' : run.mood === 'proud' ? '♥' : '☻'; avatar.dataset.mood = run.mood }
    const actions = this.root.querySelector<HTMLElement>('[data-bind="actions"]'); if (actions) { const markup = this.actionTemplate(run); if (actions.innerHTML !== markup) actions.innerHTML = markup }
    const features = this.root.querySelector<HTMLElement>('[data-bind="features"]'); if (features) { const markup = run.brief.features.map(feature => `<button class="feature-card ${feature.built ? 'built' : ''}" data-action="build-specific" data-feature="${feature.id}" data-tip="${feature.built ? 'Built. Spend time testing or polishing it.' : `${feature.description} / ${feature.effort}h`}" ${feature.built ? 'disabled' : ''}><span class="feature-icon" style="--feature-accent:${feature.accent}">${feature.icon}</span><span class="feature-copy"><b>${feature.title}</b><small>${feature.built ? 'BUILT / IN THE BUILD' : `${feature.effort}H · ${feature.description}`}</small></span><em>${feature.built ? '✓' : `+${feature.value}`}</em></button>`).join(''); if (features.innerHTML !== markup) features.innerHTML = markup }
    const rivals = this.root.querySelector<HTMLElement>('[data-bind="rivals"]'); if (rivals) rivals.innerHTML = run.rivals.map(rival => `<div class="rival"><div class="rival-line"><span><b>${rival.name}</b> <small>${rival.handle}</small></span><em>${Math.round(rival.progress)}%</em></div><div class="rival-bar"><i style="width:${clamp(rival.progress, 0, 100)}%;background:${rival.color}"></i></div></div>`).join('')
    set('feed-line', run.history[0] ?? 'The jam feed is refreshing...')
    this.root.querySelector<HTMLElement>('[data-bind="deadline-word"]')!.textContent = run.hoursLeft < 12 ? 'THE BUILD IS HOT' : run.phase >= 3 ? 'POLISH THE CHAOS' : 'SHIP SOMETHING GOOD'
    this.root.querySelector<HTMLElement>('.deadline-panel')?.classList.toggle('urgent', run.hoursLeft < 12)
    this.root.querySelector<HTMLElement>('.app-shell')?.setAttribute('data-contrast', String(this.settings.highContrast))
    this.scene.setReducedMotion(this.settings.reducedMotion); this.scene.setAccent(run.stability < 40 ? '#ff6f9c' : run.phase >= 3 ? '#c9ff5a' : '#76e7ff')
  }

  private actionTemplate(run: Run): string {
    const actions: Array<{ kind: ActionKey; label: string; sub: string; hotkey: string; icon: string; tone: string }> = [
      { kind: 'build', label: 'BUILD FEATURE', sub: `${run.brief.features.length - run.built.length} card${run.brief.features.length - run.built.length === 1 ? '' : 's'} left`, hotkey: '1', icon: '✦', tone: 'lime' },
      { kind: 'refactor', label: 'REFACTOR', sub: 'stability + / bug -', hotkey: '2', icon: '⌘', tone: 'cyan' },
      { kind: 'test', label: 'RUN TESTS', sub: 'find the loud thing', hotkey: '3', icon: '✓', tone: 'cyan' },
      { kind: 'polish', label: 'POLISH', sub: 'make it feel shipped', hotkey: '4', icon: '✧', tone: 'gold' },
      { kind: 'devlog', label: 'POST DEVLOG', sub: 'hype + / time -', hotkey: '5', icon: '▤', tone: 'pink' },
      { kind: 'rest', label: 'REST / SNACK', sub: 'energy ++', hotkey: '6', icon: '☕', tone: 'mint' },
      { kind: 'encourage', label: 'ENCOURAGE RAE', sub: 'morale ++', hotkey: '7', icon: '♡', tone: 'pink' },
      { kind: 'celebrate', label: 'TINY CELEBRATION', sub: 'morale / hype +', hotkey: '8', icon: '✹', tone: 'gold' },
      { kind: 'push', label: 'PUSH THROUGH', sub: 'fast / risky', hotkey: '9', icon: '‼', tone: 'red' },
    ]
    const buttons = actions.map(action => `<button class="action-card tone-${action.tone}" data-action="action" data-kind="${action.kind}" data-tip="${action.sub}"><span class="action-icon">${action.icon}</span><span><b>${action.label}</b><small>${action.sub}</small></span><kbd>${action.hotkey}</kbd></button>`).join('')
    const submit = `<button class="submit-button" data-action="submit" data-tip="Submit the current build. Requires at least two features."><span>↗</span><b>SUBMIT BUILD</b><small>Final call · no undo</small></button>`
    return buttons + submit
  }

  private setTip(text: string): void { const el = this.root.querySelector<HTMLElement>('[data-bind="tip"]'); if (el) el.textContent = text }

  private show(screen: Screen): void {
    this.screen = screen
    this.root.querySelectorAll<HTMLElement>('[data-screen]').forEach(element => { const active = element.dataset.screen === screen; element.classList.toggle('is-active', active); element.setAttribute('aria-hidden', String(!active)) })
    if (screen === 'title') this.updateTitle()
    if (screen === 'game') this.updateGameUI()
    if (screen === 'triage') this.renderTriage()
    if (screen === 'settings') this.renderSettings()
    if (screen === 'title' || screen === 'results') this.canvas.classList.add('title-mode'); else this.canvas.classList.remove('title-mode')
    const focus = this.root.querySelector<HTMLElement>(`[data-screen="${screen}"] button:not([disabled])`); focus?.focus({ preventScroll: true })
  }

  private updateTitle(): void {
    const brief = BRIEFS[this.runNumber % BRIEFS.length]
    const target = this.root.querySelector<HTMLElement>('[data-bind="title-brief"]'); if (target) target.innerHTML = `<span>NEXT BRIEF</span><b>${brief.title}</b><small>${brief.pitch}</small>`
    const best = this.root.querySelector<HTMLElement>('[data-bind="best"]'); if (best) best.textContent = this.bestScore ? String(this.bestScore) : '—'
  }

  private renderSettings(): void { const set = (name: string, value: string) => { const el = this.root.querySelector<HTMLElement>(`[data-bind="${name}"]`); if (el) el.textContent = value }; set('sound-toggle', this.settings.muted ? 'OFF' : 'ON'); set('motion-toggle', this.settings.reducedMotion ? 'ON' : 'OFF'); set('contrast-toggle', this.settings.highContrast ? 'ON' : 'OFF') }

  private toggleSetting(key: keyof typeof this.settings): void { this.settings[key] = !this.settings[key]; this.audio.setMuted(this.settings.muted); this.scene.setReducedMotion(this.settings.reducedMotion); this.saveSettings(); this.renderSettings(); if (key === 'highContrast') this.root.querySelector<HTMLElement>('.app-shell')?.setAttribute('data-contrast', String(this.settings.highContrast)) }

  private frame = (now: number): void => {
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000)
    this.lastFrame = now
    if (this.screen === 'game' && this.run && !this.run.ended) {
      this.run.hoursLeft -= dt * 0.24
      this.run.rivals.forEach(rival => { rival.progress = clamp(rival.progress + dt * (0.15 + this.run!.difficulty * 0.05), 0, 100) })
      if (this.run.hoursLeft <= 0) this.finish('timeout')
      if (this.run.hoursLeft < 14 && this.run.actions > 2 && Math.random() < dt * 0.04) { this.addBug('Deadline spiral: something is now on fire.', 'BUILD', 2); this.run.stability -= 4; this.audio.tone('warning') }
      if (now - this.lastUi > 120) { this.updateGameUI(); this.lastUi = now }
      this.pollGamepad(now)
    }
    requestAnimationFrame(this.frame)
  }

  private pollGamepad(now: number): void {
    if (now - this.lastGamepad < 140 || !navigator.getGamepads) return
    this.lastGamepad = now
    const pad = Array.from(navigator.getGamepads()).find(item => item)
    if (!pad) return
    const pressed = pad.buttons.map(button => button.pressed)
    if (pressed[0] && !this.lastPadButtons[0]) {
      const active = document.activeElement as HTMLElement | null
      if (active?.matches('button')) active.click()
    }
    if (pressed[1] && !this.lastPadButtons[1]) this.keydown(new KeyboardEvent('keydown', { key: 'Escape' }))
    if (pressed[12] && !this.lastPadButtons[12]) this.focusRelative(-1)
    if (pressed[13] && !this.lastPadButtons[13]) this.focusRelative(1)
    this.lastPadButtons = pressed
  }

  private focusRelative(direction: number): void {
    const buttons = Array.from(this.root.querySelectorAll<HTMLButtonElement>('.is-active button:not([disabled])'))
    if (!buttons.length) return
    const index = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement))
    buttons[(index + direction + buttons.length) % buttons.length]?.focus()
  }

  private publicState(): object { const run = this.run; return run ? { screen: this.screen, phase: PHASES[run.phase], hoursLeft: run.hoursLeft, energy: run.energy, morale: run.morale, hype: run.hype, stability: run.stability, polish: run.polish, devlogs: run.devlogs, built: run.built.length, bugs: run.bugs.length, ended: Boolean(run.ended), score: run.score?.total } : { screen: this.screen } }

  private readStored(): { best?: number; tutorialSeen?: boolean } { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { best?: number; tutorialSeen?: boolean } } catch { return {} } }
  private saveSettings(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...this.readStored(), best: this.bestScore, tutorialSeen: this.tutorialSeen, settings: this.settings })) } catch { /* storage is optional */ } }
  private loadSettings(): void { const stored = this.readStored(); this.bestScore = stored.best ?? 0; this.tutorialSeen = stored.tutorialSeen ?? false; try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { settings?: SettingsState }; if (data.settings) this.settings = { ...this.settings, ...data.settings }; } catch { /* storage is optional */ } this.audio.setMuted(this.settings.muted); this.scene.setReducedMotion(this.settings.reducedMotion) }
  private persistBest(score: number): void { this.bestScore = Math.max(this.bestScore, score); this.saveSettings() }
}

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)) }
function formatClock(hours: number): string { const safe = Math.max(0, hours); const h = Math.floor(safe); const minutes = Math.floor((safe - h) * 60); return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` }
