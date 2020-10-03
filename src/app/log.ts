import { singleton, inject } from 'tsyringe';
import { Environment } from './environment';
import log4js, { Logger as Log4jsLogger } from 'log4js';

@singleton()
export class Log {

    private logger: Log4jsLogger

    constructor(@inject(Environment) private env: Environment) {
        this.logger = log4js.getLogger();
        this.logger.level = env.get('LOG_LEVEL');
    }

    public info(message: string, ...args: any[]): this {
        this.logger.info(message, ...args);
        return this;
    }

    public warn(message: string, ...args: any[]): this {
        this.logger.warn(message, ...args);
        return this;
    }

    public debug(message: string, ...args: any[]): this {
        this.logger.debug(message, ...args);
        return this;
    }

    public error(message: string, ...args: any[]): this {
        this.logger.error(message, ...args);
        return this;
    }

    public fatal(message: string, ...args: any[]): this {
        this.logger.fatal(message, ...args);
        return this;
    }
}