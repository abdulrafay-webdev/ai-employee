import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      whatsappConnected?: boolean;
      gmailAuthenticated?: boolean;
    }
  }
}
