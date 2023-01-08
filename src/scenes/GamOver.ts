import Phaser from 'phaser';
import { WINDOW_CENTER } from '../constants';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload(): void {
        this.load.image('bg', 'assets/gameover.png');
        this.load.audio('gameovermusic', ['assets/intro/radmarslogo.m4a', 'assets/intro/radmarslogo.ogg']);
    }

    create(): void {
        console.log("HIHIHIHI");
        this.sound.play('gameovermusic', { volume: 0.5 });

        const cx = WINDOW_CENTER.x;
        const cy = WINDOW_CENTER.y;

        this.add.image(cx, cy, 'bg');
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                this.cameras.main.fadeOut(1000);
            }
        });

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE as string, () => {
            this.scene.start('RadmarsScreen');
        });

        this.cameras.main.fadeIn(1000);
    }
}
