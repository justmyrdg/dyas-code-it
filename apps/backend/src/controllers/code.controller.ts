import type { NextFunction, Request, Response } from 'express';
import { codeExecutor, ExecutionError } from '../services/code-execution.service';
import { sendError } from '../utils/http';

export async function listLanguages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const languages = await codeExecutor.listLanguages();
    res.json({ languages });
  } catch (err) {
    if (err instanceof ExecutionError) {
      sendError(res, err.status, err.code, err.message);
      return;
    }
    next(err);
  }
}

export async function executeCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { language, source, stdin } = req.body as {
      language?: string;
      source?: string;
      stdin?: string;
    };

    if (typeof language !== 'string' || !language.trim()) {
      sendError(res, 400, 'missing_fields', 'A language is required.');
      return;
    }
    if (typeof source !== 'string' || !source.trim()) {
      sendError(res, 400, 'missing_fields', 'Source code is required.');
      return;
    }
    if (stdin !== undefined && typeof stdin !== 'string') {
      sendError(res, 400, 'invalid_stdin', 'stdin must be a string.');
      return;
    }

    const result = await codeExecutor.execute({ language, source, stdin });
    res.json({ result });
  } catch (err) {
    if (err instanceof ExecutionError) {
      sendError(res, err.status, err.code, err.message);
      return;
    }
    next(err);
  }
}
