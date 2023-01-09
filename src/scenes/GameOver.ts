import Phaser from 'phaser';
import { WINDOW_CENTER } from '../constants';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload(): void {
        console.log("GO2");
        this.load.image('gameover_bg', 'assets/gameover.png');
        this.load.audio('gameovermusic', ['assets/audio/ld52-gameover.m4a', 'assets/audio/ld52-gameover.ogg']);
    }

    create(): void {
        this.sound.stopAll();
        this.sound.play('gameovermusic', { volume: 0.5, loop: true });

        const cx = WINDOW_CENTER.x;
        const cy = WINDOW_CENTER.y;

        this.add.image(cx, cy, 'gameover_bg');
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                this.cameras.main.fadeOut(1000);
            }
        });

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE as string, () => {
            this.sound.stopAll();
            this.scene.start('RadmarsScreen');
        });

        this.cameras.main.fadeIn(1000);
    }
}
