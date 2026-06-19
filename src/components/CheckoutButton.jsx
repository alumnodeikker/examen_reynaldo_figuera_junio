"use client";

export default function CheckoutButton() {
  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al obtener la pasarela de pago.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="w-full px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
    >
      Comprar por 25.00 &euro;
    </button>
  );
}