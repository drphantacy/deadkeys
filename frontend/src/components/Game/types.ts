interface EnemyBase {
    id: number;
    word: string;
    position: number;
    left: number;
    health: number;
    spawnTime: number;
}

export interface Zombie extends EnemyBase {
    type: 'zombie';
    speed: number; // pixels per tick or similar
}

export interface Mummy extends EnemyBase {
    type: 'mummy';
    speed: number;
}

export type Enemy = Zombie | Mummy;

