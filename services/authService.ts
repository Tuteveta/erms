import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignIn,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import { AuthUser, AllowedAction } from "@/types";
import { mapGroupToRole } from "@/lib/auth";
import { client } from "@/lib/amplify-client";

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });

    if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      const err = new Error("A new password is required for your account.");
      (err as any).code = "NEW_PASSWORD_REQUIRED";
      throw err;
    }

    if (!isSignedIn) throw new Error("Sign in failed. Please try again.");
    return authService.getCurrentUser() as Promise<AuthUser>;
  },

  async completeNewPassword(newPassword: string): Promise<AuthUser> {
    const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
    if (!isSignedIn) throw new Error("Failed to set new password. Please try again.");
    return authService.getCurrentUser() as Promise<AuthUser>;
  },

  async signOut(): Promise<void> {
    await amplifySignOut();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const cognitoUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const groups =
        (session.tokens?.idToken?.payload["cognito:groups"] as string[]) ?? [];
      const role = mapGroupToRole(groups);

      let allowedActions: AllowedAction[] | undefined;
      if (role === "HROfficer") {
        const email = attributes.email ?? "";
        const { data: permissions } = await client.models.Permission.list({
          filter: { Email: { eq: email } },
        });
        if (permissions && permissions.length > 0) {
          allowedActions =
            (permissions[0].AllowedActions?.filter(Boolean) as AllowedAction[]) ?? [];
        }
      }

      return {
        userId: cognitoUser.userId,
        email: attributes.email ?? cognitoUser.username,
        name: attributes.name ?? attributes.email ?? cognitoUser.username,
        role,
        allowedActions,
      };
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  },

  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  },

  async getHROfficers() {
    const { data } = await client.models.Permission.list();
    return (data ?? []).map((p) => ({
      UserID: p.UserID,
      Email: p.Email,
      Name: p.Name ?? p.Email,
      AllowedActions:
        (p.AllowedActions?.filter(Boolean) as AllowedAction[]) ?? [],
      CreatedAt: p.createdAt ?? new Date().toISOString(),
      AssignedBy: p.AssignedBy ?? "",
    }));
  },

  async createHROfficer(
    email: string,
    name: string,
    allowedActions: AllowedAction[],
    assignedBy: string
  ) {
    const { data } = await client.models.Permission.create({
      RoleID: `ROLE-${Date.now()}`,
      UserID: email,
      Email: email,
      Name: name,
      AllowedActions: allowedActions,
      AssignedBy: assignedBy,
    });
    return {
      UserID: data?.UserID ?? email,
      Email: email,
      Name: name,
      AllowedActions: allowedActions,
      CreatedAt: data?.createdAt ?? new Date().toISOString(),
      AssignedBy: assignedBy,
    };
  },

  async updateHROfficerPermissions(userId: string, allowedActions: AllowedAction[]) {
    const { data: records } = await client.models.Permission.list({
      filter: { UserID: { eq: userId } },
    });
    if (!records || records.length === 0) throw new Error("Officer not found");
    const { data } = await client.models.Permission.update({
      id: records[0].id,
      AllowedActions: allowedActions,
    });
    return data;
  },

  async deleteHROfficer(userId: string) {
    const { data: records } = await client.models.Permission.list({
      filter: { UserID: { eq: userId } },
    });
    if (!records || records.length === 0) return;
    await client.models.Permission.delete({ id: records[0].id });
  },
};
