import { pb } from "@/lib/pocketbase";
import PocketBase from "pocketbase";
import { User } from "@/types/pocketbase.types";

export class AuthService {
  private pbClient: PocketBase;

  constructor(customClient?: PocketBase) {
    this.pbClient = customClient || pb;
  }

  /**
   * Authenticates a user with username/email and password
   */
  async login(usernameOrEmail: string, password: string) {
    try {
      // Try to authenticate as teacher/faculty/admin
      const authData = await this.pbClient
        .collection("teachers_auth")
        .authWithPassword(usernameOrEmail, password);
      
      const record = authData.record;
      if (!record.role) record.role = "FACULTY";
      return {
        token: authData.token,
        user: record as unknown as User,
      };
    } catch {
      // Try to authenticate as student
      const authData = await this.pbClient
        .collection("students")
        .authWithPassword(usernameOrEmail, password);
      
      const record = authData.record;
      if (!record.role) record.role = "STUDENT";
      return {
        token: authData.token,
        user: record as unknown as User,
      };
    }
  }

  /**
   * Registers a new user
   */
  async register(userData: Record<string, any>): Promise<User> {
    const role = userData.role || "STUDENT";
    const isStudent = role === "STUDENT";
    const targetCollection = isStudent ? "students" : "teachers_auth";

    // Ensure passwords match for PocketBase requirement
    const payload: Record<string, any> = {
      username: userData.username,
      email: userData.email,
      emailVisibility: true,
      password: userData.password,
      passwordConfirm: userData.password, // PocketBase expects passwordConfirm
      name: userData.name,
      mobile: userData.mobile,
      role: role,
    };

    if (isStudent) {
      payload.className = userData.className || "";
      payload.fatherName = userData.fatherName || "";
      payload.rollNumber = userData.rollNumber || "";
      payload.dob = userData.dob || "";
      payload.approvalStatus = "PENDING";
      payload.verified = false;
    } else {
      payload.approvalStatus = "APPROVED";
      payload.verified = false;
    }

    const record = await this.pbClient
      .collection(targetCollection)
      .create(payload);

    return record as unknown as User;
  }

  /**
   * Requests a password reset email
   */
  async forgotPassword(email: string): Promise<boolean> {
    try {
      await this.pbClient.collection("teachers_auth").requestPasswordReset(email);
      return true;
    } catch {
      await this.pbClient.collection("students").requestPasswordReset(email);
      return true;
    }
  }

  /**
   * Requests an email verification link
   */
  async requestEmailVerification(email: string): Promise<boolean> {
    try {
      await this.pbClient.collection("teachers_auth").requestVerification(email);
      return true;
    } catch {
      await this.pbClient.collection("students").requestVerification(email);
      return true;
    }
  }

  /**
   * Signs out the user by clearing the auth store
   */
  logout(): void {
    this.pbClient.authStore.clear();
    // Clear cookies as well on client
    if (typeof window !== "undefined") {
      document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  /**
   * Gets the currently authenticated user session
   */
  getCurrentUser(): User | null {
    if (this.pbClient.authStore.isValid) {
      return this.pbClient.authStore.model as unknown as User;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.pbClient.authStore.isValid;
  }
}

// Export default instance for client use
export const authService = new AuthService();
