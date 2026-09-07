export function getTreatmentAssignedStaff(treatment, clinic) {
  if (!treatment) return [];
  if (Array.isArray(treatment.assigned_staff_ids) && treatment.assigned_staff_ids.length > 0) {
    return treatment.assigned_staff_ids;
  }
  const meta = clinic?.working_days?.treatment_staff?.[treatment.id];
  if (Array.isArray(meta) && meta.length > 0) {
    return meta;
  }
  try {
    const local = localStorage.getItem(`fizyo_treat_staff_${treatment.id}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}
