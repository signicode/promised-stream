
import { Writable } from "stream";

export interface IBasePromiseWritableOptions<T> {
    highWaterMark?: number;
    decodeStrings?: boolean;
    defaultEncoding?: string;
    objectMode?: boolean;
    emitClose?: boolean;
    autoDestroy?: boolean;
    write(this: PromiseWritable<T>, data: T, encoding?: string): Promise<void>;
    writev(this: PromiseWritable<T>, chunks: Array<{ chunk: T, encoding?: string }>): Promise<void>;
    final(this: PromiseWritable<T>): Promise<void>;
}

export interface IPromiseWritableOptions<T> extends IBasePromiseWritableOptions<T> {
    destroy?(this: PromiseWritable<T>, error: Error | null): Promise<void>;
}

export type ChunkEncodingArray<T> = Array<{
    chunk: T;
    encoding: string;
}>;

export class BasePromiseWritable<T> extends Writable {
    constructor(options: IPromiseWritableOptions<T>);

    public _write(data: T, encoding?: string): Promise<void>;
    public _writev(chunks: ChunkEncodingArray<T>): Promise<void>;
    public _destroy(error: Error | null): Promise<void>;
    public _final(): Promise<void>;

    public whenWrote(data: T, encoding?: string): Promise<void>;
    public whenFinish(): Promise<void>;
}

export class PromiseWritable<T> extends BasePromiseWritable<T> {
    public whence(event: string): Promise<any>;
    public raise(error: Error, chunk?: T): Promise<any>;
    public catch(handler: (error: Error, chunk?: T) => Promise<void>);
}
