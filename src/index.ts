export { devMode };

import Phaser from 'phaser';
import RadmarsScreen from './scenes/RadmarsScreen';
import config from './config';

const urlParams = new URLSearchParams(window.location.search);
const devMode = urlParams.get('dev') === 'true' ? true : false;

const scenes: Phaser.Scene[] = [];
//if (devMode) {
//  scenes = [Main];
//} else {
  scenes.push(new RadmarsScreen());
//}

new Phaser.Game(
  Object.assign(config, {
    scene: scenes,
  })
);
