import { EntityRepository, In } from "typeorm";
import { Character, CharacterSkill } from "../models";
import AbstractResolver from "./AbstractResolver";

@EntityRepository(Character)
export class CharacterResolver extends AbstractResolver<Character> {
    public async characterById(id: number): Promise<Character> {
        return await this.findOneOrFail(Character, { where: { id } }, "short-cache");
    }

    public async charactersBySkill(skill: CharacterSkill[]): Promise<Character[]> {
        const charIds = skill.reduce((prev, curr) => {
            prev.push(curr.characterId);
            return prev;
        }, [] as number[]);

        return await this.find(Character, {
            where: {
                id: In(charIds)
            }
        })
    }

    public async characterByName(name: string): Promise<Character | undefined> {
        return await this.findOne(Character, { where: { name } }, "short-cache");
    }

    public async updateModified(character: Character): Promise<Character> {
        const chars = await this.update(Character, { name: character.name }, { modified: new Date() });
        if (chars.length === 1) {
            return chars[0];
        }
        throw new Error("Unable to update character.");
    }

    public async addCharacter(name: string): Promise<Character> {
        const chars = await this.insert(Character, {
            name
        });
        if (chars.length === 1) {
            return chars[0];
        }
        throw new Error("Unable to add character.");
    }

    public async allCharacters(): Promise<Character[]> {
        return await this.all(Character, "short-cache");
    }
}

export default CharacterResolver;
