import { inject, singleton } from "tsyringe";
import { Environment } from "../app/environment";
import * as request from "request-promise-native";
import * as temp from 'temp';
import { TTSResponse } from "./tts-response";

@singleton()
export class Bumblebee {

    private token: string;
    private host: string;

    constructor(@inject(Environment) env: Environment){
        this.token = env.get('BUMBLEBEE_TOKEN');
        this.host = env.get('API_HOST', 'https://api.bmbl.cloud');
    }

    public async tts(message: string): Promise<TTSResponse | null>{
        const options = {
            url: this.host + '/v1/tts?format=opus',
            body: { "text" : message },
            json: true,
            headers: { 'Authorization': this.token }
        };

        const data = await request.post(options);
        if(data && data.file){
            const file = temp.createWriteStream({ suffix: '.opus' });
            const stream = request.get(this.host + data.file).pipe(file);

            await new Promise(fullfill => stream.on('finish', () => {
                fullfill()
            }));

            let missingWords = data['fragments'].filter(function(item: any){
                return item && (item._id == undefined || item._id == null);
            })

            missingWords = missingWords.map(function(item: any){
                return (item.text !== undefined && item.text !== null) ? item.text : '';
            });


            return new TTSResponse(file.path as string, missingWords);
        }

        return null;
    }
}