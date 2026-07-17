"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = require("../models/User");
const PORT = process.env.PORT || 3000;
const BACKEND_URL = `http://localhost:${PORT}`;
function clampRole(role) {
    return role === 'teacher' ? 'teacher' : 'student';
}
// Only trust a profile email for account auto-linking (or reuse as a new account's
// email) when the provider explicitly reports it as verified. Otherwise an attacker
// could add someone else's address as an unverified secondary email on their own
// GitHub/Google account and use "Continue with GitHub/Google" to take over the
// victim's existing DyasCodeIT account.
//
// Ground truth per provider (installed library source, not the community .d.ts
// typings, which are inaccurate here):
//   - passport-google-oauth20@2.0.0's OpenID profile parser (lib/profile/openid.js)
//     sets `profile.emails = [{ value: json.email, verified: json.email_verified }]`
//     straight from Google's userinfo `email_verified` boolean, so `verified` is a
//     reliable signal on `profile.emails[0]`.
//   - passport-github2@0.1.12 (lib/strategy.js `userProfile`) never puts a `verified`
//     flag on `profile.emails[]` with this app's strategy config: the `/user/emails`
//     endpoint (whose raw entries look like `{ email, primary, verified, visibility }`)
//     is only fetched when the *strategy* (not the per-request `authenticate()` call)
//     was constructed with a `user`/`user:email` scope, which this app doesn't do; and
//     even when it is fetched, the default (non-`allRawEmails`) code path collapses it
//     to `profile.emails = [{ value: json[index].email }]`, dropping `verified`
//     entirely. So `profile.emails[0].verified` is always `undefined` for GitHub here
//     and correctly falls through to "not verified" below.
function isPrimaryEmailVerified(profile) {
    return profile.emails?.[0]?.verified === true;
}
async function findOrCreateOAuthUser(input) {
    const { providerIdField, providerId, email, name, avatarUrl, role } = input;
    const existingByProvider = await User_1.User.findOne({ where: { [providerIdField]: providerId } });
    if (existingByProvider) {
        return existingByProvider;
    }
    if (email) {
        const normalizedEmail = email.toLowerCase();
        const existingByEmail = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (existingByEmail) {
            existingByEmail[providerIdField] = providerId;
            await existingByEmail.save();
            return existingByEmail;
        }
    }
    return User_1.User.create({
        email: (email ?? `${providerId}@${providerIdField}.dyascodeit.local`).toLowerCase(),
        passwordHash: null,
        name,
        role,
        githubId: providerIdField === 'githubId' ? providerId : null,
        googleId: providerIdField === 'googleId' ? providerId : null,
        avatarUrl,
    });
}
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/github/callback`,
    passReqToCallback: true,
}, 
// Community typings for passport-github2's Profile are incomplete for `emails`/`photos`; loosened deliberately.
// `done`'s user param is typed `any` (not `User`) so this verify function structurally matches
// passport-oauth2's `VerifyCallback` (whose `user` is `Express.User`) regardless of how `Express.User`
// is declared elsewhere in the app; the actual value passed at the `.then()` call site below is still
// the real Sequelize `User` returned by `findOrCreateOAuthUser`.
(req, _accessToken, _refreshToken, profile, done) => {
    const role = clampRole(req.query.state);
    findOrCreateOAuthUser({
        providerIdField: 'githubId',
        providerId: profile.id,
        email: isPrimaryEmailVerified(profile) ? profile.emails?.[0]?.value : undefined,
        name: profile.displayName || profile.username || 'GitHub User',
        avatarUrl: profile.photos?.[0]?.value ?? null,
        role,
    })
        .then((user) => done(null, user))
        .catch((err) => done(err));
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true,
}, 
// See the matching comment on the GitHub strategy above re: `done`'s `user` param being `any`.
(req, _accessToken, _refreshToken, profile, done) => {
    const role = clampRole(req.query.state);
    findOrCreateOAuthUser({
        providerIdField: 'googleId',
        providerId: profile.id,
        email: isPrimaryEmailVerified(profile) ? profile.emails?.[0]?.value : undefined,
        name: profile.displayName || 'Google User',
        avatarUrl: profile.photos?.[0]?.value ?? null,
        role,
    })
        .then((user) => done(null, user))
        .catch((err) => done(err));
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map