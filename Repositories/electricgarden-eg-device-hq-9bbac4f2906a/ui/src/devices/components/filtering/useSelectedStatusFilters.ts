import { useUrlQuery } from "../../../shared";

export const useSelectedStatusFilters = () => {
  const query = useUrlQuery();
  return {
    status: query.get("status") as null | "active" | "inactive",
  };
};
