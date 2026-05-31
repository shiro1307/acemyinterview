import Link from "next/link";

interface RoleSelectorProps {
    roles: {
        name: string;
        id: string;
    }[];
}

export default function RoleSelector({ roles }: RoleSelectorProps) {
    return (
        <div>
            {roles.map((role) => (
                <div key={role.id}>
                    <Link href={`/interview/${role.id}`}>{role.name}</Link>
                    <br />
                </div>
            ))}
        </div>
    );
}
