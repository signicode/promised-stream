
export interface IPromiseEmitter {
    whence(event: string): Promise<any>;
    raise(error: Error): Promise<any>;
    catch(handler: (error: Error) => Promise<any>): this;
}
