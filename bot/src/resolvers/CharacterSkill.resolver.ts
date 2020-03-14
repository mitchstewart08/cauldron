import { EntityRepository, } from "typeorm";
import { CharacterSkill, Skill } from "../models";
import AbstractResolver from "./AbstractResolver";

@EntityRepository(CharacterSkill)
export class SkillResolver extends AbstractResolver<CharacterSkill> {

    public async getCharacterSkill(characterId: number, skillId: number): Promise<CharacterSkill | undefined> {
        return await this.findOne(CharacterSkill, {
            where: {
                characterId,
                skillId
            }
        });
    }

    public async findCharactersWithSkill(skillId: number): Promise<CharacterSkill[]> {
        return await this.find(CharacterSkill, {
            where: {
                skillId
            }
        })
    }

    public async addCharacterSkills(skills: Skill[], characterId: number): Promise<CharacterSkill[]> {
        const ret: CharacterSkill[] = [];
        for (let i = 0; i < skills.length; i++) {
            ret.push(await this.addCharacterSkill(characterId, skills[i].id!));
        }
        return ret;
    }

    public async addCharacterSkill(characterId: number, skillId: number): Promise<CharacterSkill> {
        let skill = await this.getCharacterSkill(characterId, skillId);

        if (!skill) {
            const chars = await this.insert(CharacterSkill, {
                characterId,
                skillId
            });
            if (chars.length === 1) {
                skill = chars[0];
            }
        }
        return skill!;
    }
}

export default SkillResolver;
