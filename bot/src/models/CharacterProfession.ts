import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ schema: "public", name: "character_profession" })
export default class CharacterProfessionModel {
    @PrimaryColumn({ name: "character_id", type: "int" })
    public characterId!: number;

    @PrimaryColumn({ name: "profession_id", type: "int" })
    public professionId!: number;

    @Column({ name: "rank", type: "int" })
    public rank?: number;

    @Column({ name: "created", type: "timestamp" })
    public created?: Date;

    @Column({ name: "modified", type: "timestamp" })
    public modified?: Date;
}
