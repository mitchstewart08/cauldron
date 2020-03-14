import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: "public", name: "profession" })
export default class CharacterModel {
    @PrimaryGeneratedColumn({ name: "id", type: "int" })
    public id?: number;

    @Column({ name: "name", type: "varchar", unique: true })
    public name!: string;

    @Column({ name: "created", type: "timestamp" })
    public created?: Date;
}
