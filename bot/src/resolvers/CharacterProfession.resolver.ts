import { EntityRepository, } from "typeorm";
import { CharacterProfession } from "../models";
import AbstractResolver from "./AbstractResolver";

@EntityRepository(CharacterProfession)
export class ProfessionResolver extends AbstractResolver<CharacterProfession> {

    public async getCharacterProfession(characterId: number, professionId: number): Promise<CharacterProfession | undefined> {
        return await this.findOne(CharacterProfession, {
            where: {
                characterId,
                professionId
            }
        });
    }

    public async addCharacterProfession(characterId: number, professionId: number, rank?: number): Promise<CharacterProfession> {
        const chars = await this.insert(CharacterProfession, {
            characterId,
            professionId,
            rank
        });
        if (chars.length === 1) {
            return chars[0];
        }
        throw new Error("Unable to add profession.");
    }

    public async updateCharacterProfession(charProf: CharacterProfession): Promise<CharacterProfession> {
        const chars = await this.update(CharacterProfession, {
            characterId: charProf.characterId,
            professionId: charProf.professionId
        }, {
            rank: charProf.rank,
            modified: new Date()
        });
        if (chars.length === 1) {
            return chars[0];
        }
        throw new Error("Unable to update profession.");
    }
}

export default ProfessionResolver;
