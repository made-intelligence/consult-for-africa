import { requireCadreAdmin } from "@/lib/cadreHealth/mandateAccess";
import { MandateCreateForm } from "@/components/cadrehealth/MandateCreateForm";

export default async function CreateMandatePage() {
  await requireCadreAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
          Create Mandate
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Define the requirements for a new recruitment mandate
        </p>
      </div>
      <MandateCreateForm />
    </div>
  );
}
