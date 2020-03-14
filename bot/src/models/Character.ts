import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: "public", name: "character" })
export default class CharacterModel {
    @PrimaryGeneratedColumn({ name: "id", type: "int" })
    public id?: number;

    @Column({ name: "name", type: "varchar", unique: true })
    public name!: string;

    @Column({ name: "created", type: "timestamp" })
    public created?: Date;

    @Column({ name: "modified", type: "timestamp" })
    public modified?: Date;
}
