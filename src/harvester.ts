import { GameObjects, Tilemaps, Tweens } from "phaser";
import { TILE_SIZE } from "./map/tiles";

export interface Harvester {
    sprite: Phaser.GameObjects.Image;
    tile: Tilemaps.Tile,
    current_motion: Tweens.Tween | null;
}

// TILE POSITION
export function make_harvester(map: Tilemaps.Tilemap, x: number, y: number, add: GameObjects.GameObjectFactory): Harvester {
    const sprite = add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'harvester', 0);
    const tile = map.getTileAt(x, y);
    return {
        sprite,
        tile,
        current_motion: null,
    };
}

function transform_harvester_position(harvester: Harvester, map: Tilemaps.Tilemap): Tilemaps.Tile {
    return map.getTileAtWorldXY(
        harvester.sprite.x,
        harvester.sprite.y,
        true,
    );
}

export function update_harvester_position(harvester: Harvester, map: Tilemaps.Tilemap): boolean {
    const pos = transform_harvester_position(harvester, map);
    if(harvester.tile.x != pos.x || harvester.tile.y != pos.y) {
        harvester.tile = pos;
        return true;
    }
    return false;
}