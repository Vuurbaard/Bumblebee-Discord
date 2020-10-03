export class CommandArguments {
    private rawArgs: string;
    private args: Map<string, string>;
    private arrayOfArgs: Array<string>;
    private additional: Map<string, any>


    constructor(args: string, signature: string){
        this.rawArgs = args;
        this.args = new Map<string, string>();
        this.additional = new Map<string, any>();
        this.arrayOfArgs = this.parse(signature);
    }

    /**
     * parse
     */
    private parse(signature: string): Array<string> {
        let rc = new Array<string>();

        const parser = /((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/g
        
        const matched = this.rawArgs.match(parser);

        if(matched && matched.length > 0){
            rc = matched.map(function(item: string) {
                let tmp = item;
                if(item.length >= 2 && item.substring(0,1) == '"' && item.substring(item.length - 1, item.length) == '"'){
                    tmp = item.slice(1, item.length - 1);
                }
                if(item.length >= 2 && item.substring(0,1) == '"' && item.substring(item.length - 1, item.length) == "'"){
                    tmp = item.slice(1, item.length - 1);
                }

                return tmp;
            });
        }

        // Check if our signature has matches in any order so we set those too
        // TODO: allow signatures

        return rc;
    }

    public argument(name: string): string | null{
        return this.args.get(name) ?? null;
    }
    
    /**
     * 
     */
    public arguments() {
        return this.arrayOfArgs;
    }

    public argumentMap() {
        return this.args;
    }

    /**
     * constructor()
     * name
     */
    public name() {
        
    }

}