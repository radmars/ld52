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
        this.load.image('ground', 'assets/tiles/ground.png');
        this.load.image('plants', 'assets/tiles/plants.png');
        this.load.image('harvester', 'assets/harvester.png');
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

        const ground_tileset = this.map.addTilesetImage('ground', undefined, 96, 96);
        const plant_tileset = this.map.addTilesetImage('plants', undefined, 96, 96);

        const ground = this.map.createBlankLayer('ground', ground_tileset);
        ground.fill(0, 0, 0, this.map.width, this.map.height);

        const plants = this.map.createBlankLayer('plants', plant_tileset);
        plants.fill(0, 0, 0, this.map.width, this.map.height);

        this.updateTiles();

        const harvester = this.add.image(WINDOW_CENTER.x, WINDOW_CENTER.y, 'harvester', 0);
        this.harvester = harvester;
        this.cameras.main.setBounds(0, 0, TILE_SIZE * this.map.width, TILE_SIZE * this.map.height);
        // TODO: Set Deadzone for harvester?
        this.cameras.main.startFollow(this.harvester);

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