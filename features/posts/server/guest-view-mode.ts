import "server-only";

import { cookies } from "next/headers";
import {
  getAuthenticatedContext,
  isAdminProfile,
  type AuthContext,
} from "@/features/auth/server/context";

const GUEST_VIEW_COOKIE = "tsw_guest_view";
const GUEST_VIEW_ENABLED = "1";

export type GuestViewState = {
  isAdmin: boolean;
  isViewingAsGuest: boolean;
};

export async function getGuestViewState(
  context?: AuthContext | null,
): Promise<GuestViewState> {
  const authContext = context === undefined ? await getAuthenticatedContext() : context;
  const isAdmin = isAdminProfile(authContext?.profile || null);

  if (!isAdmin) {
    return {
      isAdmin: false,
      isViewingAsGuest: false,
    };
  }

  const cookieStore = await cookies();

  return {
    isAdmin: true,
    isViewingAsGuest:
      cookieStore.get(GUEST_VIEW_COOKIE)?.value === GUEST_VIEW_ENABLED,
  };
}

export async function setGuestViewMode(enabled: boolean) {
  const context = await getAuthenticatedContext();

  if (!isAdminProfile(context?.profile || null)) {
    throw new Error("Only admins can change guest view mode.");
  }

  const cookieStore = await cookies();

  if (enabled) {
    cookieStore.set(GUEST_VIEW_COOKIE, GUEST_VIEW_ENABLED, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return getGuestViewState(context);
  }

  cookieStore.delete(GUEST_VIEW_COOKIE);
  return {
    isAdmin: true,
    isViewingAsGuest: false,
  };
}
