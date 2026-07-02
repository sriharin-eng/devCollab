import { ROLE_BADGE_STYLES } from "../utils/roles";

function RoleBadge({ role }) {
  const style = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.Viewer;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}
    >
      {role || "Viewer"}
    </span>
  );
}

export default RoleBadge;
