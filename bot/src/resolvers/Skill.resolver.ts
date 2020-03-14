import { EntityRepository, Raw } from "typeorm";
import { Skill } from "../models";
import AbstractResolver from "./AbstractResolver";

@EntityRepository(Skill)
export class SkillResolver extends AbstractResolver<Skill> {
    public async addSkills(skills: Array<{ name: string }>, professionId: number): Promise<Skill[]> {
        const ret: Skill[] = [];
        for (let i = 0; i < skills.length; i++) {
            ret.push(await this.addSkill(skills[i].name, professionId));
        }
        return ret;
    }

    public async skillByName(name: string): Promise<Skill | undefined> {
        return await this.findOne(Skill, { where: { name } }, "short-cache");
    }

    public async findSkills(name: string): Promise<Skill[] | undefined> {
        return await this.find(Skill, {
            where: {
                name: Raw((alias) => `${alias} ilike '%${name}%'`)
            }
        });
    }

    public async addSkill(name: string, professionId: number): Promise<Skill> {
        const skill = await this.skillByName(name);
        let ret: Skill[] = [skill!];
        if (!skill) {
            ret = await this.insert(Skill, {
                name,
                professionId
            });
        }
        if (ret!.length === 1) {
            return ret![0];
        }
        throw new Error("Unable to add skill.");
    }
}

export default SkillResolver;
