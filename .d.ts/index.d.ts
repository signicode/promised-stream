declare module "promised-stream";

import { Readable, Duplex, Transform, Writable, ReadableOptions, WritableOptions, TransformOptions } from 'stream';

interface PromisedReadableOptions<T> extends ReadableOptions {
    async read?(this: PromisedReadable<T>, size: number): T
}

export class PromisedReadable<T> extends Readable {
    constructor(options : PromisedReadableOptions<T>);

    async _read?(this: PromisedReadable<T>, size: number): T
    
    async whenEnd(): void
    async whenRead(size: number): T
    catch(handler: (error: Error) => Promise<T>) : PromisedReadable<T>

    tap() : TappedPromiseReadable<T, this>
    pipe(to: PromisedTransform<S>) : PromisedReadable<S>
}

class TappedPromiseReadable<T, Z extends PromiseTransform = PromisedTransform> extends PromisedReadable<T> {
    pipe(to: Z<S>) : Z<S>
}


interface PromisedWritableOptions<T> extends WritableOptions {
    async write?(this: PromisedWritable<T>, data: T): void;
}

export class PromisedWritable<T> extends Writable {
    constructor(options : PromisedWritableOptions<T>);

    async _write?(this: PromisedWritable<T>, data: T): void;

    async whenWrote(data: T) : void;
    async whenFinish() : void;
    catch(handler: (error: Error) => Promise<void>)
}


interface PromisedTransformOptions<T, S> extends TransformOptions {
    async transform?(this: PromisedTransform<T, S>, data: T): S;
}

export class PromisedTransform<T,S> extends Transform implements PromisedDuplex<T,S> {
    constructor(options : PromisedTransformOptions<T,S>)

    async _transform?(this: PromisedTransform<T, S>, data: T): S;

    tap() : TappedPromiseTransform<T,S>
    pipe(to: PromisedTransform<Z>) : PromisedTransform<T,Z>
}

class TappedPromiseTransform<T,S, Z extends PromisedTransform> extends PromisedTransform<T,S> implements TappedPromisedReadable<T, Z> {}

interface PromisedDuplexOptions<T,S> extends PromisedReadableOptions<T>, PromisedWritableOptions<S> {}

export class PromisedDuplex<T,S> extends Duplex implements PromisedReadable<T>, PromisedWritable<S> {
    constructor(options : PromisedDuplexOptions<T,S>)

    async whenWrote(data: T) : void;
    async whenFinish() : void;
    async whenEnd(): void
    async whenRead(size: number): T
    catch(handler: (error: Error, entry: T) => Promise<S>)
}


