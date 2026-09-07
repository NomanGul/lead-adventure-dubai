import { useContext } from "react";
import { TripContext } from "./trip-context";

export function useTrip() {
  return useContext(TripContext);
}
