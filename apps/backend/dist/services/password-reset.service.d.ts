export declare const PASSWORD_RESET_EXPIRY_MS: number;
export interface GeneratedResetToken {
    rawToken: string;
    tokenHash: string;
    expiresAt: Date;
}
export declare function hashResetToken(rawToken: string): string;
export declare function generateResetToken(now?: Date): GeneratedResetToken;
export declare function isResetTokenValid(expiresAt: Date | null, now?: Date): boolean;
//# sourceMappingURL=password-reset.service.d.ts.map