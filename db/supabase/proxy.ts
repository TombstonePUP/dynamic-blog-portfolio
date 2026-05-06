import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { error } = await supabase.auth.getUser();

  // If the refresh token is invalid/not found, force the user to log in again
  // by explicitly clearing the session and redirecting to the login page.
  if (error && error.code === 'refresh_token_not_found') {
    // Explicitly sign out to clear local storage and ensure cookies are fully wiped
    await supabase.auth.signOut();
    
    // Redirect the user to login page
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("notice", "Session expired. Please log in again.");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
