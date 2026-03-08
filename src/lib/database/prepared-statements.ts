import { and, eq, sql } from "drizzle-orm";
import { db } from ".";
import { generateBase64Token } from "../utils";
import { accounts, servers, sessions, users } from "./schema";

const _prepared = {
    account: {
        findByOAuthId: db.query.accounts
            .findFirst({
                columns: { id: true },
                where: (t, { eq }) => eq(t.oAuthId, sql.placeholder("oAuthId")),
            })
            .prepare(),

        deleteByOAuthId: db
            .delete(accounts)
            .where(eq(accounts.oAuthId, sql.placeholder("oAuthId")))
            .prepare(),
    },

    user: {
        findByHandle: db.query.users
            .findFirst({
                where: (t, { eq }) => eq(t.handle, sql.placeholder("handle")),
            })
            .prepare(),
    },

    session: {
        findByTokenWithAccountAndUser: db
            .select()
            .from(sessions)
            .innerJoin(accounts, eq(sessions.accountId, accounts.id))
            .innerJoin(users, eq(accounts.id, users.accountId))
            .where(eq(sessions.token, sql.placeholder("token")))
            .limit(1)
            .prepare(),

        findManyByAccountId: db.query.sessions
            .findMany({
                columns: { accountId: false },
                where: (t, { eq }) =>
                    eq(t.accountId, sql.placeholder("accountId")),
            })
            .prepare(),

        deleteByAccountIdAndToken: db
            .delete(sessions)
            .where(
                and(
                    eq(sessions.accountId, sql.placeholder("accountId")),
                    eq(sessions.token, sql.placeholder("token")),
                ),
            )
            .prepare(),
    },

    server: {
        findByIdAndUserId: db.query.servers
            .findFirst({
                where: (t, { eq, and }) =>
                    and(
                        eq(t.id, sql.placeholder("id")),
                        eq(t.userId, sql.placeholder("userId")),
                    ),
            })
            .prepare(),

        findManyByUserId: db.query.servers
            .findMany({
                where: (t, { eq }) => eq(t.userId, sql.placeholder("userId")),
            })
            .prepare(),

        findByTokenWithUser: db
            .select()
            .from(servers)
            .innerJoin(users, eq(servers.userId, users.id))
            .where(eq(servers.token, sql.placeholder("token")))
            .limit(1)
            .prepare(),

        refreshTokenById: db
            .update(servers)
            .set({ token: sql`${sql.placeholder("token")}` })
            .where(
                and(
                    eq(servers.id, sql.placeholder("id")),
                    eq(servers.userId, sql.placeholder("userId")),
                ),
            )
            .returning()
            .prepare(),
    },
};

export const preparedStatements = {
    account: {
        findByOAuthId: (params: { oAuthId: string }) =>
            _prepared.account.findByOAuthId.get(params),

        deleteByOAuthId: (params: { oAuthId: string }) =>
            _prepared.account.deleteByOAuthId.run(params),
    },

    user: {
        findByHandle: (params: { handle: string }) =>
            _prepared.user.findByHandle.get(params),
    },

    session: {
        findByTokenWithAccountAndUser: (params: { token: string }) =>
            _prepared.session.findByTokenWithAccountAndUser.get(params),

        findManyByAccountId: (params: { accountId: string }) =>
            _prepared.session.findManyByAccountId.all(params),

        deleteByAccountIdAndToken: (params: {
            accountId: string;
            token: string;
        }) => _prepared.session.deleteByAccountIdAndToken.execute(params),
    },

    server: {
        findByIdAndUserId: (params: { id: string; userId: string }) =>
            _prepared.server.findByIdAndUserId.get(params),

        findManyByUserId: (params: { userId: string }) =>
            _prepared.server.findManyByUserId.all(params),

        findByTokenWithUser: (params: { token: string }) =>
            _prepared.server.findByTokenWithUser.get(params),

        refreshTokenById: (params: { id: string; userId: string }) =>
            _prepared.server.refreshTokenById.get({
                ...params,
                token: generateBase64Token(),
            }),
    },
};
