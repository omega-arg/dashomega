
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmployeeManagement from "@/components/employees/employee-management";

export default async function EmployeesPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user has permission to view employees
  const allowedRoles = ["OWNER", "ADMIN_GENERAL", "RECLUTADOR"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <EmployeeManagement userRole={session.user.role} />
  );
}
