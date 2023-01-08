import { GameObjects, Tilemaps } from "phaser";

export interface Harvester {
    sprite: Phaser.GameObjects.Image;
    tile: Tilemaps.Tile,
}

export function make_harvester(map: Tilemaps.Tilemap, x: number, y: number, add: GameObjects.GameObjectFactory): Harvester {
    const sprite = add.image(x, y, 'harvester', 0);
    const tile = map.getTileAtWorldXY(x, y, true);
    return {
        sprite,
        tile,
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