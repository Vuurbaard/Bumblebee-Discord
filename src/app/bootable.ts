

export interface Bootable {
    boot(): Promise<this>;
    shutdown(): Promise<boolean>;
}