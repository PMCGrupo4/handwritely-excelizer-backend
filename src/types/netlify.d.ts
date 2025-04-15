declare module '@netlify/functions' {
  export interface HandlerEvent {
    path: string;
    httpMethod: string;
    headers: Record<string, string>;
    queryStringParameters: Record<string, string> | null;
    body: string | null;
    isBase64Encoded: boolean;
  }

  export interface HandlerContext {
    functionName: string;
    functionVersion: string;
    invokedFunctionArn: string;
    memoryLimitInMB: string;
    awsRequestId: string;
    logGroupName: string;
    logStreamName: string;
    callbackWaitsForEmptyEventLoop: boolean;
    getRemainingTimeInMillis: () => number;
    done: (error?: Error | null, result?: any) => void;
    succeed: (result?: any) => void;
    fail: (error: Error | string) => void;
  }

  export type Handler = (
    event: HandlerEvent,
    context: HandlerContext
  ) => Promise<HandlerResponse> | HandlerResponse;

  export interface HandlerResponse {
    statusCode: number;
    body?: string;
    headers?: Record<string, string>;
    isBase64Encoded?: boolean;
  }
} 