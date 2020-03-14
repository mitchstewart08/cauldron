
interface ProfessionUpload {
    locale: string;
    playerName: string;
    profession: {
        name: string;
        rank: number;
        skills: {
            name: string,
            reagants: Object
        }[]
    }
}
