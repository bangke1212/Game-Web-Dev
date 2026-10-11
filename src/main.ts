import './styles/main.css'
import { JamRushApp } from './gamejam'

const root = document.getElementById('ui')
const canvas = document.getElementById('game')

if (!root || !canvas || !(canvas instanceof HTMLCanvasElement)) {
  throw new Error('JAMRUSH mount points are missing')
}

new JamRushApp(root, canvas).start()
