
import { BasePromiseReadable, IBasePromiseReadableOptions } from "./readable.d";
import { BasePromiseWritable, IBasePromiseWritableOptions } from "./writable.d";

import { Transform } from "stream";
export type PromiseTransformCallback<T, S> = (data: T) => Promise<S> | null;
export type PromiseTransformHandler<T, S> = (error: Error, data?: any, chunk?: T) => Promise<S> | null;

type PromiseTransformEntry<T, S> =  [PromiseTransformCallback<T, S>, PromiseTransformHandler<T, S>];

export interface IPromiseTransformOptions<T, S> extends IBasePromiseReadableOptions<T>, IBasePromiseWritableOptions<S> {
    transforms?: [] |
    [PromiseTransformCallback<T, S>] |
    Array<PromiseTransformCallback<any, any>>
    ;
    flush?(this: PromiseTransform<T, S>): Promise<void>;
    transform?(this: PromiseTransform<T, S>, data: T, encoding: string): Promise<S>;
}

export class BasePromiseTransform<T, S> extends Transform implements BasePromiseReadable<T>, BasePromiseWritable<S> {

    constructor(options: IPromiseTransformOptions<T, S>)

    public _getTransforms():
        [] |
        [PromiseTransformEntry<T, S>] |
        [PromiseTransformEntry<T, any>, PromiseTransformEntry<any, S>] |
        [PromiseTransformEntry<T, any>, PromiseTransformEntry<any, any>, PromiseTransformEntry<any, S>]
    ;
    public _pushTransforms(...transforms: Array<PromiseTransformCallback<T, S>>): this;
    public _pushHandlers(...handlers: Array<PromiseTransformHandler<T, S>>): this;

    public _transform(data: T): Promise<S>;

    public _read(size: number): Promise<T>;
    public _write(data: S, encoding?: string): Promise<void>;
    public _writev(chunks: Array<{ chunk: S, encoding: string }>): Promise<void>;
    public _flush(): Promise<void>;
    public _destroy(error: Error | null): Promise<void>;
    public _final(): Promise<void>;

    public whenWrote(data: S, encoding: string): Promise<void>;
    public whenFinish(): Promise<void>;

    public whenEnd(): Promise<void>;
    public whenRead(size: number): Promise<T>;

    public pipe<U>(destination: PromiseTransform<S, U>, options?: { end?: boolean; }): PromiseTransform<T, U>;
    public pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;

}

export class PromiseTransform<T, S> extends BasePromiseTransform<T, S> {
    public _options: IPromiseTransformOptions<T, S>;

    public tap(): TappedPromiseTransform<T, S>;

    public whence(event: string): Promise<any>;
    public raise(error: Error, chunk?: T): Promise<any>;
    public catch(handler: PromiseTransformHandler<T, S>): PromiseTransform<T, S>;
}

export class TappedPromiseTransform<T, S> extends PromiseTransform<T, S> {
    public pipe<U>(destination: PromiseTransform<S, U>, options?: { end?: boolean; }): PromiseTransform<T, U>;
    public pipe<U, Z extends PromiseTransform<T, U>>(destination: Z, options?: { end?: boolean; }): Z;
}
