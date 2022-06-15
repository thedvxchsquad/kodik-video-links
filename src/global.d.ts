declare type VideoLinksTypes = Record<
  "links", 
  Record<
    "720" | "480" | "360" | "240", 
    Array<{ src: string; type: string }>
  >
>
declare type MayBePromise<T = unknown> = T | Promise<T>;
declare interface ResponseServerType {
  statusCode: number;
}
declare interface ResponseError extends ResponseServerType {
  error: {
    status: number;
    message: string;
  }
}
declare interface ResponseOk<T = unknown> extends ResponseServerType {
  data: T;
}
declare namespace Express {
  export interface Response {
     ok(response: ResponseOk): void;
     error(error: ResponseError): void;
  }
}