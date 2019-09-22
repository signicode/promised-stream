import { Duplex } from "stream";
import { BasePromiseReadable, IBasePromiseReadableOptions, PromiseReadable, TappedPromiseReadable } from "./readable.d";
import { PromiseTransform } from "./transform.d";
import { BasePromiseWritable, IBasePromiseWritableOptions, PromiseWritable } from "./writable.d";

interface IPromiseDuplexOptions<T, S> extends IBasePromiseReadableOptions<T>, IBasePromiseWritableOptions<S> {
    allowHalfOpen?: boolean;
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;

    read(this: PromiseReadable<T>, size: number): T | Promise<T>;
    write(this: PromiseWritable<S>, data: S, encoding?: string): Promise<void>;
    writev(this: PromiseWritable<S>, chunks: Array<{ chunk: S, encoding?: string }>): Promise<void>;
    final(this: PromiseWritable<S>): Promise<void>;

    destroy(this: PromiseDuplex<T, S>, error: Error | null): Promise<void>;
}

export class PromiseDuplex<T, S> extends Duplex implements BasePromiseReadable<T>, BasePromiseWritable<S> {
    constructor(options: IPromiseDuplexOptions<T, S>)

    public _write(data: S, encoding?: string): Promise<void>;
    public _writev(chunks: Array<{ chunk: S, encoding: string }>): Promise<void>;
    public _read(size: number): Promise<T>;
    public _destroy(error: Error | null): Promise<void>;
    public _final(): Promise<void>;

    public whenWrote(data: S, encoding: string): Promise<void>;
    public whenFinish(): Promise<void>;

    public tap(): TappedPromiseReadable<T>;

    public whenEnd(): Promise<void>;
    public whenRead(size: number): Promise<T>;

    public pipe<U>(destination: PromiseTransform<T, U>, options?: { end?: boolean; }): PromiseReadable<U>;
    public pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;

    public raise(error: Error, chunk?: T | S): Promise<any>;
    public catch(handler: (error: Error) => Promise<void>): PromiseDuplex<T, S>;
}
