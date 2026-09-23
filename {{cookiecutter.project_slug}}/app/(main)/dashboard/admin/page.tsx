import { redirect } from "next/navigation";
import { desc, gte, ne, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, jobs, contactSubmissions } from "@/lib/db/schema";
import config from "@/config";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminPage() {
  const session = await auth();
  if (!session) {
    redirect(config.auth.loginUrl);
  }

  const currentUser = await db.query.users.findFirst({
    where: sql`${users.id} = ${session.user.id}`,
    columns: { isAdmin: true },
  });
  if (!currentUser?.isAdmin) {
    redirect("/dashboard");
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  const [paidUsers] = await db
    .select({
      total: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(ne(users.plan, "free"));

  const [jobs24h] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs)
    .where(gte(jobs.createdAt, oneDayAgo));

  const recentContact = await db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      email: contactSubmissions.email,
      type: contactSubmissions.type,
      subject: contactSubmissions.subject,
      createdAt: contactSubmissions.createdAt,
    })
    .from(contactSubmissions)
    .where(gte(contactSubmissions.createdAt, oneWeekAgo))
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Internal system metrics and feedback visibility.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Total Users</div>
          <div className="mt-2 text-3xl font-bold">{totalUsers?.count ?? 0}</div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Paid Users</div>
          <div className="mt-2 text-3xl font-bold">{paidUsers?.total ?? 0}</div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Jobs (24h)</div>
          <div className="mt-2 text-3xl font-bold">{jobs24h?.count ?? 0}</div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Contact (7d)</div>
          <div className="mt-2 text-3xl font-bold">{recentContact.length}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-200">
        <div className="border-b border-base-300 px-5 py-4">
          <h2 className="text-lg font-semibold">Contact Messages (Past Week)</h2>
          <p className="mt-1 text-sm text-base-content/70">
            Showing {recentContact.length} submission{recentContact.length === 1 ? "" : "s"} from the last 7 days.
          </p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Received</th>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {recentContact.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-base-content/60">
                  No contact submissions in the last week.
                </td>
              </tr>
            ) : (
              recentContact.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap text-sm text-base-content/70">
                    {dateTimeFormatter.format(item.createdAt)}
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <a href={`mailto:${item.email}`} className="link link-hover">
                      {item.email}
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-outline">{item.type}</span>
                  </td>
                  <td className="max-w-xs truncate">{item.subject}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
