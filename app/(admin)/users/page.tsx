import { updateUserAccessAction } from "@/app/actions/user-management-actions";
import { Button } from "@/components/admin/ui/button";
import {
  PRIMARY_ADMIN_EMAIL,
  requireAdminContext,
  type ApprovalStatus,
  type UserRole,
} from "@/lib/admin-data.server";

type ManagedProfile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  role: UserRole | null;
  approval_status: ApprovalStatus | null;
  created_at: string;
  approved_at: string | null;
};

const statusOrder: Record<ApprovalStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatStatusLabel(status: ApprovalStatus | null) {
  if (!status) {
    return "Pending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRoleLabel(role: UserRole | null) {
  if (!role) {
    return "Author";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function StatusPill({ status }: { status: ApprovalStatus | null }) {
  const normalized = status || "pending";
  const styles =
    normalized === "approved"
      ? "bg-admin-success/15 text-admin-success"
      : normalized === "rejected"
        ? "bg-admin-danger/15 text-admin-danger"
        : "bg-admin-accent/15 text-admin-accent";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${styles}`}
    >
      {formatStatusLabel(normalized)}
    </span>
  );
}

function AccessAction({
  userId,
  role,
  approvalStatus,
  label,
  variant = "outline",
}: {
  userId: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  label: string;
  variant?: "default" | "outline" | "danger";
}) {
  return (
    <form action={updateUserAccessAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="approvalStatus" value={approvalStatus} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

export default async function UsersPage() {
  const { profile, supabase } = await requireAdminContext();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, display_name, role, approval_status, created_at, approved_at",
    );

  const profiles = ((data as ManagedProfile[] | null) || []).sort(
    (left, right) => {
      const leftStatus = left.approval_status || "pending";
      const rightStatus = right.approval_status || "pending";

      if (statusOrder[leftStatus] !== statusOrder[rightStatus]) {
        return statusOrder[leftStatus] - statusOrder[rightStatus];
      }

      return (
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime()
      );
    },
  );

  const pendingCount = profiles.filter(
    (entry) => entry.approval_status === "pending",
  ).length;
  const approvedCount = profiles.filter(
    (entry) => entry.approval_status === "approved",
  ).length;
  const rejectedCount = profiles.filter(
    (entry) => entry.approval_status === "rejected",
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-8 py-10">
      <section className="flex flex-col gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-admin-muted/60">
          Dashboard / Users
        </p>
        <h1 className="text-3xl font-black tracking-tight text-admin-heading">
          User Management
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-admin-text">
          Review new registrations, approve access to the writing tools, and
          manage author roles. The primary admin account for this site stays
          locked as an approved admin.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Pending approval",
            value: pendingCount,
            color: "bg-admin-accent/15 text-admin-accent",
          },
          {
            label: "Approved users",
            value: approvedCount,
            color: "bg-admin-success/15 text-admin-success",
          },
          {
            label: "Rejected users",
            value: rejectedCount,
            color: "bg-admin-danger/15 text-admin-danger",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="border border-admin-surface-hover bg-admin-surface p-6"
          >
            <span
              className={`inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${item.color}`}
            >
              {item.label}
            </span>
            <p className="mt-4 text-3xl font-bold text-admin-accent">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5">
        {profiles.map((entry) => {
          const displayName =
            entry.display_name ||
            [entry.first_name, entry.last_name].filter(Boolean).join(" ") ||
            entry.email ||
            "Unnamed user";
          const isPrimaryAdmin =
            (entry.email || "").trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
          const isCurrentUser = entry.id === profile?.id;

          return (
            <article
              key={entry.id}
              className="border border-admin-surface-hover bg-admin-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-admin-heading">
                      {displayName}
                    </h2>
                    <StatusPill status={entry.approval_status} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted">
                      {formatRoleLabel(entry.role)}
                    </span>
                  </div>
                  <p className="text-sm text-admin-text">{entry.email}</p>
                </div>

                <div className="grid gap-1 text-right text-xs text-admin-muted">
                  <p>Registered {formatDateLabel(entry.created_at)}</p>
                  <p>Approved {formatDateLabel(entry.approved_at)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isPrimaryAdmin ? (
                  <p className="text-sm font-medium text-admin-accent">
                    Primary admin account locked as approved admin.
                  </p>
                ) : (
                  <>
                    <AccessAction
                      userId={entry.id}
                      role="author"
                      approvalStatus="approved"
                      label="Approve as Author"
                      variant="default"
                    />
                    <AccessAction
                      userId={entry.id}
                      role="editor"
                      approvalStatus="approved"
                      label="Approve as Editor"
                    />
                    <AccessAction
                      userId={entry.id}
                      role="admin"
                      approvalStatus="approved"
                      label="Make Admin"
                    />
                    <AccessAction
                      userId={entry.id}
                      role={(entry.role || "author") as UserRole}
                      approvalStatus="pending"
                      label="Mark Pending"
                    />
                    <AccessAction
                      userId={entry.id}
                      role="author"
                      approvalStatus="rejected"
                      label="Reject"
                      variant="danger"
                    />
                  </>
                )}
              </div>

              {isCurrentUser ? (
                <p className="mt-4 text-xs text-admin-muted">
                  You are currently signed in as this user.
                </p>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
