import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: "public", name: "skill" })
export default class SkillModel {
    @PrimaryGeneratedColumn({ name: "id", type: "int" })
    public id?: number;

    @Column({ name: "name", type: "varchar", unique: true })
    public name!: string;

    @Column({ name: "profession_id", type: "int" })
    public professionId!: number;
}
