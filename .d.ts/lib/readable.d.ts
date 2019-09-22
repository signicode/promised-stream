import { Readable } from "stream";
import { PromiseEmitter } from "./emitter";
import { PromiseTransform, PromiseTransformCallback } from "./transform";

type PromiseReadableCallback<T> = (this: PromiseReadable<T>, size: number) => T | Promise<T>;
type PromiseReadableDestroyHandler<T> = (this: PromiseReadable<T>, error: Error | null) => Promise<void>;
type PromiseReadableCatchHandler<T> = (error: Error, data?: any, chunk?: T) => Promise<T>;

export interface IBasePromiseReadableOptions<T> {
    highWaterMark?: number;
    encoding?: string;
    objectMode?: boolean;
    autoDestroy?: boolean;
    read?: PromiseReadableCallback<T>;
    transforms?: Array<PromiseTransformCallback<any, any>>;
    followOrder?: boolean;
}

export interface IPromiseReadableOptions<T> extends IBasePromiseReadableOptions<T> {
    destroy?: PromiseReadableDestroyHandler<T>;
}

export class BasePromiseReadable<T> extends Readable {

    public _read: PromiseReadableCallback<T>;
    public _destroy: PromiseReadableDestroyHandler<T>;

    constructor(options: IPromiseReadableOptions<T>);

    public whenEnd(): Promise<void>;
    public whenRead(size: number): Promise<T>;

    public pipe<S>(destination: PromiseTransform<T, S>, options?: { end?: boolean; }): PromiseReadable<S>;
    public pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
}

export class PromiseReadable<T> extends BasePromiseReadable<T> implements PromiseEmitter {
    public _options: IBasePromiseReadableOptions<T>;

    public tap(): TappedPromiseReadable<T>;

    public whence(event: string): Promise<any>;
    public raise(error: Error, chunk?: T): Promise<T>;
    public catch(handler: PromiseReadableCatchHandler<T>): this;
}

export class TappedPromiseReadable<T> extends PromiseReadable<T> {
    /** @override */
    public pipe<S, Z extends PromiseTransform<T, S>>(destination: Z, options?: { end?: boolean; }): Z;
}
