import { inject, singleton } from "tsyringe";
import { Environment } from "../app/environment";
import * as request from "request-promise-native";
import { TTSResponse } from "./tts-response";
import { container, injectable } from "tsyringe";
import { Log } from "../app/log";
import MemoryStream from 'memorystream';


@singleton()
export class Bumblebee {

    private token: string;
    private host: string;

    constructor(@inject(Environment) env: Environment){
        this.token = env.get('BUMBLEBEE_TOKEN');
        this.host = env.get('API_HOST', 'https://api.bmbl.cloud');
    }

    public async tts(message: string): Promise<TTSResponse | null>{
        const log = container.resolve(Log);
        const start = process.hrtime();

        let response = null;
        const options = {
            url: this.host + '/v1/tts?format=opus',
            body: { "text" : message },
            json: true,
            headers: { 'Authorization': this.token }
        };

        const data = await request.post(options);
        if(data && data.file){           
            const inMemoryStream = new MemoryStream();
            const stream = request.get(this.host + data.file).pipe(inMemoryStream);

            await new Promise(fullfill => stream.on('finish', () => {
                fullfill(null);
                return true; 
            }));

            let missingWords = data['fragments'].filter(function(item: any){
                return item && (item._id == undefined || item._id == null);
            })

            missingWords = missingWords.map(function(item: any){
                return (item.text !== undefined && item.text !== null) ? item.text : '';
            });

            response = new TTSResponse(inMemoryStream, missingWords);
        }

        const elapsed = process.hrtime(start);
        log.debug("Call took", elapsed[0], "s", "and", elapsed[1] / 1000000, 'ms')

        return response;
    }
}