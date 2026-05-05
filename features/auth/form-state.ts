export type AuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle",
};
