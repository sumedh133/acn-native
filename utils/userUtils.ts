export const getInitials = (name: string | null): string => {
  if (!name) return "";
  const names = name.trim().split(" ");
  const initials =
    names.length >= 2 ? names[0][0] + names[1][0] : names[0].slice(0, 2);
  return initials.toUpperCase();
};

export const getRandomColor = (initials:string): string => {
  const colors = ["#3d4db7", "#e67e22", "#2ecc71", "#9b59b6", "#e74c3c"];
  return colors[initials[0].toUpperCase().charCodeAt(0)%colors.length];
};