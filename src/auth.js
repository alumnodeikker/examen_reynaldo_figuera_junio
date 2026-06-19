import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        // Usuario simulado para la practica.
        if (
          credentials?.email === "reynaldo@gmail.com" &&
          credentials?.password === "123456"
        ) {
          return {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Reynaldo Figuera",
            email: "reynaldo@gmail.com",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
