import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Table from "../components/Table";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FaFileExcel, FaUser, FaRedo } from "react-icons/fa";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

const Home = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("https://backend-olimpica.onrender.com/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error("Error al obtener los datos del usuario", error);
        });
    }
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token no encontrado en localStorage.");
      return null;
    }

    try {
      console.log("Token encontrado:", token);
      const payloadBase64 = token.split(".")[1];
      console.log("Payload Base64:", payloadBase64);
      const decodedPayload = JSON.parse(atob(payloadBase64));
      console.log("Decoded Payload:", decodedPayload);
      return decodedPayload.id || null;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  };

  const generateExcel = async () => {
    const userId = getUserIdFromToken();
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.error("No se pudo obtener el userId o el token.");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-olimpica.onrender.com/api/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }

      const data = await response.json();

      console.log("Respuesta completa de los productos:", data);

      const productosFiltrados = data.filter(
        (product) => product.userId === userId
      );

      if (productosFiltrados.length === 0) {
        console.log(`No se encontraron productos para el userId: ${userId}`);
        return;
      }

      console.log(
        `Productos asociados al userId ${userId}:`,
        productosFiltrados
      );

      const processedData = productosFiltrados.map((product) => {
        const dias = product.days || {};
        return {
          SAP: product.sap,
          NOMBRE: product.name,
          LUNES: dias.lunes || 0,
          MARTES: dias.martes || 0,
          MIERCOLES: dias.miercoles || 0,
          JUEVES: dias.jueves || 0,
          VIERNES: dias.viernes || 0,
          SABADO: dias.sabado || 0,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(processedData);

      const workbook = XLSX.utils.book_new();
      const fileName = `productos_${userId}_${getCurrentDate().replace(
        /\//g,
        "-"
      )}.xlsx`;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

      XLSX.writeFile(workbook, fileName);

      console.log(
        `Archivo Excel generado exitosamente para userId ${userId}: ${fileName}`
      );
    } catch (error) {
      console.error("Hubo un error al generar el archivo Excel:", error);
    }
  };

  const resetTableValues = () => {
    setConfirmModalOpen(true);
  };

  const handleReset = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      console.error("Token o userId no encontrados");
      return;
    }

    try {
      const response = await fetch(
        "https://backend-olimpica.onrender.com/api/products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }

      const data = await response.json();

      const productosFiltrados = data.filter(
        (product) => product.userId === userId
      );

      if (productosFiltrados.length === 0) {
        console.log(`No se encontraron productos para el userId: ${userId}`);
        return;
      }

      const resetProducts = productosFiltrados.map((product) => ({
        ...product,
        days: {
          lunes: 0,
          martes: 0,
          miercoles: 0,
          jueves: 0,
          viernes: 0,
          sabado: 0,
        },
      }));

      setProducts(resetProducts);
      console.log("Productos después de resetear:", resetProducts);

      await Promise.all(
        resetProducts.map(async (product) => {
          const response = await fetch(
            `https://backend-olimpica.onrender.com/api/products/${product.sap}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ days: product.days }),
            }
          );

          if (!response.ok) {
            throw new Error(`Error al actualizar el producto ${product.sap}`);
          }

          return response.json();
        })
      );

      setSuccessModalOpen(true);
    } catch (error) {
      console.error(
        "Error al resetear los valores de los días en el servidor",
        error
      );
    }

    setConfirmModalOpen(false);
  };

  // const token = localStorage.getItem("token");
  // const userId = getUserIdFromToken();

  // if (userId && token) {
  //   axios
  //     .get(`https://backend-olimpica.onrender.com/api/products`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       console.log("Productos obtenidos:", response.data);
  //       setProducts(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error al obtener productos:", error);
  //     });
  // }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 mb-6 bg-gradient-to-r from-[#005caa] to-[#e30613] shadow-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide drop-shadow-lg text-center sm:text-left">
          Gestión de productos
        </h1>
        <div className="text-white font-medium flex gap-2 sm:gap-4 mt-4 sm:mt-0">
          <span className="bg-white flex justify-center items-center gap-1 text-blue-700 text-sm sm:text-base font-semibold px-4 py-2 rounded-full shadow-md hover:bg-red-100 transition duration-200 ease-in-out transform hover:scale-105">
            <FaUser />
            {username ? username : "Busc..."}
          </span>
          <button
            onClick={logout}
            className="bg-white text-sm sm:text-base text-blue-700 font-semibold px-4 py-2 rounded-full shadow-md hover:bg-red-100 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <h2 className="text-2xl text-center font-extrabold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
          Tabla de Productos
        </h2>
        <h1 className="text-lg text-left ml-5 font-medium text-gray-600 mb-4">
          {getCurrentDate()}
        </h1>

        <div className="flex">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="bg-gradient-to-r ml-5 from-green-500 to-emerald-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-md hover:from-green-600 hover:to-emerald-600 transform transition duration-200 ease-in-out hover:scale-105 mb-4"
          >
            <FaFileExcel className="text-xl" />
            Generar Excel
          </button>
          <button
            onClick={resetTableValues}
            className="bg-gradient-to-r ml-5 from-blue-500 to-red-500 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-md hover:from-red-600 hover:to-emerald-600 transform transition duration-200 ease-in-out hover:scale-105 mb-4"
          >
            <FaRedo />
            Reiniciar
          </button>
        </div>

        <Modal
          isOpen={confirmModalOpen}
          onRequestClose={() => setConfirmModalOpen(false)}
          contentLabel="Confirmación"
          className="bg-white p-6 rounded shadow-md mx-auto mt-24 w-80"
        >
          <h2 className="text-xl font-bold mb-4 text-center">¿Estás seguro?</h2>
          <p className="mb-4 text-center">
            ¿Deseas reiniciar los valores de los productos?
          </p>
          <div className="flex flex-row gap-10 justify-center items-center">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Reiniciar
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={excelModalOpen}
          onRequestClose={() => setExcelModalOpen(false)}
          contentLabel="Generar Excel"
          className="bg-white p-6 rounded shadow-md mx-auto mt-24 w-80"
        >
          <h2 className="text-xl font-bold mb-4 text-center">
            Generar archivo Excel
          </h2>
          <p className="mb-4 text-center">
            ¿Deseas generar el archivo Excel con los productos?
          </p>
          <div className="flex flex-row gap-10 justify-center items-center">
            <button
              onClick={() => setExcelModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={generateExcel}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Generar
            </button>
          </div>
        </Modal>

        <Modal
          isOpen={successModalOpen}
          onRequestClose={() => setSuccessModalOpen(false)}
          contentLabel="Éxito"
          className="bg-white p-6 rounded shadow-md mx-auto mt-24 w-1/2"
        >
          <h2 className="text-xl font-bold mb-4 text-center">¡Éxito!</h2>
          <p className="mb-4 text-center">
            Los valores de los productos se han restablecido correctamente.
          </p>
          <div className="flex flex-row gap-10 justify-center items-center">
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Aceptar
            </button>
          </div>
        </Modal>

        <Table data={products} />
      </div>
    </div>
  );
};

export default Home;
