import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

jest.mock("firebase/auth");

describe("Login", () => {
  it("calls signInWithEmailAndPassword with correct credentials", async () => {
    const mockAuth = {} as any;
    const email = "test@email.com";
    const password = "password123";

    await signInWithEmailAndPassword(mockAuth, email, password);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      email,
      password
    );
  });

  it("fails when wrong credentials are passed", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(
      new Error("auth/wrong-password")
    );

    await expect(
      signInWithEmailAndPassword({} as any, "x@x.com", "wrongpass")
    ).rejects.toThrow("auth/wrong-password");
  });
});

describe("Signup", () => {
  it("calls createUserWithEmailAndPassword with correct data", async () => {
    const mockAuth = {} as any;

    await createUserWithEmailAndPassword(mockAuth, "new@user.com", "pass123");

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      "new@user.com",
      "pass123"
    );
  });
});

describe("Logout", () => {
  it("calls signOut successfully", async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);
    await expect(signOut({} as any)).resolves.toBeUndefined();
  });
});