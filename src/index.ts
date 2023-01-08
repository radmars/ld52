import Phaser from 'phaser';
import RadmarsScreen from './scenes/RadmarsScreen';
import config from './config';
import { TileScreen } from './scenes/TileScreen';

const urlParams = new URLSearchParams(window.location.search);
const devMode = urlParams.get('dev') === 'true' ? true : false;

const scenes: Phaser.Scene[] = [];
if (!devMode) {
    scenes.push(new RadmarsScreen());
}

scenes.push(new TileScreen());

new Phaser.Game(
    Object.assign(config, {
        scene: scenes,
    })
);
