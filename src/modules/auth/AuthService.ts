import { supabase } from "@/lib/supabase";

export type User = {
  userId: string;
};

export class AuthService {
  /**
   * Obtains the current logged-in user.
   */
  async getUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data.session) return null;

    return {
      userId: data.session.user.id,
    };
  }

  onUserChange(handleUserChange: (user: User | null) => void): void {
    supabase.auth.onAuthStateChange((_event, session) => {
      handleUserChange(
        session
          ? {
            userId: session.user.id,
          }
          : null
      );
    });
  }

  async login(email: string, password: string): Promise<User> {
    console.log("Attempting to log in")
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      userId: data.user.id,
    };
  }

  async signUp(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("1. tried to sign up")

    if (error) throw error;

    console.log("2. signed up successfully through supabase", data);

    const { error: profileError } = await supabase
      .from("usuarios")
      .insert({
        uid: data.user!.id,
        nombre: name,
        email: email,
      });

    console.log("3. tried to create user profile", profileError);

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw profileError;
    }

    return {
      userId: data.user!.id,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }
}

export const authServiceInstance = new AuthService();
