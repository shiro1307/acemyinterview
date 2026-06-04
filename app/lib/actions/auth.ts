"use server"

import { getUser } from "../supabase/server";

export async function getCurrentUser() {
  const user = await getUser();
  
  if (!user) {
    throw new Error("Unauthorized: Must be logged in");
  }
  
  return user;
}
