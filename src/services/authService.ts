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
    console.log("--- PocketBase Authentication Debug Info ---");
    console.log("PocketBase Base URL:", this.pbClient.baseURL);
    console.log("Collection Name: teacher_auth");
    console.log("Final Request URL:", `${this.pbClient.baseURL}/api/collections/teacher_auth/auth-with-password`);
    console.log("Identity:", usernameOrEmail);

    // Check if the identity exists in teacher_auth first to prevent hiding errors with fallbacks
    let isTeacher = false;
    try {
      const check = await this.pbClient.collection("teacher_auth").getFirstListItem(
        `email = "${usernameOrEmail}" || username = "${usernameOrEmail}"`
      );
      isTeacher = !!check;
    } catch (_) {}

    if (isTeacher) {
      try {
        console.log("Attempting authentication against collection: teacher_auth");
        const authData = await this.pbClient
          .collection("teacher_auth")
          .authWithPassword(usernameOrEmail, password, {
            expand: "directory_record"
          });
        
        const record = authData.record as any;
        
        // Enforce approval status check
        if (record.approval_status !== "Approved") {
          this.pbClient.authStore.clear();
          throw new Error("Your account is awaiting approval by the School Administrator.");
        }
        
        // Enrich the record
        record.user_role = "teacher";
        record.role = "FACULTY";
        record.approval_status = record.approval_status || "Approved";
        if (record.expand?.directory_record) {
          record.name = record.expand.directory_record.name;
        } else {
          record.name = record.name || "Teacher";
        }

        const sessionResult = {
          token: authData.token,
          user: record as unknown as User,
        };

        console.log("--- Login Session Object ---");
        console.log(JSON.stringify(sessionResult, null, 2));

        return sessionResult;
      } catch (teacherErr: any) {
        console.error("PocketBase teacher_auth login failed.");
        console.error("Exact Error Object:", teacherErr);
        console.error("Error Status Code:", teacherErr.status);
        console.error("Error Response Data:", JSON.stringify(teacherErr.data));
        throw teacherErr;
      }
    }

    // If not a teacher, fallback to users and students collections
    try {
      console.log("Attempting authentication against collection: users");
      const authData = await this.pbClient
        .collection("users")
        .authWithPassword(usernameOrEmail, password);
      
      const record = authData.record as any;
      
      // Enrich the record
      record.user_role = "admin";
      record.role = "ADMIN";
      record.approval_status = "Approved";
      
      const sessionResult = {
        token: authData.token,
        user: record as unknown as User,
      };

      console.log("--- Login Session Object ---");
      console.log(JSON.stringify(sessionResult, null, 2));

      return sessionResult;
    } catch (usersErr: any) {
      console.log("users collection auth failed, trying students...");
      try {
        console.log("Attempting authentication against collection: students");
        const authData = await this.pbClient
          .collection("students")
          .authWithPassword(usernameOrEmail, password);
        
        const record = authData.record as any;
        
        // Enrich the record
        record.user_role = "student";
        record.role = "STUDENT";
        record.approval_status = record.approval_status || record.approvalStatus || "Approved";

        // Enforce approval status check for students
        if (record.approval_status !== "Approved") {
          this.pbClient.authStore.clear();
          throw new Error("Your account is awaiting approval by the School Administrator.");
        }

        const sessionResult = {
          token: authData.token,
          user: record as unknown as User,
        };

        console.log("--- Login Session Object ---");
        console.log(JSON.stringify(sessionResult, null, 2));

        return sessionResult;
      } catch (studentErr: any) {
        console.error("All authentication attempts failed.");
        console.error("Last attempt (students) Error Object:", studentErr);
        throw studentErr;
      }
    }
  }

  /**
   * Registers a new user
   */
  async register(userData: Record<string, any>): Promise<User> {
    const role = userData.role || "STUDENT";
    const isStudent = role === "STUDENT";
    const targetCollection = isStudent ? "students" : "teacher_auth";

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
      payload.approval_status = "Pending";
      payload.verified = false;
    } else {
      payload.approval_status = "Pending";
      payload.phone = userData.mobile || "";
      payload.directory_record = userData.directory_record || "";
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
      await this.pbClient.collection("teacher_auth").requestPasswordReset(email);
      return true;
    } catch {
      try {
        await this.pbClient.collection("students").requestPasswordReset(email);
        return true;
      } catch {
        await this.pbClient.collection("users").requestPasswordReset(email);
        return true;
      }
    }
  }

  /**
   * Requests an email verification link
   */
  async requestEmailVerification(email: string): Promise<boolean> {
    try {
      await this.pbClient.collection("teacher_auth").requestVerification(email);
      return true;
    } catch {
      try {
        await this.pbClient.collection("students").requestVerification(email);
        return true;
      } catch {
        await this.pbClient.collection("users").requestVerification(email);
        return true;
      }
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
      const model = this.pbClient.authStore.model;
      if (model) {
        const record = { ...model } as any;
        if (record.collectionName === "teacher_auth") {
          record.user_role = "teacher";
          record.role = "FACULTY";
          record.approval_status = record.approval_status || "Approved";
          if (record.expand?.directory_record) {
            record.name = record.expand.directory_record.name;
          } else {
            record.name = record.name || "Teacher";
          }
        } else if (record.collectionName === "students") {
          record.user_role = "student";
          record.role = "STUDENT";
          record.approval_status = record.approvalStatus || "Approved";
        } else if (record.collectionName === "users") {
          record.user_role = "admin";
          record.role = "ADMIN";
          record.approval_status = "Approved";
        }
        return record as unknown as User;
      }
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
