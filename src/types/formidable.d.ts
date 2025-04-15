declare module 'formidable' {
  export interface File {
    filepath: string;
    originalFilename: string;
    size: number;
    mimetype: string;
  }

  export interface Fields {
    [key: string]: string[];
  }

  export interface Files {
    [key: string]: File[];
  }

  export interface Formidable {
    parse(body: string): Promise<[Fields, Files]>;
  }

  export default function formidable(): Formidable;
} 