import { inject, singleton } from "tsyringe";
import { Environment } from "../app/environment";
import * as request from "request-promise-native";
import * as temp from 'temp';

@singleton()
export class Bumblebee {

    private token: string;
    private host: string;

    constructor(@inject(Environment) env: Environment){
        this.token = env.get('BUMBLEBEE_TOKEN');
        this.host = env.get('API_HOST', 'https://api.bmbl.cloud');
    }

    public async tts(message: string){
        const options = {
            url: this.host + '/v1/tts',
            body: { "text" : message },
            json: true,
            headers: { 'Authorization': this.token }
        };

        let data = await request.post(options);
        if(data && data.file){
            let file = temp.createWriteStream({ suffix: '.mp3' });
            await request.get(this.host + data.file).pipe(file);

            return file.path as string;
        }

        return '';
    }
}