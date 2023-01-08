import { GameObjects, Tilemaps } from "phaser";
import { PlantTile, Tile, TILE_SIZE } from '../map/tiles';
import { build } from '../map/builder';
import { Harvester, make_harvester, update_harvester_position } from "../harvester";

interface GameState {
    tiles: Tile[][];
    map: Tilemaps.Tilemap;
    harvester: Harvester,
    hauling_text: GameObjects.Text;
    hauling: number;
    sold: number;
    sold_text: GameObjects.Text;
    up_key: Phaser.Input.Keyboard.Key,
    down_key: Phaser.Input.Keyboard.Key,
    left_key: Phaser.Input.Keyboard.Key,
    right_key: Phaser.Input.Keyboard.Key,
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
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });

        const ground_tileset = map.addTilesetImage('ground', undefined, TILE_SIZE, TILE_SIZE);
        const plant_tileset = map.addTilesetImage('plants', undefined, TILE_SIZE, TILE_SIZE);

        const ground = map.createBlankLayer('ground', ground_tileset);
        ground.fill(0, 0, 0, map.width, map.height);

        const plants = map.createBlankLayer('plants', plant_tileset);
        plants.fill(0, 0, 0, map.width, map.height);

        const harvester = make_harvester(map, 4, 4, this.add);

        // TODO: Set Deadzone for harvester?
        this.cameras.main.setBounds(0, 0, TILE_SIZE * map.width, TILE_SIZE * map.height);
        this.cameras.main.startFollow(harvester.sprite);

        const hauling_text = this.add.text(0, 0, '', {
            font: '16px Rock Salt',
            color: '#ececec',
            stroke: '#000000',
            strokeThickness: 4,
        });
        hauling_text.setScrollFactor(0);

        const sold_text = this.add.text(0, 36, '', {
            font: '16px Rock Salt',
            color: '#ececec',
            stroke: '#000000',
            strokeThickness: 4,
        });
        sold_text.setScrollFactor(0);


        const game_state: GameState = {
            harvester,
            hauling_text,
            map,
            tiles,
            hauling: 0,
            sold: 0,
            sold_text,
            up_key: this.input.keyboard.addKey('UP'),
            down_key: this.input.keyboard.addKey('DOWN'),
            left_key: this.input.keyboard.addKey('LEFT'),
            right_key: this.input.keyboard.addKey('RIGHT'),
        };

        this.game_state = game_state;

        this.updateTiles();
        this.updateHUD();

        this.input.keyboard.on('keydown-B', () => {
            this.onTouchBarn(game_state);
        });
    }

    updateHUD(): void {
        if (this.game_state) {
            this.game_state.hauling_text.setText(`Hauling ${this.game_state.hauling} tons of meat`);
            this.game_state.sold_text.setText(`Sold ${this.game_state.sold} tons of meat`);
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

        if (this.game_state) {
            const state = this.game_state;
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


            if(!state.harvester.current_motion) {
                if (state.right_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x + TILE_SIZE,
                        state.harvester.sprite.y,
                        0,
                    );
                }

                if (state.left_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x - TILE_SIZE,
                        state.harvester.sprite.y,
                        180,
                    );
                }

                if (state.down_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x,
                        state.harvester.sprite.y + TILE_SIZE,
                        90,
                    );
                }

                if (state.up_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x,
                        state.harvester.sprite.y - TILE_SIZE,
                        -90,
                    );
                }
            }

            const changed_tile = update_harvester_position(this.game_state.harvester, this.game_state.map);
            if (changed_tile) {
                // Update tiles anyway just in case.
                updated = true;
                this.onMovedTiles(this.game_state);
            }

            if (updated) {
                this.updateTiles();
            }
        }
    }

    onMovedTiles(state: GameState): void {
        const map_tile = state.harvester.tile;
        const tile = state.tiles[map_tile.y]?.[map_tile.x];

        if (tile) {
            switch (tile.type) {
            case 'barn':
                this.onTouchBarn(state);
                break;
            case 'plant':
                this.onTouchPlant(state, tile);
                break;
            }
        }
    }

    onTouchPlant(state: GameState, tile: PlantTile): void {
        const harvester = state.harvester;
        const value = tile.object.harvest();
        state.hauling += value;
        this.updateHUD();
        this.updateTiles();
        this.flash_text(harvester.sprite.x, harvester.sprite.y, `+${value}`);
        this.cameras.main.shake(undefined, 0.005);
    }

    onTouchBarn(state: GameState): void {
        const hauling = state.hauling;
        state.sold += hauling;
        state.hauling = 0;
        this.flash_text(
            state.harvester.sprite.x,
            state.harvester.sprite.y,
            `Sold ${hauling} tons!`,
        );
        this.updateHUD();
    }

    flash_text(x: number, y: number, text: string): void {
        const text_flash = this.add.text(x, y, text, {
            font: '16px Rock Salt',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        this.add.tween({
            targets: text_flash,
            duration: 1500,
            alpha: 0,
            ease: 'linear',
        });
        const white = Phaser.Display.Color.HexStringToColor("#FFFFFF");
        const red = Phaser.Display.Color.HexStringToColor("#FF0000");
        this.tweens.addCounter({
            from: 0,
            to: 100,
            yoyo: true,
            duration: 75,
            repeat: 50,
            onUpdate: (tween) => {
                const tint = Phaser.Display.Color.Interpolate.ColorWithColor(
                    white,
                    red,
                    100,
                    tween.getValue()
                );
                const color = Phaser.Display.Color.ObjectToColor(tint).color;
                text_flash.setTint(color, color, color, color);
            },
        });
        this.add.tween({
            targets: text_flash,
            duration: 1500,
            x: x + 80 + (Math.random() * 50 - 25),
            y: y - 80 + (Math.random() * 50 - 25),
            ease: 'Expo.easeOut',
            onComplete: (_, targets: [GameObjects.Text]) => {
                targets[0].destroy();
            },
        });
    }

    start_harvester_motion(state: GameState, x: number, y: number, angle: number): void{
        const shortest = Phaser.Math.Angle.ShortestBetween(angle, state.harvester.sprite.angle);
        const needs_rotate = shortest >= 1 || shortest <= -1;
        const newAngle = state.harvester.sprite.angle - shortest;

        state.harvester.current_motion = this.add.tween({
            targets: state.harvester.sprite,
            y: {
                value: y,
                ease: 'linear',
                duration: 500,
                delay: needs_rotate ? 200 : 0,
            },
            x: {
                value: x,
                ease: 'linear',
                duration: 500,
                delay: needs_rotate ? 200 : 0,
            },
            angle: {
                value: newAngle,
                duration: needs_rotate ? 200 : 0,
            },
            onComplete: () => {
                state.harvester.current_motion = null;
            },
        });
    }
}