import { useContext } from "react";
import { PermissionContext } from "./PermissionsContext";

export const usePermission = () => {
  return useContext(PermissionContext);
};
