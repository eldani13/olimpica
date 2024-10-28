import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const Table = ({ onProductsChange }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (onProductsChange) {
      onProductsChange(products);
    }
  }, [products, onProductsChange]);

  const updateProductDays = async (sap, days) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${sap}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ days }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar el producto: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (sap, day, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.sap === sap
          ? { ...product, days: { ...product.days, [day]: value } }
          : product
      )
    );

    const productToUpdate = products.find((product) => product.sap === sap);
    if (productToUpdate) {
      const updatedDays = { ...productToUpdate.days, [day]: value };
      updateProductDays(sap, updatedDays);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <img
          src={logo}
          alt="Logo"
          className="h-14 w-14 rounded-full border-2 border-gray-300 p-1 shadow-sm transform transition duration-300 hover:scale-105"
        />
        <h1 className="text-3xl font-extrabold text-center text-gray-900 tracking-wide">
          Registro de Productos
        </h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          className="border rounded-md p-2 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md hidden md:table">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-2 sm:px-4">SAP</th>
              <th className="py-3 px-2 sm:px-4">Producto</th>
              <th className="py-3 px-2 sm:px-4">Lunes</th>
              <th className="py-3 px-2 sm:px-4">Martes</th>
              <th className="py-3 px-2 sm:px-4">Miércoles</th>
              <th className="py-3 px-2 sm:px-4">Jueves</th>
              <th className="py-3 px-2 sm:px-4">Viernes</th>
              <th className="py-3 px-2 sm:px-4">Sábado</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.sap}
                className="border-b hover:bg-gray-100 transition duration-300"
              >
                <td className="border px-2 py-2 sm:px-4">{product.sap}</td>
                <td className="border px-2 py-2 sm:px-4">{product.name}</td>
                {Object.keys(product.days).map((day) => (
                  <td className="border px-2 py-2 sm:px-4" key={day}>
                    <input
                      type="text"
                      value={product.days[day]}
                      onChange={(e) =>
                        handleInputChange(product.sap, day, e.target.value)
                      }
                      className="border rounded-md p-1 w-full"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="md:hidden">
          <div className="border-b mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg shadow-lg w-fit">
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between text-gray-700 font-semibold text-sm min-w-max rounded-lg overflow-hidden shadow-md">
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  SAP
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  NOMBRE
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  L
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  M
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  M
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  J
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  V
                </span>
                <span className="w-24 text-center bg-gray-300 py-2 font-bold">
                  S
                </span>
              </div>

              {filteredProducts.map((product) => (
                <div
                  key={product.sap}
                  className="flex items-center justify-between text-gray-800 text-sm font-medium min-w-max mt-2 border-b last:border-b-0 py-2 hover:bg-gray-100 transition duration-300 rounded-lg"
                >
                  <span className="w-24 text-center font-semibold">
                    {product.sap}
                  </span>
                  <span className="w-24 text-center font-semibold">
                    {product.name}
                  </span>
                  {Object.keys(product.days).map((day) => (
                    <span className="w-24 text-center" key={day}>
                      <input
                        type="text"
                        value={product.days[day]}
                        onChange={(e) =>
                          handleInputChange(product.sap, day, e.target.value)
                        }
                        className="border rounded-md p-1 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
