import Discord from "discord.js";
import fetch from "node-fetch";
import { getCustomRepository } from "typeorm";
import { CharacterRepo, ProfessionRepo, CharacterProfessionRepo, SkillRepo, CharacterSkillRepo } from "./resolvers";
import { getConnection } from "./middleware";

const disc = new Discord.Client();

disc.on("ready", async () => {
    await getConnection();
    if (disc && disc.user) {
        console.log(`Logged in as ${disc.user.tag}!`);
    }
});

disc.on("message", async (msg: Discord.Message) => {
    let content = msg.content;

    const isMe = msg.author.username === "Cauldron";

    if (msg.attachments.size > 0) {
        const file = msg.attachments.first()!;
        const resp = await fetch(file.url);
        content = await resp.text();
    }

    if (!isMe && content === "ur mum gay") {
        msg.reply("no u"); // lol
    } else if (!isMe && content.substr(0, 9) === "!crafters") {
        await searchSkills(msg);
    } else if (!isMe && msg.channel.type == "dm" && content.substr(0, 7) === "!upload") {
        await uploadProfession(msg, content);
    }
});

disc.login(process.env.DISCORD_TOKEN);

async function searchSkills(msg: Discord.Message) {
    const startIdx = msg.content.indexOf("[");
    const endIdx = msg.content.lastIndexOf("]");
    if (startIdx < 0 || endIdx < 0 || endIdx - startIdx <= 3) {
        await msg.reply("I'm unable to read your query. Make sure your query is placed between brackets and is at least 3 characters long.");
        return;
    }

    const query = msg.content.substr((startIdx + 1), endIdx - (startIdx + 1));

    const skillRepo = getCustomRepository(SkillRepo);
    const skills = await skillRepo.findSkills(query);
    const matches = skills?.length || 0;

    if (!skills || matches === 0) {
        await msg.reply("I'm unable to find a crafter for your recipe. Perhaps the archives are incomplete.");
    } else if (matches > 1) {
        await msg.reply(`There are ${matches} recipe matches for your search. Try and be more specific.`)
    } else if (matches === 1) {
        const skill = skills[0];
        const charSkillRepo = getCustomRepository(CharacterSkillRepo);
        const charSkills = await charSkillRepo.findCharactersWithSkill(skill.id!);



        const characterRepo = getCustomRepository(CharacterRepo);
        const characters = await characterRepo.charactersBySkill(charSkills);

        let resp = `The following characters can craft [${skill.name}]:`;
        characters.forEach((char) => resp += "\n" + char.name);
        await msg.reply(resp);
    }
}

async function uploadProfession(msg: Discord.Message, content: string) {
    try {
        const raw = content.substring(7).trim();
        const { playerName, profession } = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as ProfessionUpload;

        const characterRepo = getCustomRepository(CharacterRepo);

        let char = await characterRepo.characterByName(playerName);
        if (!char) {
            await msg.reply(`${playerName} doesn't currently exist - adding an entry... :hourglass:`);
            char = await characterRepo.addCharacter(playerName);
        } else {
            await msg.reply(`Updating ${profession.name} entry for ${playerName}... :hourglass:`);
            await characterRepo.updateModified(char);
        }

        const professionRepo = getCustomRepository(ProfessionRepo);
        let prof = await professionRepo.professionByName(profession.name);
        if (!prof) {
            prof = await professionRepo.addProfession(profession.name);
        }

        const charProfRepo = getCustomRepository(CharacterProfessionRepo);
        let charProf = await charProfRepo.getCharacterProfession(char.id!, prof.id!);
        if (!charProf) {
            charProf = await charProfRepo.addCharacterProfession(char.id!, prof.id!, profession.rank);
        } else {
            charProfRepo.updateCharacterProfession(charProf)
        }

        const skillRepo = getCustomRepository(SkillRepo);
        // all newly-added skills
        const skills = await skillRepo.addSkills(profession.skills, prof.id!);

        const charSkillRepo = getCustomRepository(CharacterSkillRepo);
        await charSkillRepo.addCharacterSkills(skills, char.id!);

        await msg.reply("All done :slight_smile:");
    } catch (err) {
        msg.reply(`Something went wrong when trying to upload your data. Copy the following error message and send it to Meliora. Thanks!
${err}`);
    }
}
