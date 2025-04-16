import { Request, Response } from 'express';
export declare class CommandController {
    private storageService;
    private ocrService;
    constructor();
    getUserCommands(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createCommand(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCommand(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private parseCommandText;
    processImageOcr(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
