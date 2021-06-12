import MemoryStream from "memorystream";

export class TTSResponse {
  private stream: MemoryStream;
  private missingWords: Array<string>;

  constructor(stream: MemoryStream, missingWords: Array<string>) {
    this.stream = stream;
    this.missingWords = missingWords;
  }

  hasMissingWords(): boolean {
    return this.missingWords.length > 0;
  }

  public getMissingWords(): Array<string> {
    return this.missingWords;
  }

  public getStream(): MemoryStream {
    return this.stream;
  }
}
