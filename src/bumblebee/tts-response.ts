export class TTSResponse {
    private file: string;
    private missingWords: Array<string>

    constructor(file: string, missingWords: Array<string>){
        this.file = file;
        this.missingWords = missingWords;
    }

    hasMissingWords(): boolean {
        return this.missingWords.length > 0;
    }

    
    public getMissingWords(): Array<string> {
        return this.missingWords;
    }

    public getFile(): string {
        return this.file;
    }
    
}