interface EnemyBase {
    id: number;
    word: string;
    position: number;
    left: number;
    health: number;
    spawnTime: number;
    /** Indicates if spawned from remote PVP message */
    remote?: boolean;
}

export interface Zombie extends EnemyBase {
    type: 'zombie';
    speed: number; // pixels per tick or similar
}

export interface Mummy extends EnemyBase {
    type: 'mummy';
    speed: number;
}

export interface Bat extends EnemyBase {
    type: 'bat';
    speed: number;
}

export type Enemy = Zombie | Mummy | Bat;
