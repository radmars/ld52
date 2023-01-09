import { GameObjects, Tilemaps } from "phaser";
import { PlantTile, Tile, TILE_SIZE } from '../map/tiles';
import { build } from '../map/builder';
import { Harvester, make_harvester, update_harvester_position } from "../harvester";

interface GameState {
    tiles: Tile[][];
    map: Tilemaps.Tilemap;
    harvester: Harvester,
    hauling_text: GameObjects.Text;
    sold: number;
    sold_text: GameObjects.Text;
    up_key: Phaser.Input.Keyboard.Key,
    down_key: Phaser.Input.Keyboard.Key,
    left_key: Phaser.Input.Keyboard.Key,
    right_key: Phaser.Input.Keyboard.Key,

    healthy_text: GameObjects.Text;
    healthy_tiles: number;
    spores: Spore[];
}

interface Spore {
    image: GameObjects.Sprite,
    dx: number;
    dy: number;
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
        this.load.image('barn', 'assets/barn.png');
        this.load.spritesheet('spore', 'assets/spore.png', {
            frameWidth: 24,
            frameHeight: 24,
        });
        this.load.image('harvester', 'assets/harvester.png');

        this.load.audio('barn', ['assets/audio/barn.m4a', 'assets/audio/barn.ogg']);
        this.load.audio('brake', ['assets/audio/brake.m4a', 'assets/audio/brake.ogg']);
        this.load.audio('chop', ['assets/audio/chop.m4a', 'assets/audio/chop.ogg']);
        this.load.audio('harvest', ['assets/audio/harvest.m4a', 'assets/audio/harvest.ogg']);
        this.load.audio('harvestfail', ['assets/audio/harvestfail.m4a', 'assets/audio/harvestfail.ogg']);
        this.load.audio('infest', ['assets/audio/infest.m4a', 'assets/audio/infest.ogg']);
        this.load.audio('move', ['assets/audio/move.m4a', 'assets/audio/move.ogg']);
        this.load.audio('rotate', ['assets/audio/rotate.m4a', 'assets/audio/rotate.ogg']);
        this.load.audio('spore', ['assets/audio/spore.m4a', 'assets/audio/spore.ogg']);
        this.load.audio('music', ['assets/audio/ld52-main.m4a', 'assets/audio/ld52-main.ogg']);
    }

    create(): void {
        this.anims.create({
            key: "explode",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers("spore", { start: 0, end: 2 }),
        });
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

        const barnPosition = this.find_barn(tiles);
        const harvester = make_harvester(map, barnPosition.x, barnPosition.y, this.add);

        this.add.image(barnPosition.x * TILE_SIZE + TILE_SIZE / 2, barnPosition.y * TILE_SIZE, "barn");

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

        const healthy_text = this.add.text(800, 0, '', {
            font: '16px Rock Salt',
            color: '#ececec',
            stroke: '#000000',
            strokeThickness: 4,
        });
        healthy_text.setOrigin(1, 0);
        healthy_text.setScrollFactor(0);

        const game_state: GameState = {
            harvester,
            hauling_text,
            map,
            tiles,
            sold: 0,
            sold_text,
            up_key: this.input.keyboard.addKey('UP'),
            down_key: this.input.keyboard.addKey('DOWN'),
            left_key: this.input.keyboard.addKey('LEFT'),
            right_key: this.input.keyboard.addKey('RIGHT'),

            healthy_tiles: this.get_healthy_tiles(tiles),
            healthy_text,
            spores: [],
        };

        this.game_state = game_state;

        this.updateTiles();
        this.updateHUD();

        this.input.keyboard.on('keydown-SPACE', () => {
            this.makeSpore(game_state, harvester.sprite.x, harvester.sprite.y, 1, 0);
        });

        const music = this.sound.add('music', { volume: 0.5, loop: true });
        music.play();
    }

    find_barn(tiles: Tile[][]): {x: number, y: number} {
        for (let y = 0; y < tiles.length; y++) {
            const row = tiles[y];
            if (row) {
                for (let x = 0; x < row.length; x++) {
                    if (row[x]?.type == "barn") {
                        return {x, y};
                    }
                }
            }
        }

        throw new Error("NoBarnFound");
    }

    get_healthy_tiles(tiles: Tile[][]): number {
        let healthy = 0;
        for(const row of tiles) {
            for(const cell of row) {
                if(cell.type == 'plant' && cell.object.healthy()) {
                    healthy++;
                }
            }
        }
        return healthy;
    }

    updateHUD(): void {
        if (this.game_state) {
            this.game_state.hauling_text.setText(`Harvester carrying ${this.game_state.harvester.carrying} of ${this.game_state.harvester.limit} tons of meat`);
            this.game_state.sold_text.setText(`Sold ${this.game_state.sold} tons of meat`);
            this.game_state.healthy_text.setText(`${this.game_state.healthy_tiles} healthy plants remain`);
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
            this.game_state.healthy_tiles = this.get_healthy_tiles(this.game_state.tiles);
            this.updateHUD();
        }
    }

    makeSpore(state: GameState, x: number, y: number, dx: number, dy: number): void {
        const image = this.add.sprite(x, y, "spore", 0);
        state.spores.push({
            image,
            dx: dx * 0.1,
            dy: dy * 0.1,
        });
    }

    updateSpores(state: GameState, d: number): boolean {
        let updated = false;

        for (const spore of state.spores) {
            spore.image.x += d * spore.dx;
            spore.image.y += d * spore.dy;

            const destintationTile = state.map.getTileAtWorldXY(spore.image.x, spore.image.y, false) as Tilemaps.Tile | null;
            if (destintationTile) {
                const destinationType = state.tiles[destintationTile.y]?.[destintationTile.x];
                if (destinationType) {
                    let hit= false;
                    if (destinationType.type == "plant" && destinationType.object.canInfest() && !destinationType.object.isInfested()) {
                        destinationType.object.infest();
                        this.sound.play('infest');
                        updated = true;
                        hit = true;
                    }
                    else if (destinationType.type != 'plant') {
                        hit = true;
                    }

                    if(hit) {
                        state.spores = state.spores.filter(other => other != spore);
                        spore.image.play("explode");
                        spore.image.once(Phaser.Animations.Events.ANIMATION_COMPLETE as string, () => {
                            console.log("Destroy");
                            spore.image.destroy();
                        });
                    }
                }
            }
        }
 
        return updated;
    }

    updatePlantTile(state: GameState, delta: number, x: number, y: number, tile: PlantTile): boolean {
        let updated = false;
        const already_infested = tile.object.isInfested();

        if (tile.object.grow(delta)) {
            if(!already_infested && tile.object.canInfest()) {
                // Randomly pick a tile to infest.
                if (Math.random() * 150 > 149) {
                    tile.object.infest();
                    this.sound.play('infest');
                }
            }

            if (already_infested && tile.object.isLastStage()) {
                this.makeSpore(state, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 1, 0);
                this.makeSpore(state, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, -1, 0);
                this.makeSpore(state, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 0, 1);
                this.makeSpore(state, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 0, -1);
                this.sound.play('spore');
            }

            updated = true;
        }


        return updated;
    }

    override update(time: number, delta: number): void {
        super.update(time, delta);

        if (this.game_state) {
            const state = this.game_state;
            let updated = false;
            for (let y = 0; y < state.tiles.length; y++) {
                const row = state.tiles[y];
                if(row) {
                    for (let x = 0; x < row.length; x++) {
                        const tile = row[x];
                        if(tile &&tile.type == 'plant') {
                            if(this.updatePlantTile(state, delta, x, y, tile)) {
                                updated = true;
                            }
                        }
                    }
                }
            }

            if(this.updateSpores(state, delta)) {
                updated = true;
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

                else if (state.left_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x - TILE_SIZE,
                        state.harvester.sprite.y,
                        180,
                    );
                }

                else if (state.down_key.isDown) {
                    this.start_harvester_motion(
                        state,
                        state.harvester.sprite.x,
                        state.harvester.sprite.y + TILE_SIZE,
                        90,
                    );
                }

                else if (state.up_key.isDown) {
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

                if(this.game_state.healthy_tiles == 0) {
                    console.log("GO");
                    this.scene.start('GameOver');
                }
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
        let value = tile.object.harvest();
        if(harvester.carrying < harvester.limit) {
            value = harvester.limit - harvester.carrying - value > 0 ? value : harvester.limit - harvester.carrying;
            state.harvester.carrying += value;
            this.flash_text(harvester.sprite.x, harvester.sprite.y, `+${value}`);
            if (value == 100) {
                this.sound.play('harvest');
            }
            this.sound.play('chop', { volume : 0.25 });
        }
        else {
            this.flash_text(harvester.sprite.x, harvester.sprite.y, `Full! Go unload!`);
            this.sound.play('harvestfail', { volume: value / 100.0 });
            this.sound.play('chop', { volume : 0.25 });
        }
        this.updateHUD();
        this.updateTiles();
        this.cameras.main.shake(undefined, 0.005);
    }

    onTouchBarn(state: GameState): void {
        const hauling = state.harvester.carrying;
        state.sold += hauling;
        state.harvester.carrying = 0;
        this.flash_text(
            state.harvester.sprite.x,
            state.harvester.sprite.y,
            `Sold ${hauling} tons!`,
        );
        this.updateHUD();
        this.sound.play('brake');
        this.sound.play('barn');
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

        const destintationTile = state.map.getTileAtWorldXY(x, y, false) as Tilemaps.Tile | null;
        if (destintationTile == null) {
            return;
        }
        const destinationType = state.tiles [destintationTile.y]?. [destintationTile.x];
        if (destinationType != undefined && (destinationType.type == "plant" || destinationType.type == "barn")) {
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

            if (needs_rotate) {
                this.sound.play('rotate');
                this.time.addEvent(
                    {
                        delay: 200,
                        callback: () => {
                            this.sound.play('move', {volume: 0.5});
                        }
                    });
            }
            else {
                this.sound.play('move');
            }
        }
    }
}
