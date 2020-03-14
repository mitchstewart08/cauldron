import { EntityRepository, Repository } from "typeorm";
import { Profession } from "../models";
import AbstractResolver from "./AbstractResolver";

@EntityRepository(Profession)
export class ProfessionResolver extends AbstractResolver<Profession> {
    public async professionById(id: number): Promise<Profession> {
        return await this.findOneOrFail(Profession, { where: { id } }, "short-cache");
    }

    public async professionByName(name: string): Promise<Profession | undefined> {
        return await this.findOne(Profession, { where: { name } }, "short-cache");
    }

    public async addProfession(name: string): Promise<Profession> {
        const chars = await this.insert(Profession, {
            name
        });
        if (chars.length === 1) {
            return chars[0];
        }
        throw new Error("Unable to add profession.");
    }
}

export default ProfessionResolver;
