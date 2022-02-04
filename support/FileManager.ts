import * as fs from 'fs';
import { OneSignalLog } from './OneSignalLog';

export class ReaderManager {
  static async readFile(path: string, replace?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        }
        if (!data) {
          OneSignalLog.error("Couldn't read file:" + path);
          return;
        }
        resolve(data);
      });
    });
  }
}
