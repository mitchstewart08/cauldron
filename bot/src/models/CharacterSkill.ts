import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "public", name: "character_skill" })
export default class CharacterProfessionModel {
    @PrimaryColumn({ name: "character_id", type: "int" })
    public characterId!: number;

    @PrimaryColumn({ name: "skill_id", type: "int" })
    public skillId!: number;

    @Column({ name: "created", type: "timestamp" })
    public created?: Date;
}
