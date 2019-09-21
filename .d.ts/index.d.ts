declare module "promised-stream" {

    import { Readable, Duplex, Transform, Writable, ReadableOptions, WritableOptions, TransformOptions, TransformCallback } from 'stream';
    import { EventEmitter } from "events";

    interface PromiseEmitter {


        whence(event: string): Promise<any>;
        raise(error: Error): Promise<any>;
        catch(handler: (error: Error) => Promise<any>): this;
    }

    interface BasePromiseReadableOptions<T> {
        highWaterMark?: number;
        encoding?: string;
        objectMode?: boolean;
        autoDestroy?: boolean;
        read?(this: PromiseReadable<T>, size: number): T | Promise<T>
        transforms?: [] | [(data: T) => Promise<any>?, (e: Error) => Promise<any>?] | [[(data: T) => Promise<any>, (e: Error) => Promise<any>?], ...[(data: any) => Promise<any>, (e: Error) => Promise<any>?]];
    }

    interface PromiseReadableOptions<T> extends BasePromiseReadableOptions<T> {
        destroy?(this: PromiseReadable<T>, error: Error | null): Promise<void>;
    }

    class BasePromiseReadable<T> extends Readable {
        constructor(options: PromiseReadableOptions<T>);

        _read(size: number): Promise<T>

        whenEnd(): Promise<void>
        whenRead(size: number): Promise<T>
        tap(): TappedPromiseReadable<T>
        
        pipe<S>(destination: PromiseTransform<T, S>, options?: { end?: boolean; }): PromiseReadable<S>
        pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
    }
    
    export class PromiseReadable<T> extends BasePromiseReadable<T> implements PromiseEmitter {
        whence(event: string): Promise<any>;
        raise(error: Error): Promise<T>;
        catch(handler: (error: Error, data: any) => Promise<T>): this
    }

    class TappedPromiseReadable<T> extends PromiseReadable<T> {
        /** @override */
        pipe<S, Z extends PromiseTransform<T, S>>(destination: Z, options?: { end?: boolean; }): Z
    }

    interface BasePromiseWritableOptions<T> {
        highWaterMark?: number;
        decodeStrings?: boolean;
        defaultEncoding?: string;
        objectMode?: boolean;
        emitClose?: boolean;
        autoDestroy?: boolean;
        write?(this: PromiseWritable<T>, data: T, encoding?: string): Promise<void>;
        writev?(this: PromiseWritable<T>, chunks: Array<{ chunk: T , encoding?: string }>): Promise<void>;
        final?(this: PromiseWritable<T>): Promise<void>;
    }

    interface PromiseWritableOptions<T> extends BasePromiseWritableOptions<T> {
        destroy?(this: PromiseWritable<T>, error: Error | null): Promise<void>;
    }

    class BasePromiseWritable<T> extends Writable {
        constructor(options: PromiseWritableOptions<T>);

        _write(this: PromiseWritable<T>, data: T, encoding?: string): Promise<void>;

        whenWrote(data: T, encoding?: string): Promise<void>;
        whenFinish(): Promise<void>;
    }

    export class PromiseWritable<T> extends BasePromiseWritable<T> {
        whence(event: string): Promise<any>;
        raise(error: Error): Promise<any>;
        catch(handler: (error: Error) => Promise<void>)
    }

    interface PromiseTransformOptions<T, S> extends BasePromiseReadableOptions<T>, BasePromiseWritableOptions<S> {
        flush?(this: PromiseTransform<T, S>): Promise<void>;
        transform?(this: PromiseTransform<T, S>, data: T, encoding: string): Promise<S>;
        transforms?: [] | [(data: T) => Promise<any>?, (e: Error) => Promise<any>?] | [[(data: T) => Promise<any>, (e: Error) => Promise<any>?], ...[(data: any) => Promise<any>, (e: Error) => Promise<any>?], [(data: T) => Promise<S>, (e: Error) => Promise<S>?]];
    }

    class BasePromiseTransform<T, S> extends Transform implements BasePromiseReadable<T>, BasePromiseWritable<S> {
        constructor(options: PromiseTransformOptions<T, S>)

        _getTransforms() : [(data: T) => Promise<S>] | [(data: T) => Promise<any>, ...(data: any) => Promise<any>, (data: any) => Promise<S>];

        _transform(this: PromiseTransform<T, S>, data: T): Promise<S>;

        _write(this: PromiseWritable<S>, data: S, encoding?: string): Promise<void>;
        whenWrote(data: S, encoding: string): Promise<void>;
        whenFinish(): Promise<void>;

        _read(this: PromiseReadable<T>, size: number): Promise<T>
        whenEnd(): Promise<void>
        whenRead(size: number): Promise<T>

        pipe<U>(destination: PromiseTransform<S, U>, options?: { end?: boolean; }): PromiseTransform<T, U>
        pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;

        tap(): TappedPromiseTransform<T, S>;

        _flush(this: PromiseTransform<T, S>): Promise<void>;
        _destroy(this: PromiseWritable<T>, error: Error | null): Promise<void>;
    }

    export class PromiseTransform<T,S> extends BasePromiseTransform<T, S> {
        catch(handler: (error: Error, data: T) => Promise<S>): PromiseTransform<T,S>
    }

    class TappedPromiseTransform<T, S> extends PromiseTransform<T, S> {
        pipe<U>(destination: PromiseTransform<S, U>, options?: { end?: boolean; }): PromiseTransform<T, U>
        pipe<U, Z extends PromiseTransform<T, U>>(destination: Z, options?: { end?: boolean; }): Z
    }

    interface PromiseDuplexOptions<T, S> extends BasePromiseReadableOptions<T>, BasePromiseWritableOptions<S> {
        allowHalfOpen?: boolean;
        readableObjectMode?: boolean;
        writableObjectMode?: boolean;

        read?(this: PromiseReadable<T>, size: number): T | Promise<T>
        write?(this: PromiseWritable<S>, data: S, encoding?: string): Promise<void>;
        writev?(this: PromiseWritable<S>, chunks: Array<{ chunk: S, encoding?: string }>): Promise<void>;
        final?(this: PromiseWritable<S>): Promise<void>;

        destroy?(this: PromiseDuplex<T, S>, error: Error | null): Promise<void>;
     }

    export class PromiseDuplex<T, S> extends Duplex implements BasePromiseReadable<T>, BasePromiseWritable<S> {
        constructor(options: PromiseDuplexOptions<T, S>)

        _write(this: PromiseDuplex<T, S>, data: S, encoding?: string): Promise<void>;

        whenWrote(data: S, encoding: string): Promise<void>;
        whenFinish(): Promise<void>;

        tap(): TappedPromiseReadable<T>

        _read(size: number): Promise<T>
        whenEnd(): Promise<void>
        whenRead(size: number): Promise<T>
        
        pipe<U>(destination: PromiseTransform<T, U>, options?: { end?: boolean; }): PromiseReadable<U>
        pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;

        catch(handler: (error: Error) => Promise<void>): PromiseDuplex<T,S>
    }

}