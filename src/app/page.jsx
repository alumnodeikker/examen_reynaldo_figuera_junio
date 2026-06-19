import { auth, signIn, signOut } from "@/auth";
import CheckoutButton from "@/components/CheckoutButton";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
        {!session ? (
          <div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Tienda con login</h1>
            <p className="mb-6 text-sm text-gray-600">
              Inicia sesion con tu cuenta para acceder a la pasarela de pago.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn();
              }}
            >
              <button
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                type="submit"
              >
                Iniciar sesion
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-400">
              Prueba con: reynaldo@gmail.com / 123456
            </p>
          </div>
        ) : (
          <div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-600">
              Sesion activa
            </span>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Hola, {session.user.name}
            </h2>
            <p className="mb-6 text-xs text-gray-500">{session.user.email}</p>

            <div className="my-6 border-y border-gray-100 py-6 text-left">
              <h3 className="font-semibold text-gray-800">Curso Premium</h3>
              <p className="mb-4 mt-1 text-xs text-gray-600">
                Tu compra quedara vinculada a tu usuario.
              </p>
              <CheckoutButton />
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link className="text-sm font-medium text-blue-700" href="/mis-pedidos">
                Mis pedidos
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="text-sm text-red-500 hover:underline" type="submit">
                  Cerrar sesion
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
