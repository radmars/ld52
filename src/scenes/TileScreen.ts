import { Tilemaps } from "phaser";
import { WINDOW_CENTER } from "../constants";
import { Tile, TILE_SIZE } from '../map/tiles';
import { build } from '../map/builder';

export class TileScreen extends Phaser.Scene {
    tiles: Tile[][];
    map?: Tilemaps.Tilemap;
    harvester?: Phaser.GameObjects.Image;

    constructor() {
        super('TileScreen');
        this.tiles = build();
    }

    preload(): void {
        this.load.image('tiles', 'assets/tiles/tiles.png');
        this.load.image('einstein', 'assets/harvester.png');
    }

    create(): void {
        const first_row = this.tiles[0];
        if (!first_row) {
            throw new Error("Must have failed to parse map!");
        }

        this.map = this.make.tilemap({
            key: 'map',
            width: first_row.length,
            height: this.tiles.length,
            tileWidth: 32,
            tileHeight: 32,
        });

        const harvester = this.add.image(WINDOW_CENTER.x, WINDOW_CENTER.y, 'harvester');
        this.harvester = harvester;

        const tileset = this.map.addTilesetImage('tiles', undefined, 32, 32);

        const plants = this.map.createBlankLayer('plants', tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.cameras.main.setBounds(0, 0, TILE_SIZE * this.map.width, TILE_SIZE * this.map.height);
        // Set Deadzone for harvester?
        this.cameras.main.startFollow(this.harvester);

        this.updateTiles();
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
            console.log('right up!');
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.cameras.main.shake();
        });
    }

    updateTiles(): void {
        if (this.map) {
            const layer = this.map.getLayer("plants")
                .tilemapLayer;
            this.tiles.forEach((row, y) => {
                row.forEach((tile, x) => {
                    layer.getTileAt(x, y).index = tile.object.current();
                });
            });
        }
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        let updated = false;
        for (const row of this.tiles) {
            for (const tile of row) {
                if (tile.type == 'plant') {
                    if (tile.object.evolve(delta)) {
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