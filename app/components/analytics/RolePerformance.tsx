import { RoleStats } from "@/app/lib/analytics/types";
import { formatScore } from "@/app/lib/analytics/format";
import RankedListSection from "./RankedListSection";

export default function RolePerformance({ roles }: { roles: RoleStats[] }) {
    return (
        <RankedListSection
            title="Role Performance"
            emptyText="No role performance data yet."
            items={roles.map((role) => ({
                name: role.role,
                meta: `${formatScore(role.averageScore)} (${role.count} ${
                    role.count === 1 ? "interview" : "interviews"
                })`,
            }))}
        />
    );
}
