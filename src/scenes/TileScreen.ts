import { GameObjects, Tilemaps } from "phaser";
import { WINDOW_CENTER } from "../constants";
import { Tile, TILE_SIZE } from '../map/tiles';
import { build } from '../map/builder';

interface GameState {
    tiles: Tile[][];
    map: Tilemaps.Tilemap;
    harvester: Phaser.GameObjects.Image;
    hauling_text: GameObjects.Text;
    hauling: number;
}

export class TileScreen extends Phaser.Scene {
    private game_state?: GameState;

    constructor() {
        super('TileScreen');
    }

    preload(): void {
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        this.load.image('ground', 'assets/tiles/ground.png');
        this.load.image('plants', 'assets/tiles/plants.png');
        this.load.image('harvester', 'assets/harvester.png');
    }

    create(): void {
        const tiles = build();
        const first_row = tiles[0];
        if (!first_row) {
            throw new Error("Must have failed to parse map!");
        }
        const map = this.make.tilemap({
            key: 'map',
            width: first_row.length,
            height: tiles.length,
            tileWidth: 32,
            tileHeight: 32,
        });

        const ground_tileset = map.addTilesetImage('ground', undefined, 96, 96);
        const plant_tileset = map.addTilesetImage('plants', undefined, 96, 96);

        const ground = map.createBlankLayer('ground', ground_tileset);
        ground.fill(0, 0, 0, map.width, map.height);

        const plants = map.createBlankLayer('plants', plant_tileset);
        plants.fill(0, 0, 0, map.width, map.height);

        const harvester = this.add.image(WINDOW_CENTER.x, WINDOW_CENTER.y, 'harvester', 0);
        this.cameras.main.setBounds(0, 0, TILE_SIZE * map.width, TILE_SIZE * map.height);
        // TODO: Set Deadzone for harvester?
        this.cameras.main.startFollow(harvester);

        const hauling_text = this.add.text(0, 0, '', {
            font: '16px Rock Salt',
            color: '#ececec',
            stroke: '#000000',
            strokeThickness: 4,
        });

        hauling_text.setScrollFactor(0);

        const game_state: GameState = {
            harvester,
            hauling_text,
            map,
            tiles,
            hauling: 0,
        };

        this.game_state = game_state;

        this.updateTiles();
        this.updateHUD();

        this.input.keyboard.on('keydown-RIGHT', () => {
            harvester.x += 3;
        });

        this.input.keyboard.on('keydown-LEFT', () => {
            harvester.x -= 3;
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            harvester.y += 3;
        });

        this.input.keyboard.on('keydown-UP', () => {
            harvester.y -= 3;
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            game_state.hauling += 10;
            this.updateHUD();

            const text_flash = this.add.text(harvester.x, harvester.y, '+10!', {
                font: '16px Rock Salt',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4,
            });
            this.add.tween({
                targets: text_flash,
                duration: 1500,
                alpha: 0,
                ease: 'linear',
            });
            this.add.tween({
                targets: text_flash,
                duration: 1500,
                x: harvester.x + 80 + (Math.random() * 50 - 25),
                y: harvester.y - 80 + (Math.random() * 50 - 25),
                ease: 'Expo.easeOut',
                onComplete: (_, targets: [GameObjects.Text]) => {
                    console.log("Text should be dead now");
                    targets[0].destroy();
                },
            });
            this.cameras.main.shake();
        });
    }

    updateHUD(): void {
        if(this.game_state) {
            this.game_state.hauling_text.setText(`Hauling ${this.game_state.hauling} tons of meat`);
        }
    }

    updateTiles(): void {
        if (this.game_state) {
            const layer = this.game_state.map.getLayer("plants")
                .tilemapLayer;
            this.game_state.tiles.forEach((row, y) => {
                row.forEach((tile, x) => {
                    layer.getTileAt(x, y).index = tile.object.current();
                });
            });
        }
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        if(this.game_state) {
            let updated = false;
            for (const row of this.game_state.tiles) {
                for (const tile of row) {
                    if (tile.type == 'plant') {
                        if (tile.object.grow(delta)) {
                            updated = true;
                        }
                    }
                }
            }

            if (updated) {
                this.updateTiles();
            }
        }
    }
}