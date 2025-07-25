import { NextRequest, NextResponse } from "next/server";
import { smpClient, initializeSMPClient } from "@/smpClient";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    await initializeSMPClient();
    const response = await smpClient.Password.resetPassword({ token, newPassword });

    return NextResponse.json({
      success: response.success,
      message: response.message || (response.success
        ? "Password reset successfully."
        : "Failed to reset password.")
    });
  } catch (error) {
    console.error("Erreur API /resetPassword:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to reset password. Please try again."
    });
  }
}
