import { exec } from 'child_process';

export default class CRON {
    static async hasPermissions(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            exec('whoami', (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                const currentUser = stdout.trim();
                if (currentUser === 'root') {
                    return resolve(true);
                }
                exec('groups', (error, stdout, stderr) => {
                    if (error) {
                        return reject(error);
                    }
                    const groups = stdout.trim().split(' ');
                    if (groups.includes('cron') || groups.includes('root')) {
                        return resolve(true);
                    }
                    return resolve(false);
                });
            });
        });
    }

    static async list(): Promise<any> {
        if (!await this.hasPermissions()) {
            return Promise.reject('Insufficient permissions to list CRON jobs.');
        }

        return new Promise((resolve, reject) => {
            exec('crontab -l', (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                resolve(stdout);
            });
        });
    }

    static async create(ID: string, Command: string): Promise<any> {
        if (!await this.hasPermissions()) {
            return Promise.reject('Insufficient permissions to create CRON jobs.');
        }

        return new Promise((resolve, reject) => {
            const cronCommand = `${Command} # ${ID}`;
            exec(`(crontab -l 2>/dev/null; echo "${cronCommand}") | crontab -`, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                resolve(stdout);
            });
        });
    }

    static async delete(ID: string): Promise<any> {
        if (!await this.hasPermissions()) {
            return Promise.reject('Insufficient permissions to delete CRON jobs.');
        }

        return new Promise((resolve, reject) => {
            exec(`crontab -l 2>/dev/null | grep -v '# ${ID}$' | crontab -`, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                resolve(stdout);
            });
        });
    }
}