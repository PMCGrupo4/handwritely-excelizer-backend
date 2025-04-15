import { Request, Response } from 'express';
export declare class CommandController {
    private storageService;
    constructor();
    /**
     * Get all commands for a user
     */
    getUserCommands(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Create a new command from an image
     */
    createCommand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete a command
     */
    deleteCommand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Process an image with OCR
     */
    processImageOcr(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
