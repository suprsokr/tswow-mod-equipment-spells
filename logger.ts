// ============================================================================
// Logger
// ============================================================================
// Centralized logging for datascripts.
// Only logs information relevant to server administrators.
// ============================================================================

class Logger {
    private readonly DEBUG = false; // Set to true for detailed debug logs
    private readonly PREFIX = '[Equipment-Spells]';

    debug(message: string): void {
        if (this.DEBUG) {
            console.log(`${this.PREFIX} [DEBUG] ${message}`);
        }
    }

    warn(message: string): void {
        console.log(`${this.PREFIX} [WARN] ${message}`);
    }

    error(message: string): void {
        console.log(`${this.PREFIX} [ERROR] ${message}`);
    }
}
export const logger = new Logger();

