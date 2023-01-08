import Phaser from 'phaser';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './constants';

export default {
    type: Phaser.AUTO,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    pixelArt: true,
    physics: {
        default: 'arcade',
    },
};
