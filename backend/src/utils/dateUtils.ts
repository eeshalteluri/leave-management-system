export const leaveTypeBalanceKey: Record<
  string,
  "annual" | "sick" | "casual" | null
> = {
  "Annual Leave": "annual",
  "Sick Leave": "sick",
  "Casual Leave": "casual",
  "Maternity Leave": null,
  "Paternity Leave": null,
  "Unpaid Leave": null
};

export const calculateLeaveDays = (
  startDate: Date,
  endDate: Date
) => {
  const diff =
    new Date(endDate).getTime() -
    new Date(startDate).getTime();

  return Math.round(diff / 86400000) + 1;
};